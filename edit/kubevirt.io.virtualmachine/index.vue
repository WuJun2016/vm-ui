<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import { cleanForNew } from '@/plugins/steve/normalize';
import { safeLoad } from 'js-yaml';
import Footer from '@/components/form/Footer';
import AddSSHKey from '@/components/form/AddSSHKey';
import DiskModal from '@/components/form/DiskModal';
import NetworkModal from '@/components/form/NetworkModal';
import TextAreaAutoGrow from '@/components/form/TextAreaAutoGrow';
import { VM_TEMPLATE, VM, IMAGE } from '@/config/types';
import MemoryUnit from '@/components/form/MemoryUnit';
import CreateEditView from '@/mixins/create-edit-view';
import VM_MIXIN from '@/mixins/vm';
import NameDescriptionCount from './NameDescriptionCount';
import CloudConfig from './CloudConfig';
import ChooseImage from './ChooseImage';

const baseSpec = {
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
          interfaces: [{
            masquerade: {},
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

export default {
  name: 'EditVM',

  components: {
    Footer,
    DiskModal,
    MemoryUnit,
    AddSSHKey,
    ChooseImage,
    CloudConfig,
    NetworkModal,
    NameDescriptionCount,
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
      spec = _.cloneDeep(baseSpec);
      this.value.spec = spec;
    }

    return {
      isSingle:              true,
      count:                 1,
      realHostname:          '',
      spec,
      templateName:          '',
      templateVersion:       '',
      namespace:             'default',
      isRunning:             true,
      useTemplate:           false,
      pageType:              'vm',
      isLanuchFromTemplate:     false,
      isUseMouseEnhancement:    false
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
      const templateId = this.templateName;
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
          const oldCloudConfig = safeLoad(this.getCloudInit());

          oldCloudConfig.hostname = neu;

          this.$set(this.spec.template.spec, 'hostname', neu);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log('---watch hostname has error');
        }
      }
    },

    modeOption() {
      return [
        { label: 'Single Instance', value: true },
        { label: 'Multiple Instance', value: false }
      ];
    },

    nameLabel() {
      return this.isSingle ? 'Name' : 'Prefix Name';
    },

    hostnameLabel() {
      return this.isSingle ? 'Host Name' : 'Host Prefix Name';
    },

    ...mapGetters({ t: 'i18n/t' })
  },

  watch: {
    async templateVersion(version) {
      const choices = await this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.version });

      const id = version;
      const templateSpec = choices.find( (V) => {
        return V.id === id;
      });
      const sshKey = [];

      if (templateSpec.spec?.keyPairIds?.length > 0) {
        templateSpec.spec.keyPairIds.map( (O) => {
          const ssh = O.split('/')[1];

          sshKey.push(ssh);
        });
      }

      const cloudScript = templateSpec?.spec?.vm?.template?.spec?.volumes?.find( (V) => {
        return V.cloudInitNoCloud !== undefined;
      })?.cloudInitNoCloud;

      this.$set(this, 'userScript', cloudScript?.userData);
      this.$set(this, 'networkScript', cloudScript?.networkData);
      this.$set(this, 'sshKey', sshKey);
      this.$refs.ssh.updateSSH(sshKey);
      this.$set(this, 'spec', templateSpec.spec.vm);
    },

    async templateName(id) {
      const choices = await this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.template });
      const template = choices.find( O => O.id === id);

      if (template.spec.defaultVersionId && !this.isLanuchFromTemplate) {
        this.templateVersion = template.spec.defaultVersionId;
      }

      this.isLanuchFromTemplate = false;
    },
    useTemplate(neu) {
      if (!neu) {
        const spec = _.cloneDeep(baseSpec);

        this.$set(this, 'spec', spec);
        this.$set(this.value, 'spec', spec);
        this.templateName = this.templateVersion = '';
      }
    },
    isUseMouseEnhancement(neu) {
      if (neu) {
        Object.assign(this.spec.template.spec.domain.devices, {
          inputs: [{
            bus:  'usb',
            name: 'tablet',
            type: 'tablet'
          }]
        });
      } else {
        this.$delete(this.spec.template.spec.domain.devices, 'inputs');
      }
    }
  },

  created() {
    this.imageName = this.$route.query?.image || '';
    this.registerAfterHook(() => { // when fetch end, need add type to find correct schema
      this.$set(this.value, 'type', VM);

      if (!this.isSingle) {
        this.getClone();
      }
    });
    this.registerBeforeHook(this.validateBefore, 'validate');
  },

  mounted() {
    this.getImages();
    if (this.$route.query?.templateId) {
      this.templateName = this.$route.query?.templateId;
      this.templateVersion = this.$route.query?.version;
      this.isLanuchFromTemplate = true;
      this.useTemplate = true;
    }
  },

  methods: {
    saveVM(buttonCb) {
      const url = `v1/${ VM }s`;

      this.normalizeSpec();
      const realHostname = this.realHostname || this.value.spec.template.spec.hostname || this.value.metadata.name;

      this.$set(this.value.spec.template.spec, 'hostname', realHostname);
      const noFetch = !this.isSingle;

      this.save(buttonCb, url, noFetch);
    },

    validateBefore(buttonCb) {
      if (!this.imageName) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Image' })];

        return false;
      }

      if (!this.spec.template.spec.domain.cpu.cores) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Cpu' })];

        return false;
      }

      if (!this.memory.match(/[0-9]/)) {
        this.errors = [this.$store.getters['i18n/t']('validation.required', { key: 'Memory' })];

        return false;
      }
      this.$delete(this.value, 'type'); // vm api don't type attribuet, the error will be reported

      return true;
    },

    getImages() {
      this.$store.dispatch('cluster/findAll', { type: IMAGE });
    },

    async getClone() {
      const baseName = this.value.metadata.name;
      const baseHostname = this.realHostname || this.value.spec.template.spec.hostname || this.value.metadata.name;
      const join = baseName.endsWith('-') ? '' : '-';
      const countLength = this.count.toString().length;

      for (let i = 1; i <= this.count; i++) {
        const suffix = i?.toString()?.padStart(countLength, '0');

        cleanForNew(this.value);

        this.value.metadata.name = `${ baseName }${ join }${ suffix }`;
        const hostname = `${ baseHostname }${ join }${ suffix }`;

        this.normalizeSpec();
        this.$set(this.value.spec.template.spec, 'hostname', hostname);
        this.$delete(this.value, 'type');
        await this.value.save({ url: `v1/${ VM }s` });
      }
      this.value.id = '';
    },
    validateMax(value) {
      if (value > 100) {
        this.$set(this.spec.template.spec.domain.cpu, 'cores', 100);
      }
    }
  },
};
</script>

