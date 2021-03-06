<script>
/* eslint-disable */
import _ from 'lodash';
import moment from 'moment';
import randomstring from 'randomstring';
import { safeLoad, safeDump } from 'js-yaml';
import Footer from '@/components/form/Footer';
import NameNsDescription from '@/components/form/NameNsDescription';
import Collapse from '@/components/Collapse';
import Checkbox from '@/components/form/Checkbox';
import AddSSHKey from '@/components/form/AddSSHKey';
import DiskModal from '@/components/form/DiskModal';
import LabeledInput from '@/components/form/LabeledInput';
import NetworkModal from '@/components/form/NetworkModal';
import LabeledSelect from '@/components/form/LabeledSelect';
import TextAreaAutoGrow from '@/components/form/TextAreaAutoGrow';
import { VM_TEMPLATE, VM, IMAGE } from '@/config/types';
import MemoryUnit from '@/components/form/MemoryUnit';
import CreateEditView from '@/mixins/create-edit-view';
import VM_MIXIN from '@/mixins/vm';
import ChooseImage from './ChooseImage';

export default {
  name: 'EditVM',

  components: {
    Footer,
    Checkbox,
    Collapse,
    DiskModal,
    MemoryUnit,
    AddSSHKey,
    ChooseImage,
    NetworkModal,
    NameNsDescription,
    LabeledInput,
    LabeledSelect,
    TextAreaAutoGrow,
  },

  mixins: [CreateEditView, VM_MIXIN],

  props: {
    value: {
      type:     Object,
      required: true,
    },
  },

  data() {
    let spec = this.value.spec;

    this.value.metadata.labels = { 'harvester.cattle.io/creator': 'harvester' };

    if ( !spec ) {
      spec = {
        dataVolumeTemplates: [],
        running:             true,
        template:            {
          spec:     {
            domain: {
              cpu: {
                cores:   null,
                sockets: 1,
                threads: 1
              },
              devices: {
                inputs: [{
                  bus:  'usb',
                  name: 'tablet',
                  type: 'tablet'
                }],
                interfaces: [{
                  bridge: {},
                  model:      'virtio',
                  name:       'default'
                }],
                disks: [],
              },
              resources: { requests: { memory: '' } }
            },
            hostname: '',
            networks: [{
              name: 'default',
              pod:  {}
            }],
            volumes: []
          }
        }
      };
      this.value.spec = spec;
    }

    return {
      spec,
      templateName:         '',
      templateVersion:      '',
      namespace:            'default',
      isRunning:            true,
      useTemplate:          false,
      pageType:             'vm',
      isLanuchFromTemplate:     false
    };
  },

  computed: {
    templateOption() {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.template);

      return choices.map( (T) => {
        return {
          label: T.metadata.name,
          value: T.id
        };
      });
    },

    curTemplateResource() {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.template);

      return choices.find( O => O.id === this.templateName);
    },

    curVersionResource() {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.version);

      return choices.find( O => O.id === this.templateVersion);
    },

    versionOption() {
      const choices = this.$store.getters['cluster/all'](VM_TEMPLATE.version);
      const templateId = this.templateName.replace('/', ':');
      const defaultVersionNumber = this.curTemplateResource?.defaultVersionNumber;

      return choices.filter( O => O.spec.templateId === templateId).map( (T) => {
        const version = T?.status?.version; // versionNumber
        const label = defaultVersionNumber === version ? `${ version } (default)` : version; // ns:name
        const value = T.id;

        return {
          label,
          value
        };
      });
    },

    hostname: {
      get() {
        return this.spec.template.spec.hostname;
      },
      set(neu) {
        try {
          const oldCloudConfig = safeLoad(this.cloudInit);

          oldCloudConfig.hostname = neu;
          const neuCloudConfig = safeDump(oldCloudConfig);

          this.$set(this.spec.template.spec, 'hostname', neu);
          this.$set(this, 'cloudInit', neuCloudConfig);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log('---watch hostname has error');
        }
      }
    },
  },

  watch: {
    async templateVersion(version) {
      const choices = await this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.version });

      const id = version.replace(':', '/');
      const templateSpec = choices.find( (V) => {
        return V.id === id;
      });
      const sshKey = [];

      if (templateSpec.spec?.keyPairIds?.length > 0) {
        templateSpec.spec.keyPairIds.map( (O) => {
          const ssh = O.split(':')[1];

          sshKey.push(ssh);
        });
      }
      this.$set(this, 'sshKey', sshKey);
      this.$set(this, 'spec', templateSpec.spec.vm);
    },

    async templateName(id) {
      const choices = await this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.template });
      const template = choices.find( O => O.id === id);

      if (template.spec.defaultVersionId && !this.isLanuchFromTemplate) {
        this.templateVersion = template.spec.defaultVersionId.replace(':', '/');
      }

      this.isLanuchFromTemplate = false;
    },
  },

  created() {
    this.imageName = this.$route.query?.image || '';
    this.registerAfterHook(() => { // when fetch end, need add type to find correct schema
      this.$set(this.value, 'type', VM);
    });
  },

  mounted() {
    this.getImages();
    if (this.$route.query?.templateId) {
      this.templateName = this.$route.query?.templateId;
      this.templateVersion = this.$route.query?.version?.replace(':', '/');
      this.isLanuchFromTemplate = true;
      this.useTemplate = true;
    }
  },

  methods: {
    saveVM(buttonCb) {
      const isPass = this.verifyBefSave(buttonCb);

      if (!isPass) {
        return;
      }

      this.$set(this.value, 'type', VM); // if not successed, need pass type prop to find something
      const url = `v1/${ VM }s`;

      const realHostname = this.value.spec.template.spec.hostname || this.value.metadata.name;

      this.$set(this.value.spec.template.spec, 'hostname', realHostname);

      this.normalizeSpec();
      this.$delete(this.value, 'type'); // vm api don't type attribuet, the error will be reported
      this.save(buttonCb, url);
    },

    verifyBefSave(buttonCb) {
      if (!this.imageName) {
        this.errors = ['Please select image!'];
        buttonCb(false);

        return false;
      }

      if (!this.spec.template.spec.domain.cpu.cores || !this.memory.match(/[0-9]/)) {
        this.errors = ['Required fields not completed!'];
        buttonCb(false);

        return false;
      }

      return true;
    },

    getImages() {
      this.$store.dispatch('cluster/findAll', { type: IMAGE });
    }
  },
};
</script>

