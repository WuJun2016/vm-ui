<script>
import _ from 'lodash';
import VMModal from '@/components/form/VMModal';
import MemoryUnit from '@/components/form/MemoryUnit';
import { clone } from '@/utils/object';
import { sortBy } from '@/utils/sort';
import { SOURCE_TYPE, InterfaceOption } from '@/config/map';
import { NAMESPACE, DATA_VOLUME, STORAGE_CLASS, IMAGE } from '@/config/types';

const SUCCEEDED = 'Succeeded';

export default {
  components: { VMModal, MemoryUnit },

  props:      {
    value: {
      type:    Array,
      default: () => {
        return {};
      }
    },

    rowActions: {
      type:    Boolean,
      default: true
    },

    namespace: {
      type:     String,
      default: 'default'
    },

    owner: {
      type:     String,
      default:  ''
    },

    isEjectCdrow: {
      type:    Boolean,
      default: false
    }
  },

  data() {
    const validateName = (rule, value, callback) => {
      const arr = _.filter(this.rows, (o, index) => {
        return value === o.name;
      });

      if ((arr?.length > 0 && this.type === 'add') || (arr?.length > 1)) {
        const message = this.$store.getters['i18n/t']('virtualMachine.validation.repeat', { name: 'Disk' });

        callback(new Error(message));
      } else if (value.length > 20) {
        const message = this.$store.getters['i18n/t']('validation.custom.tooLongName', { max: 20 });

        callback(new Error(message));
      } else {
        callback();
      }
    };

    return {
      rows:           clone(this.value),
      type:           'add',
      errors:         [],
      rowIdx:         0,
      currentRow:     {},
      pvcs:           [],
      enableAdvanced: false,
      rules:          {
        source:           [{ required: true }],
        image:            [{
          required: true, message: 'Please select Image', trigger: 'blur'
        }],
        type:             [{ required: true }],
        name:             [{
          required: true, message: 'Please input Name', trigger: 'blur'
        },
        { validator: validateName, trigger: 'change' }],
        pvcName:          [{ required: true }],
        container:        [{ required: true }],
        bus:              [{ required: true }],
        size:             [{ required: true }],
        storageClassName: [{ required: true }],
        volumeMode:       [{ required: true }],
        accessMode:       [{ required: true }]
      },
    };
  },

  computed: {
    isImage() {
      return this.currentRow.source === SOURCE_TYPE.IMAGE;
    },

    isBlank() {
      return this.currentRow.source === SOURCE_TYPE.BLANK;
    },

    isAttachVolume() {
      return this.currentRow.source === SOURCE_TYPE.ATTACH_VOLUME;
    },

    isContainerDisk() {
      return this.currentRow.source === SOURCE_TYPE.CONTAINER_DISK;
    },

    dataVolumeOption() {
      const choices = this.$store.getters['cluster/all'](DATA_VOLUME);

      return sortBy(
        choices
          .filter( (obj) => {
            return obj.metadata.namespace === this.namespace && obj.phaseStatus === SUCCEEDED; // Todo: validate
          })
          .map((obj) => {
            return {
              label: obj.metadata.name,
              value: obj.metadata.name
            };
          }),
        'label'
      );
    },

    storageOption() {
      const choices = this.$store.getters['cluster/all'](STORAGE_CLASS);

      return sortBy(
        choices
          .map((obj) => {
            return {
              label: obj.metadata.name,
              value: obj.metadata.name
            };
          }),
        'label'
      );
    },

    headers() {
      const out = [{
        name:  'name',
        label: 'Name',
        value: 'name',
      }, {
        name:  'Source',
        label: 'Source',
        value: 'source',
      }, {
        name:  'Size',
        label: 'Size',
        value: 'size',
      }, {
        name:  'Interface',
        label: 'Bus',
        value: 'bus',
      }, {
        name:  'Storage Class',
        label: 'Storage Class',
        value: 'storageClassName',
      }, {
        name:  'bootOrder',
        label: 'Boot Order',
        value: 'bootOrder',
      }];

      if (this.isEjectCdrow) { // Todo: pass ref to add
        out.unshift({
          name:      '',
          label:     '',
          value:     '',
          width:      30,
          formatter: 'EjectCdRow',
        });
      }

      return out;
    },

    typeOption() {
      return [{
        label: 'disk',
        value: 'disk'
      }, {
        label: 'cd-rom',
        value: 'cd-rom'
      }];
    },

    sourceOption() {
      return [{
        label: SOURCE_TYPE.BLANK,
        value: SOURCE_TYPE.BLANK
      }, {
        label: SOURCE_TYPE.IMAGE,
        value: SOURCE_TYPE.IMAGE
      }, {
        label: SOURCE_TYPE.CONTAINER_DISK,
        value: SOURCE_TYPE.CONTAINER_DISK
      }, {
        label: SOURCE_TYPE.ATTACH_VOLUME,
        value: SOURCE_TYPE.ATTACH_VOLUME
      }];
    },

    InterfaceOption() {
      return InterfaceOption;
    },

    volumeModeOption() {
      return [{
        label: 'FileSystem',
        value: 'Filesystem'
      }, {
        label: 'Block',
        value: 'Block'
      }];
    },

    imagesOption() {
      const choise = this.$store.getters['cluster/all'](IMAGE);

      return sortBy(
        choise.map( (I) => {
          return {
            label: I.spec.displayName,
            value: I.spec.displayName
          };
        }),
        'label'
      );
    },

    accessModeOption() {
      return [{
        label: 'Single User(RWO)',
        value: 'ReadWriteOnce'
      }, {
        label: 'Shared Access(RWX)',
        value: 'ReadWriteMany'
      }, {
        label: 'Read Only(ROX)',
        value: 'ReadOnlyMany'
      }];
    },

    bootOrderOption() {
      const baseOrder = Array.from(Array(10), (v, k) => k + 1);

      _.remove(baseOrder, (n) => {
        return this.rows.map( R => R.bootOrder ).includes(n);
      });

      return baseOrder.map( (O) => {
        return {
          label: O,
          value: O
        };
      });
    },

    imageRequired() {
      return !(this.currentRow.disableDelete === true && this.owner === 'template');
    },

    imageLabel() {
      return (this.currentRow.disableDelete === true && this.owner === 'template') ? 'Image(optional)' : 'Image';
    }
  },

  watch: {
    value(neu) {
      this.rows = neu;
    },
    'currentRow.type'(neu) {
      if (neu === 'cd-rom') {
        this.$set(this.currentRow, 'bus', 'sata');
      }
    },
    'currentRow.pvcName'(neu) {
      const choices = this.$store.getters['cluster/all'](DATA_VOLUME);

      const pvcResource = choices.find( O => O.metadata.name === neu);

      if (!pvcResource) {
        return;
      }

      this.currentRow.size = pvcResource?.spec?.pvc?.resources?.requests?.storage;
      this.currentRow.volumeMode = pvcResource?.spec?.pvc?.volumeMode;
      this.currentRow.accessModes = pvcResource?.spec?.pvc?.accessModes[0];
      this.currentRow.storageClassName = pvcResource?.spec?.pvc?.storageClassName;
    }
  },

  methods: {
    beforeCancel() {
      this.$refs.ruleForm.resetFields();
    },

    updateIndex(idx, type) {
      this.rowIdx = idx;
      this.type = type;
      this.$set(this, 'currentRow', clone(this.rows[this.rowIdx]) || {
        name:             `disk-${ idx }`,
        source:           'blank',
        pvcNS:            'default',
        size:             '10Gi',
        type:             'disk',
        accessMode:       'ReadWriteOnce',
        volumeMode:       'Filesystem',
        pvcName:           '',
        bus:              'virtio',
        storageClassName: this.storageOption?.[0]?.value || ''
      });
    },

    updateAdd() {
      const dataVolumeTemplates = [];
      const volumes = [];
      const disks = [];

      if (this.type === 'add') {
        this.rows.splice(this.rowIdx, 0, this.currentRow);
      } else if (this.type === 'delete') {
        this.rows.splice(this.rowIdx, 1);
      } else {
        this.rows.splice(this.rowIdx, 1, this.currentRow);
      }

      this.rows.forEach((o, index) => {
        if (index === 0) {
          o.disableDelete = true;
        }
        o.index = index;
      });

      this.$emit('input', this.rows);
    },

    validateRules() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          this.$refs.modal.passValidate = true;
        } else {
          this.$refs.modal.passValidate = false;
        }
      });
    }
  }
};
</script>

