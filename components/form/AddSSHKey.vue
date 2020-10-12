<script>
import Banner from '@/components/Banner';
import { clone } from '@/utils/object';
import { SSH } from '@/config/types';

export default {
  components: { Banner },

  props: {
    sshKey: {
      type:    Array,
      default: () => {
        return [];
      }
    }
  },

  data() {
    return {
      checkedSsh:       this.sshKey,
      publicKey:        '',
      sshName:          '',
      searchKey:        '',
      errors:           [],
      isAll:            false,
      checkAll:         false,
      visible:          false,
      rules:      {
        sshName: [
          { required: true, message: 'Name is required' },
          { max: 63, message: this.$store.getters['i18n/t']('validation.custom.tooLongName', { max: 63 }) },
        ],
        publicKey: [
          { required: true }
        ]
      },
    };
  },

  computed: {
    ssh() {
      return this.$store.getters['cluster/all'](SSH);
    },
    sshList() {
      return this.ssh.map( O => O.metadata.name);
    },
    filterSSHList() {
      return this.sshList.filter( (O) => {
        return O.includes(this.searchKey);
      });
    }
  },

  watch: {
    checkedSsh() {
      this.$emit('update:sshKey', clone(this.checkedSsh));
    },
    publicKey(neu) {
      const splitSSH = neu.split(/\s+/);

      if (splitSSH.length === 3) {
        if (splitSSH[2].includes('@')) {
          if (splitSSH[2].split('@')) {
            this.sshName = splitSSH[2].split('@')[0];
          }
        }
      }
    },
  },

  methods: {
    show() {
      this.visible = true;
    },

    hide() {
      this.visible = false;
      this.errors = [];
      this.$refs.ruleForm.resetFields();
    },

    handleCheckAllChange(e) {
      this.checkedSsh = e.target.checked ? this.sshList : [];
    },

    handleCheckedChange(value) {
      const checkedCount = value.length;

      this.checkAll = checkedCount === this.sshList.length;
    },

    saveKey() {
      this.errors = [];

      this.$refs.ruleForm.validate( async(valid) => {
        if (valid) {
          try {
            const data = await this.$store.dispatch('cluster/request', {
              method:  'POST',
              headers: {
                'content-type': 'application/json',
                accept:         'application/json',
              },
              url:  `v1/${ SSH }`,
              data: {
                apiVersion: 'vm.cattle.io/v1alpha1',
                kind:       'KeyPair',
                metadata:   { name: this.sshName },
                spec:       { publicKey: this.publicKey },
                type:       SSH
              },
            });

            this.checkedSsh.push(this.sshName);

            this.hide();
          } catch (err) {
            this.errors = [err.message];
          }
        } else {
          return false;
        }
      });
    },

    updateSSH(sshKey) {
      this.checkedSsh = sshKey;
    }
  }
};
</script>

<template>
  <div>
    <div class="box mb-20">
      <div class="row mb-15">
        <div class="col span-4">
          <a-input v-model="searchKey" placeholder="Search" />
        </div>
      </div>

      <div class="keyLisk">
        <div class="mb-15">
          <a-checkbox v-model="checkAll" @change="handleCheckAllChange">
            Select All
          </a-checkbox>
        </div>

        <a-checkbox-group v-model="checkedSsh" :options="filterSSHList" @change="handleCheckedChange" />
      </div>
      <a-button class="mt-20" @click="show">
        New SSH Key
      </a-button>
    </div>

    <a-modal
      title="Add Public SSH Key"
      :visible.sync="visible"
      :mask-closable="false"
      @ok="saveKey"
      @cancel="hide"
    >
      <a-form-model ref="ruleForm" :model="this" :rules="rules" layout="vertical">
        <a-form-model-item label="name" prop="sshName">
          <a-input
            v-model="sshName"
            required
          />
        </a-form-model-item>

        <a-form-model-item label="SSH-Key" prop="publicKey">
          <a-textarea
            v-model="publicKey"
            required
            :auto-size="{ minRows: 5, maxRows: 10 }"
          />
        </a-form-model-item>

        <div v-for="(err,idx) in errors" :key="idx">
          <Banner color="error" :label="err" />
        </div>
      </a-form-model>
    </a-modal>
  </div>
</template>

<style lang="scss">
.box {
  border: 1px solid var(--tabbed-container-bg);
  padding: 20px;

  .ssh {
    display: flex;
    align-items: center;
  }
}
.lastItem {
  margin-bottom: 0px;
}
</style>
