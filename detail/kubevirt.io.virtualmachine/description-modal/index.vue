<script>
import LabeledInput from '@/components/form/LabeledInput';

export default {
  components: { LabeledInput },

  props: {
    spec: {
      type:     Object,
      required: true,
    },
    visible: {
      type:    Boolean,
      default: false
    },
    mode: {
      type:     String,
      default: 'view'
    }
  },

  data() {
    return { dialogVisible: false };
  },

  methods: {
    handleClose() {
      this.$emit('close');
    },
    save() {
      this.$emit('update');
      this.$emit('close');
    },
  }
};
</script>

<template>
  <el-dialog
    title="Edit Description"
    :visible="visible"
    width="50%"
    :before-close="handleClose"
  >
    <LabeledInput
      key="description"
      v-model="spec.metadata.annotations.description"
      label="Description"
      :mode="mode"
      :min-height="30"
    />
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Close</el-button>
      <el-button type="primary" @click="save">Save</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.tip {
  font-size: 13px;
  font-style: italic;
}
</style>