<template>
  <a-card>
    <a-form-model layout="vertical">
      <a-radio-group v-model="isSingle" class="mb-15" :options="modeOption" />

      <NameDescriptionCount
        v-model="value"
        :mode="mode"
        :has-extra="!isSingle"
        :name-label="nameLabel"
        :extra-columns="['type']"
      >
        <template v-slot:type>
          <a-form-item label="Count" required>
            <a-input-number
              v-if="!isSingle"
              v-model="count"
              style="width: 100%"
              :min="1"
              :max="10"
            />
          </a-form-item>
        </template>
      </NameDescriptionCount>

      <a-checkbox v-model="useTemplate" :class="{ 'mb-10': true, 'mb-20': !useTemplate }">
        Use VM Template:
      </a-checkbox>

      <div v-if="useTemplate" class="row">
        <div class="col span-6">
          <a-form-model-item label="template">
            <a-select
              v-model="templateName"
              style="width: 100%"
              :options="templateOption"
            >
            </a-select>
          </a-form-model-item>
        </div>

        <div class="col span-6">
          <a-form-model-item label="version">
            <a-select
              v-model="templateVersion"
              style="width: 100%"
              :options="versionOption"
            >
            </a-select>
          </a-form-model-item>
        </div>
      </div>

      <ChooseImage v-model="imageName" class="mb-15" />

      <h2>CPU & Memory:</h2>
      <div class="row">
        <div class="col span-6">
          <a-form-model-item label="CPU (core)" required>
            <a-input-number v-model="spec.template.spec.domain.cpu.cores" style="width: 100%" :min="1" :max="100" />
          </a-form-model-item>
        </div>

        <div class="col span-6">
          <MemoryUnit v-model="memory" label="Memory" :value-col="8" :unit-col="4" />
        </div>
      </div>

      <div class="spacer"></div>

      <h2>Disks:</h2>
      <DiskModal v-model="diskRows" class="vm__disk-modal" :namespace="value.metadata.namespace" />

      <div class="spacer"></div>

      <h2>Networks:</h2>
      <NetworkModal v-model="networkRows" :namespace="value.metadata.namespace" />

      <div class="spacer"></div>

      <h2>Authentication:</h2>
      <AddSSHKey ref="ssh" :ssh-key="sshKey" @update:sshKey="updateSSHKey" />

      <div class="spacer"></div>

      <a-collapse class="mb-10">
        <a-collapse-panel key="1" header="Advanced Details">
          <a-form-model-item :label="hostnameLabel">
            <a-input v-model="hostname" placeholder="default to the virtual machine name.">
              <a-tooltip slot="suffix" title="Give an identifying name you will remember them by. Your hostname name can only contain alphanumeric characters, dashes.">
                <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
              </a-tooltip>
            </a-input>
          </a-form-model-item>

          <CloudConfig :user-script="userScript" :network-script="networkScript" class="mb-10" @updateCloudConfig="updateCloudConfig" />

          <a-checkbox v-model="isUseMouseEnhancement" class="mb-10">
            Use mouse enhancement
          </a-checkbox>
        </a-collapse-panel>
      </a-collapse>

      <a-checkbox v-model="isRunning" class="mb-10">
        Start virtual machine on creation
      </a-checkbox>
      <Footer :mode="mode" :errors="errors" @save="saveVM" @done="done" />
    </a-form-model>
  </a-card>
</template>

<style lang="scss">
#vm {
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