<template>
  <div>
    <VMModal
      ref="modal"
      :row-actions="rowActions"
      :title="type === 'add' ? 'Add Disk' : 'Edit Disk'"
      :rows="rows"
      button-text="Add Disk"
      :headers="headers"
      :errors="errors"
      @update:add="updateAdd"
      @update:index="updateIndex"
      @update:cancel="beforeCancel"
      @validateRules="validateRules"
    >
      <template v-slot:content>
        <a-form-model ref="ruleForm" :model="currentRow" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
          <a-form-model-item label="Source" prop="source">
            <a-select
              v-model="currentRow.source"
              :options="sourceOption"
              :disabled="currentRow.disableDelete"
            />
          </a-form-model-item>

          <a-form-model-item v-if="isImage" :label="imageLabel" prop="image">
            <a-select
              v-model="currentRow.image"
              :options="imagesOption"
              :disabled="currentRow.disableDelete"
            />
          </a-form-model-item>

          <a-form-model-item label="Type" prop="type">
            <a-select
              v-model="currentRow.type"
              :options="typeOption"
            />
          </a-form-model-item>

          <a-form-model-item v-if="isContainerDisk" label="Docker Image" prop="container">
            <a-input v-model="currentRow.container" />
          </a-form-model-item>

          <a-form-model-item label="Name" prop="name">
            <a-input v-model="currentRow.name" />
          </a-form-model-item>

          <a-form-model-item v-if="isAttachVolume" label="Volume" prop="pvcName">
            <a-select
              v-model="currentRow.pvcName"
              :options="dataVolumeOption"
            />
          </a-form-model-item>

          <!-- <a-form-model-item v-if="!isContainerDisk" label="Size" prop="size"> -->
          <MemoryUnit v-model="currentRow.size" :is-disabled="isAttachVolume" value-name="Size" />
          <!-- </a-form-model-item> -->

          <a-form-model-item label="Bus" prop="bus">
            <a-select v-model="currentRow.bus" :disabled="isAttachVolume" :options="InterfaceOption" />
          </a-form-model-item>

          <a-form-model-item v-if="!isContainerDisk" label="Storage Class" prop="storageClassName">
            <a-select v-model="currentRow.storageClassName" :disabled="isAttachVolume" :options="storageOption" />
          </a-form-model-item>

          <a-form-model-item label="Boot Order" prop="bootOrder">
            <a-select
              v-model="currentRow.bootOrder"
              :options="bootOrderOption"
              allow-clear
            />
          </a-form-model-item>

          <a-collapse v-if="!isContainerDisk">
            <a-collapse-panel key="1" header="Advanced Configuration">
              <a-form-model-item label="Volume Mode" prop="volumeMode">
                <a-select v-model="currentRow.volumeMode" :disabled="isAttachVolume" :options="volumeModeOption" />
              </a-form-model-item>

              <a-form-model-item label="Access Mode" prop="accessMode">
                <a-select v-model="currentRow.accessMode" :disabled="isAttachVolume" :options="accessModeOption" />
              </a-form-model-item>
            </a-collapse-panel>
          </a-collapse>
        </a-form-model>
      </template>
    </VMModal>
  </div>
</template>