<template>
  <el-card class="box-card">
    <div id="vm">
      <NameNsDescription
        v-model="value"
        :mode="mode"
        name-label="Name"
      />

      <div class="min-spacer"></div>
      <Checkbox v-model="useTemplate" class="check" type="checkbox" label="Use VM Template:" />

      <div v-if="useTemplate" class="row mb-20">
        <div class="col span-6">
          <LabeledSelect v-model="templateName" label="template" :options="templateOption" />
        </div>

        <div class="col span-6">
          <LabeledSelect v-model="templateVersion" label="version" :options="versionOption" />
        </div>
      </div>

      <div class="spacer"></div>

      <ChooseImage v-model="imageName" />

      <div class="spacer"></div>

      <h2>CPU & Memory:</h2>
      <div class="row">
        <div class="col span-6">
          <LabeledInput v-model.number="spec.template.spec.domain.cpu.cores" v-int-number type="number" label="CPU (core)" required />
        </div>

        <div class="col span-6">
          <MemoryUnit v-model="memory" value-name="Memory" :value-col="8" :unit-col="4" />
        </div>
      </div>

      <div class="spacer"></div>

      <h2>Disks:</h2>
      <DiskModal v-model="diskRows" class="vm__disk-modal" />

      <div class="spacer"></div>

      <h2>Networks:</h2>
      <NetworkModal v-model="networkRows" :namespace="value.metadata.namespace" />

      <div class="spacer"></div>

      <h2>Authentication:</h2>
      <AddSSHKey :ssh-key="sshKey" @update:sshKey="updateSSHKey" />

      <div class="spacer"></div>

      <Collapse :open.sync="showCloudInit" title="Advanced Options">
        <LabeledInput v-model="hostname" class="labeled-input--tooltip mb-20" required placeholder="default to the virtual machine name.">
          <template v-slot:label>
            <div>
              <span class="label">Host Name</span>
              <el-tooltip v-if="isCreate" placement="top" effect="dark">
                <div slot="content">
                  Give an identifying name you will remember them by. Your hostname name can only contain alphanumeric characters, dashes.
                </div>
                <span><i class="el-icon-info"></i></span>
              </el-tooltip>
            </div>
          </template>
        </LabeledInput>
        
        <h3>Startup Script:</h3>
        <TextAreaAutoGrow ref="value" v-model="startScript" :min-height="160" />
      </Collapse>

      <div class="spacer"></div>

      <div class="spacer"></div>
      <Checkbox v-model="isRunning" class="check" type="checkbox" label="Start virtual machine on creation" />
      <Footer :mode="mode" :errors="errors" @save="saveVM" @done="done" />
    </div>
  </el-card>
</template>

<style lang="scss">
#vm {
  .tip {
    color: #8e8e92;
  }

  .label {
    color: var(--input-label);
  }

  .sortable-table {
    border: 1px solid var(--input-border);
    border-radius: calc(3 * var(--border-radius));

    thead tr {
      background-color: rgb(247, 251, 252);
      height: 60px;

      th {
        padding-left: 20px;

        &:first-child {
          border-top-left-radius: calc(3 * var(--border-radius));
        }

        &:last-child {
          border-top-right-radius: calc(3 * var(--border-radius));
        }

        span {
          color: rgb(134, 196, 211);
        }
      }
    }

    tbody tr {
      td {
        height: 60px;
        padding-left: 20px;
        color: var(--help-text);

        &:last-child {
          padding-left: 0;
        }
      }
    }
  }
}
</style>
