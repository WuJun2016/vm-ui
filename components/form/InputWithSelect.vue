<script>
/* eslint-disable */
import labeledFormElement from '@/mixins/labeled-form-element';

export default {
  mixins:     [labeledFormElement],
  props:      {
    disabled: {
      type:    Boolean,
      default: false,
    },
    searchable: {
      type:    Boolean,
      default: true,
    },
    taggable: {
      type:    Boolean,
      default: false,
    },

    selectLabel: {
      type:    String,
      default: ''
    },
    selectValue: {
      type:    String,
      default: null
    },
    optionLabel: {
      type:    String,
      default: 'label'
    },
    options: {
      type:     Array,
      required: true
    },
    selectBeforeText: {
      type:    Boolean,
      default: true,
    },

    textLabel: {
      type:    String,
      default: ''
    },
    textRequired: {
      type:    Boolean,
      default: false
    },
    textValue: {
      type:    String,
      default: ''
    },
    placeholder: {
      type:    String,
      default: ''
    },
  },

  data() {
    return { selected: this.selectValue || this.options[0], string: this.textValue };
  },

  methods: {
    focus() {
      const comp = this.$refs.text;

      if ( comp ) {
        comp.focus();
      }
    },

    change() {
      this.$emit('input', { selected: this.selected, text: this.string });
    },
  }
};
</script>

<template>
  <div class="input-container row" @input="change">
    <a-form-item :label="selectLabel" class="col span-4" required>
      <a-select
        v-model="selected"
        :label="selectLabel"
        class="in-input"
        :options="options"
        :searchable="searchable"
        :disbaled="isView"
        :clearable="false"
        :disabled="disabled"
        :taggable="taggable"
        :mode="mode"
        :option-label="optionLabel"
        @input="change"
      />
    </a-form-item>

    <a-form-item :label="textLabel" class="input-string col span-8" required>
      <a-input
        v-if="textLabel"
        ref="text"
        v-model="string"
        :label="textLabel"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="textRequired"
        :mode="mode"
      />
      <a-input
        v-else
        ref="text"
        v-model="string"
        class="input-string"
        :disabled="isView"
        :placeholder="placeholder"
        autocomplete="off"
      />
    </a-form-item>
  </div>
</template>

<style lang='scss'>
  .input-container {
    display: flex;

    & .input-string {
      // height: 50px;
      // width:60%;
      flex-grow: 1;
      border-radius: 0 calc(var(--border-radius) * 2) calc(var(--border-radius) * 2) 0;
      border-left: 1;
      margin-left: -1px;
    }

    .ant-select-selection {
      border-radius: calc(var(--border-radius) * 2) 0 0 calc(var(--border-radius) * 2);
    }
  }
</style>
