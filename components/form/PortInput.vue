<script>
export default {
  props: {
    row: {
      type:     Object,
      required: true
    },
    index: {
      type:     Number,
      required: true
    }
  },
};
</script>

<template>
  <a-form-model-item
    :prop="'ports.' + index + '.port'"
  >
    <a-input-number
      v-model="row.port"
      :min="1"
      :max="65535"
      placeholder="e.g. 8080"
    />
  </a-form-model-item>
</template>
