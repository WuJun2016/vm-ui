<script>
import SortableTable from '@/components/SortableTable';

export default {
  components: { SortableTable },

  props: {
    title: {
      type:     String,
      required: true
    },
    headers: {
      type:    Array,
      default: () => {
        return [];
      }
    },
    rows: {
      type:    Array,
      default: () => {
        return [];
      }
    },
    rowActions: {
      type:     Boolean,
      default:  true
    },
    buttonText: {
      type:     String,
      default:  ''
    }
  },

  data() {
    return {
      dialogVisible: false,
      passValidate:  false
    };
  },

  methods: {
    show() {
      this.dialogVisible = true;
    },
    hide() {
      this.dialogVisible = false;
      this.$emit('update:cancel');
    },
    add() {
      this.$emit('validateRules');
      if (!this.passValidate) {
        return;
      }
      this.$emit('update:add');
      this.hide();
    },
    openModal() {
      this.show();

      this.$emit('update:index', this.rows.length, 'add');
    },
    handleRow(row, type) {
      this.show();
      const { index } = row;

      this.$emit('update:index', index, type);
      if (type === 'delete') {
        this.$emit('update:add');
        this.hide();
      }
    }
  },
};
</script>

<template>
  <div>
    <SortableTable
      key-field="id"
      :rows="rows"
      :search="false"
      :headers="headers"
      :row-actions-width="160"
      :row-actions="rowActions"
      :table-actions="false"
    >
      <template v-slot:row-actions="scope">
        <div class="action">
          <a-button type="primary" class="mr-15" @click="handleRow(scope.row, 'modify')">
            modify
          </a-button>

          <a-button class="" :disabled="scope.row.disableDelete" @click="handleRow(scope.row, 'delete')">
            delete
          </a-button>
        </div>
      </template>
    </SortableTable>

    <a-modal
      :title="title"
      :visible="dialogVisible"
      width="680px"
      @ok="add"
      @cancel="hide"
    >
      <div class="modal">
        <div class="content mb-20">
          <slot name="content"></slot>
        </div>
      </div>
    </a-modal>

    <a-button v-if="rowActions" class="mb-20 mt-20" @click="openModal">
      {{ buttonText }}
    </a-button>
  </div>
</template>

<style lang="scss" scoped>
.action {
  display: flex;
}
</style>
