<script>
import _ from 'lodash';
import { clone } from '@/utils/object';
import { sortBy } from '@/utils/sort';
import { NETWORK_ATTACHMENT } from '@/config/types';
import VMModal from '@/components/form/VMModal';
import PortInputGroup from '@/components/form/PortInputGroup';

export default {
  components: {
    VMModal,
    PortInputGroup
  },

  props: {
    value: {
      type:    Array,
      default: () => {
        return {};
      }
    },
    namespace: {
      type:    String,
      default: ''
    },
    rowActions: {
      type:    Boolean,
      default: true
    }
  },

  data() {
    const validateName = (rule, value, callback) => {
      const arr = _.filter(this.rows, (o, index) => {
        return value === o.name;
      });

      if ((arr?.length > 0 && this.type === 'add') || (arr?.length > 1)) {
        const message = this.$store.getters['i18n/t']('virtualMachine.validation.repeat', { name: 'Network' });

        callback(new Error(message));
      } else if (value.length > 20) {
        const message = this.$store.getters['i18n/t']('validation.custom.tooLongName', { max: 20 });

        callback(new Error(message));
      } else {
        callback();
      }
    };

    return {
      rows:       clone(this.value),
      type:       'add',
      rowIndex:   0,
      errors:     [],
      currentRow: {},
      rules:      {
        name:      [
          { required: true, trigger: 'blur' },
          { validator: validateName, trigger: 'change' }
        ],
        networkName:  [{ required: true }],
        macAddress:   [{ validator: this.validateMac, trigger: 'change' }],
      },
    };
  },

  computed: {
    headers() {
      return [{
        name:     'name',
        label:    'Name',
        value:    'name',
      },
      {
        name:     'model',
        label:    'Model',
        value:    'model',
      },
      {
        name:     'network',
        label:    'Network',
        value:    'networkName',
      },
      {
        name:     'type',
        label:    'Type',
        value:    'type',
      },
      {
        name:     'macAddress',
        label:    'MAC Address',
        value:    'macAddress',
      },
      {
        name:      'ports',
        label:     'Ports',
        value:     'ports',
        formatter: 'Ports'
      }];
    },

    modelOption() {
      return [{
        label: 'virtio',
        value: 'virtio'
      },
      {
        label: 'e1000',
        value: 'e1000'
      },
      {
        label: 'e1000e',
        value: 'e1000e'
      },
      {
        label: 'ne2k_pci',
        value: 'ne2k_pci'
      },
      {
        label: 'pcnet',
        value: 'pcnet'
      },
      {
        label: 'rtl8139',
        value: 'rtl8139'
      }];
    },

    networkOption() {
      const choices = this.$store.getters['cluster/all'](NETWORK_ATTACHMENT);

      const out = sortBy(
        choices
          .filter(C => C.metadata.namespace === this.namespace)
          .map((obj) => {
            return {
              label: obj.metadata.name,
              value: obj.metadata.name
            };
          }),
        'label'
      );

      const findPodIndex = _.findIndex(this.rows, (o) => {
        return o.networkName === 'Pod Network';
      });

      if (findPodIndex === -1 || (findPodIndex !== -1 && this.rows.length === 1 && this.type !== 'add' )) {
        out.push({
          label: 'Pod Network',
          value: 'Pod Network'
        });
      }

      return out;
    },

    isMasquerade() {
      return this.currentRow.networkName === 'Pod Network';
    },

    typeOpton() {
      if (this.currentRow.networkName === 'Pod Network') {
        return [{
          label: 'masquerade',
          value: 'masquerade'
        }, {
          label: 'bridge',
          value: 'bridge'
        }];
      }

      return [{
        label: 'bridge',
        value: 'bridge'
      },
      {
        label: 'sriov',
        value: 'sriov'
      }];
    },
  },

  watch: {
    value(neu) {
      this.rows = neu;
    },
    'currentRow.networkName'(neu) {
      if (neu === 'Pod Network' && this.currentRow.masquerade) {
        this.currentRow.type = 'masquerade';
      } else {
        this.currentRow.type = 'bridge';
      }
    }
  },

  methods: {
    updateAdd() {
      if (this.type === 'add') {
        this.rows.splice(this.rowIndex, 0, this.currentRow);
      } else if (this.type === 'delete') {
        this.rows.splice(this.rowIndex, 1);
      } else {
        this.rows.splice(this.rowIndex, 1, this.currentRow);
      }

      this.rows.forEach((o, index) => {
        o.index = index;
      });

      this.$emit('input', this.rows);
    },
    beforeCancel() {
      this.$set(this, 'errors', []);
    },
    updateIndex(index, type) {
      this.rowIndex = index;
      this.type = type;
      const networkName = this.networkOption?.[0]?.value || '';

      this.currentRow = clone(this.rows[this.rowIndex]) || {
        name: `nic-${ index }`, model: 'virtio', networkName, type: 'bridge'
      };
    },

    validateRules() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          this.$refs.modal.passValidate = true;
        } else {
          this.$refs.modal.passValidate = false;
        }
      });
    },

    validateError() {
      const portsValidater = this.validatePorts();

      if (!portsValidater.status) {
        if (portsValidater.message === 'exist') {
          return this.errors.splice(0, 1, this.$store.getters['i18n/t']('validation.ports.exist'));
        }

        return this.getInvalidMsg('Port Number');
      }

      if (!this.errors.length > 0) {
        this.$set(this, 'errors', []);
      }
    },

    validateMac(rule, value, callback) {
      if (this.currentRow.networkName === 'Pod Network' || !value) {
        callback();

        return;
      }
      if (!/^[A-F0-9]{2}(-[A-F0-9]{2}){5}$|^[A-F0-9]{2}(:[A-F0-9]{2}){5}$/.test(value)) {
        const message = 'Invalid MAC address format.';

        callback(new Error(message));
      } else {
        callback();
      }
    },

    validatePorts() {
      if (!this.currentRow.ports || this.currentRow.length === 0 || !this.isMasquerade) {
        return { status: true };
      }

      const officer = new Set();

      for (const p of this.currentRow.ports) {
        if (!p.port) {
          return { status: false };
        }

        officer.add(parseInt(p.port));
      }

      if (officer.size !== this.currentRow.ports.length) {
        return { status: false, message: 'exist' };
      }

      return { status: true };
    },

    getInvalidMsg(key) {
      this.errors.splice(0, 1, this.$store.getters['i18n/t']('validation.required', { key }));
    }
  }
};
</script>

