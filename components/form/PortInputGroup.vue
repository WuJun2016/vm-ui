<script>
import { isArray } from '@/utils/array';

export default {
  props: {
    value: {
      type:     Object,
      required: true
    },
    mode: {
      type:     String,
      required: false,
      default:  'edit'
    }
  },

  data() {
    return {};
  },

  computed: {
    protocolOption() {
      return [
        {
          label: 'TCP',
          value: 'TCP'
        }, {
          label: 'UDP',
          value: 'UDP'
        }
      ];
    },
    isView() {
      return this.mode === 'view';
    },
    namePlaceholder() {
      return this.isView ? '' : 'e.g. myport';
    }
  },

  methods: {
    addRows() {
      if (!isArray(this.value.ports)) {
        this.$set(this.value, 'ports', []);
      }

      this.value.ports.push({
        name:     '',
        port:     null,
        protocol: 'TCP'
      });
    },
    removeRows(index) {
      this.value.ports.splice(index, 1);
    },
    update() {
      this.$emit('update', this.rows);
    },
  }
};
</script>

<template>
  <div class="multiple-rows-input">
    <span class="title">Add Ports</span>

    <div v-for="(row, index) in value.ports" :key="index" class="display-rows">
      <a-row>
        <a-col :span="7">
          <label>
            Port Name
          </label>
          <a-form-model-item
            :prop="'ports.' + index + '.name'"
            :rules="{
              required: true,
              message: 'Name is required',
            }"
          >
            <a-input v-model="row.name" type="text" :placeholder="namePlaceholder" :disabled="isView" />
          </a-form-model-item>
        </a-col>

        <a-col :span="7">
          <label>
            Port Number <span class="required">*</span>
          </label>
          <a-form-model-item
            :prop="'ports.' + index + '.port'"
            :rules="{
              required: true,
              message: 'port is required',
            }"
          >
            <a-input
              v-model="row.port"
              :min="1"
              :max="65535"
              placeholder="e.g. 8080"
            />
          </a-form-model-item>
        </a-col>

        <a-col :span="7">
          <label>
            Protocol
          </label>
          <a-form-model-item
            :prop="'ports.' + index + '.protocol'"
            :rules="{
              required: true,
              message: 'port is required',
            }"
          >
            <a-select v-model="row.protocol" :options="protocolOption" />
          </a-form-model-item>
        </a-col>

        <a-col :span="3">
          <div class="center">
            <a-button type="primary" icon="delete" size="small" @click="removeRows(index)" />
          </div>
        </a-col>
      </a-row>
    </div>

    <a-button type="primary" @click="addRows()">
      Add Port
    </a-button>
  </div>
</template>

<style lang="scss">
  .center {
    margin-top: 28px
  }

  .multiple-rows-input {
    .title {
      display: block;
      margin-bottom: 10px;
      color: var(--input-label);
    }

    .required {
      color: red;
    }

    // .display-rows {
    //   display: grid;
    //   grid-template-columns: auto 28px;
    //   grid-column-gap: 15px;
    //   align-items: center;
    //   margin-bottom: 15px;
    // }

    // .input-group, .label-group {
    //   display: grid;
    //   grid-template-columns: 2fr 2fr 1fr;
    //   grid-column-gap: 15px;
    //   padding-left: 5px;
    // }

    // .label-group {
    //   grid-template-columns: 2fr 2fr 1fr 28px;

    //   LABEL {
    //     display: block;
    //     color: var(--input-label);
    //     margin-bottom: 5px;
    //   }
    // }

    .input-group {
      .labeled-select {
        padding: 2px 10px;
      }
    }
  }
</style>
