<script>
import { MemoryUnit } from '@/config/map';

export default {
  name:   'MemoryUnit',
  props: {
    value: {
      type:    String,
      default: ''
    },
    isDisabled: {
      type:    Boolean,
      default: false
    },
    label: {
      type:     String,
      default: 'Size'
    }
  },

  data() {
    return {
      size:        null,
      unit:        'Gi',
      MemoryUnit,
      memoryValue: this.value
    };
  },

  watch: {
    value: {
      handler(neu) {
        const arr = neu.split(/(?=[A-Z])+/);
        const unit = arr[1] || arr[0] || 'Gi';

        if (arr.length === 2) {
          this.size = arr[0] !== 'null' ? arr[0] : null;
        } else {
          this.size = null;
        }
      },
      immediate: true
    }
  },

  methods: {
    update() {
      const memoryValue = `${ this.size }${ this.unit }`;

      this.$emit('input', memoryValue);
    },

    updateUnit(unit) {
      this.update();
    }
  }
};
</script>

<template>
  <a-form-model-item
    :label="label"
    :rules="{
      required: true
    }"
  >
    <a-input-group compact @input="update">
      <a-input-number v-model="size" style="width: 80%" :disabled="isDisabled" :min="1" :max="999999" />
      <a-select v-model="unit" style="width: 20%" :options="MemoryUnit" :disabled="isDisabled" @change="updateUnit"></a-select>
    </a-input-group>
  </a-form-model-item>
</template>