<template>
  <div>
    <VMModal
      ref="modal"
      :row-actions="rowActions"
      modal-name="network"
      :title="type === 'add' ? 'Add Network Interface' : 'Edit Network Interface'"
      :rows="rows"
      :headers="headers"
      button-text="Add Network Interface"
      :errors="errors"
      @update:cancel="beforeCancel"
      @update:add="updateAdd"
      @update:index="updateIndex"
      @validateRules="validateRules"
    >
      <template v-slot:content>
        <a-form-model ref="ruleForm" :model="currentRow" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
          <a-form-model-item label="Name" prop="name">
            <a-input v-model="currentRow.name" />
          </a-form-model-item>

          <a-form-model-item label="Model">
            <a-select
              v-model="currentRow.model"
              :options="modelOption"
            />
          </a-form-model-item>

          <a-form-model-item label="Network" prop="networkName">
            <a-select v-model="currentRow.networkName" :options="networkOption" />
          </a-form-model-item>

          <a-form-model-item label="Type">
            <a-select v-model="currentRow.type" :options="typeOpton" />
          </a-form-model-item>

          <a-form-model-item v-if="!isMasquerade" label="Mac Address" prop="macAddress">
            <a-input v-model="currentRow.macAddress">
              <a-tooltip slot="suffix" title="Protip: MAC address as seen inside the guest system.">
                <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
              </a-tooltip>
            </a-input>
          </a-form-model-item>

          <PortInputGroup v-if="currentRow.type === 'masquerade'" v-model="currentRow" />
        </a-form-model>
      </template>
    </VMModal>
  </div>
</template>
