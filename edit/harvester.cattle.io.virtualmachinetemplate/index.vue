<script>
import _ from 'lodash';
import Footer from '@/components/form/Footer';
import Collapse from '@/components/Collapse';
import Checkbox from '@/components/form/Checkbox';
import AddSSHKey from '@/components/form/AddSSHKey';
import DiskModal from '@/components/form/DiskModal';
import LabeledInput from '@/components/form/LabeledInput';
import NetworkModal from '@/components/form/NetworkModal';
import TextAreaAutoGrow from '@/components/form/TextAreaAutoGrow';
import MemoryUnit from '@/components/form/MemoryUnit';
import { VM_TEMPLATE } from '@/config/types';
import { allHash } from '@/utils/promise';
import VM_MIXIN from '@/mixins/vm';
import CreateEditView from '@/mixins/create-edit-view';
import { _EDIT, _CREATE, _ADD } from '@/config/query-params';
import ChooseImage from '../kubevirt.io.virtualmachine/ChooseImage';
import CloudConfig from '../kubevirt.io.virtualmachine/CloudConfig';

export default {
  name: 'EditVMTEMPLATE',

  components: {
    Footer,
    Collapse,
    MemoryUnit,
    AddSSHKey,
    DiskModal,
    CloudConfig,
    NetworkModal,
    ChooseImage
  },

  mixins: [CreateEditView, VM_MIXIN],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    let templateSpec = this.value.spec;
    const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.version);

    let spec = null;

    if (!templateSpec) {
      templateSpec = {
        description:      '',
        defaultVersionId: ''
      };
      this.$set(this.value, 'spec', templateSpec);
    } else {
      spec = choices.find( O => templateSpec.defaultVersionId === O.id )?.spec?.vm || null;
    }

    if ( !spec ) {
      spec = {
        dataVolumeTemplates: [],
        template:            {
          spec: {
            domain: {
              cpu: {
                cores:   null,
                sockets: 1,
                threads: 1
              },
              devices: {
                interfaces:                 [{
                  masquerade: {},
                  model:      'virtio',
                  name:       'default'
                }],
                disks: [],
              },
              resources: { requests: { memory: '' } }
            },
            networks: [{
              name: 'default',
              pod:  {}
            }],
            volumes: []
          }
        }
      };
    }

    return {
      spec,
      templateName:     '',
      templates:        [],
      versionName:      '',
      versionOption:    [],
      description:      '',
      templateVersion:  [],
      defaultVersion:   null,
      isRunning:        true,
      useTemplate:      false,
      isDefaultVersion:  false,
      keyPairIds:       [],
    };
  },

  computed: {
    isAdd() {
      return this.$route.query.type === _ADD;
    },
    allTemplate() {
      return this.$store.getters['cluster/all'](VM_TEMPLATE.template);
    },
  },

  watch: {
    sshKey(neu) {
      const out = [];

      this.ssh.map( (I) => {
        if (neu.includes(I.metadata.name)) {
          const name = `${ I.metadata.namespace }/${ I.metadata.name }`;

          out.push(name);
        }
      });
      this.keyPairIds = out;
    }
  },

  created() {
    this.registerAfterHook(() => {
      this.saveVersion();
    });
  },

  mounted() {
    const imageName = this.$route.query?.image || '';

    this.imageName = imageName;
  },

  methods: {
    async saveVMT(buttonCb) {
      const isPass = this.verifyBefSave(buttonCb);

      if (!isPass) {
        return;
      }

      if (this.isCreate) {
        delete this.value.metadata.namespace;
      }
      await this.save(buttonCb);

      this.normalizeSpec();
    },

    async saveVersion() {
      this.normalizeSpec();

      const versionInfo = await this.$store.dispatch('management/request', {
        method:  'POST',
        headers: {
          'content-type': 'application/json',
          accept:         'application/json',
        },
        url:  `v1/harvester.cattle.io.virtualmachinetemplateversions`,
        data: {
          apiVersion: 'harvester.cattle.io/v1alpha1',
          kind:       'harvester.cattle.io.virtualmachinetemplateversion',
          type:       'harvester.cattle.io.virtualmachinetemplateversion',
          spec:       {
            templateId: `harvester-system/${ this.value.metadata.name }`,
            keyPairIds: this.keyPairIds,
            vm:         { ...this.spec }
          }
        },
      });

      try {
        if (this.isDefaultVersion) {
          this.defaultVersionId = versionInfo.id;
          this.setVersion(this.defaultVersionId, () => {});
        }
      } catch (err) {
        const message = err.message;

        this.errors = [message];
      }
    },

    verifyBefSave(buttonCb) {
      if (!this.spec.template.spec.domain.cpu.cores) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Cpu' })];
        buttonCb(false);

        return false;
      }

      if (!this.memory.match(/[0-9]/)) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Memory' })];
        buttonCb(false);

        return false;
      }

      return true;
    },

    async setVersion(id, buttonCb) {
      this.value.spec.defaultVersionId = id;
      try {
        const data = [{
          op: 'replace', path: '/spec/defaultVersionId', value: id
        }];

        await this.value.patch( data, { url: this.value.linkFor('view') });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    }
  },
};
</script>

<template>
  <el-card class="box-card">
    <div id="vm">
      <a-form-model layout="vertical">
        <div class="row">
          <div class="col span-6">
            <a-form-model-item label="Template Name" required>
              <a-input v-model="value.metadata.name" :disabled="isAdd" label="Template Name" />
            </a-form-model-item>
          </div>

          <div class="col span-6">
            <a-form-model-item label="Description" required>
              <a-input v-model="value.spec.description" label="Description" />
            </a-form-model-item>
          </div>
        </div>

        <a-checkbox v-if="isAdd" v-model="isDefaultVersion" :class="{ 'mb-10': true, 'mb-20': !isAdd }">
          Default version:
        </a-checkbox>

        <ChooseImage v-model="imageName">
          <template v-slot:header>
            Choose an image(optional):
          </template>
        </ChooseImage>

        <div class="spacer"></div>

        <h2>CPU & Memory::</h2>
        <div class="row">
          <div class="col span-5">
            <a-form-model-item label="CPU Request(core)" required>
              <a-input-number v-model="spec.template.spec.domain.cpu.cores" style="width: 100%" :min="1" :max="100" />
            </a-form-model-item>
          </div>

          <div class="col span-7">
            <MemoryUnit v-model="memory" value-name="Memory" :value-col="8" :unit-col="4" />
          </div>
        </div>

        <div class="spacer"></div>

        <h2>Add disk storage:</h2>
        <DiskModal v-model="diskRows" owner="template" />

        <div class="spacer"></div>

        <h2>Networks:</h2>
        <NetworkModal v-model="networkRows" />

        <div class="spacer"></div>

        <h2>Authentication:</h2>
        <AddSSHKey :ssh-key="sshKey" @update:sshKey="updateSSHKey" />

        <div class="spacer"></div>

        <Collapse :open.sync="showCloudInit" title="Advanced Options">
          <CloudConfig @updateCloudConfig="updateCloudConfig" />
        </Collapse>
      </a-form-model>
      <Footer :mode="mode" :errors="errors" @save="saveVMT" @done="done" />
    </div>
  </el-card>
</template>
