<script>
import { PROJECT } from '@/config/labels-annotations';
import { NAMESPACE, EXTERNAL } from '@/config/types';
import ButtonGroup from '@/components/ButtonGroup';
import VmState from '@/components/formatter/vmState';
import Banner from '@/components/Banner';
import { get } from '@/utils/object';

export default {
  components: {
    Banner, ButtonGroup, VmState
  },
  props:      {
    value: {
      type:    Object,
      default: () => {
        return {};
      }
    },

    mode: {
      type:    String,
      default: 'create'
    },

    realMode: {
      type:    String,
      default: 'create'
    },

    asYaml: {
      type:    Boolean,
      default: false
    },

    hasDetailOrEdit: {
      type:    Boolean,
      default: false
    },

    parentOverride: {
      type:    Object,
      default: null
    }
  },

  computed: {
    schema() {
      return this.$store.getters['cluster/schemaFor']( this.value.type );
    },

    h1() {
      let out = this.$store.getters['i18n/t'](`resourceDetail.header.${ this.realMode }`, {
        type: this.$store.getters['type-map/labelFor'](this.schema),
        name: this.value.nameDisplay,
      });

      if (out && out.length > 63) {
        out = out.substring(0, 63);
      }

      return out;
    },

    isNamespace() {
      return this.schema?.id === NAMESPACE;
    },

    namespace() {
      if (this.value?.metadata?.namespace) {
        return this.value?.metadata?.namespace;
      }

      return null;
    },

    namespaceLocation() {
      if (!this.isNamespace) {
        return {
          name:   'c-cluster-product-resource-id',
          params: {
            cluster:  this.$route.params.cluster,
            product:  this.$store.getters['productId'],
            resource: NAMESPACE,
            id:       this.$route.params.namespace
          }
        };
      }

      return null;
    },

    project() {
      if (this.isNamespace) {
        const id = (this.value?.metadata?.labels || {})[PROJECT];

        return this.$store.getters['clusterExternal/byId'](EXTERNAL.PROJECT, id);
      } else {
        return null;
      }
    },

    banner() {
      if (this.value?.metadata?.state?.error) {
        const defaultErrorMessage = this.t('resourceDetail.masthead.defaultBannerMessage.error', undefined, true);

        return {
          color:   'error',
          message: this.value.metadata.state.message || defaultErrorMessage
        };
      }

      if (this.value?.metadata?.state?.transitioning) {
        const defaultTransitioningMessage = this.t('resourceDetail.masthead.defaultBannerMessage.transitioning', undefined, true);

        return {
          color:   'info',
          message: this.value.metadata.state.message || defaultTransitioningMessage
        };
      }

      return null;
    },
    parent() {
      if (this.parentOverride) {
        return this.parentOverride;
      }

      const schema = this.$store.getters['cluster/schemaFor'](this.value.type);
      const displayName = this.$store.getters['type-map/labelFor'](schema);
      const location = {
        name:   'c-cluster-product-resource',
        params: { resource: this.value.type }
      };

      return { displayName, location };
    },
    isVM() {
      return this.value?.kind === 'VirtualMachine';
    }
  },
  methods: {
    get,
    showActions() {
      this.$store.commit('action-menu/show', {
        resources: this.value,
        elem:      this.$refs.actions,
      });
    },

    toggleYaml() {
      const out = !this.asYaml;

      this.$emit('update:asYaml', out);
    }
  }
};
</script>

<template>
  <header class="masthead">
    <div>
      <div class="primaryheader">
        <h1>
          <nuxt-link v-trim-whitespace :to="parent.location">
            {{ parent.displayName }}:
          </nuxt-link>
          <span class="title" v-html="h1" />
        </h1>
        <VmState v-if="mode==='view' && isVM" v-model="value.id" :row="value" />
      </div>
      <!-- //TODO use  nuxt-link for an internal project detail page once it exists -->
      <div v-if="mode==='view'" class="subheader">
        <span v-if="isNamespace && project">{{ t("resourceDetail.masthead.project") }}: {{ project.nameDisplay }}</span>
        <span v-else-if="namespace">{{ t("resourceDetail.masthead.namespace") }}: <nuxt-link :to="namespaceLocation">{{ namespace }}</nuxt-link></span>
        <span>{{ t("resourceDetail.masthead.age") }}: <LiveDate class="live-date" :value="get(value, 'metadata.creationTimestamp')" /></span>
      </div>
    </div>
    <slot name="right">
      <div v-if="mode==='view'" class="actions">
        <div v-if="hasDetailOrEdit">
          <ButtonGroup :labels-are-translations="true" :value="asYaml" :options="[{label: 'resourceDetail.masthead.overview', value: false},{label:'resourceDetail.masthead.yaml', value: true }]" @input="toggleYaml" />
        </div>
        <button ref="actions" aria-haspopup="true" type="button" class="btn btn-sm role-multi-action actions" @click="showActions">
          <i class="icon icon-actions" />
        </button>
      </div>
    </slot>
    <div v-if="banner" class="state-banner">
      <Banner class="state-banner" :color="banner.color" :label="banner.message" />
    </div>
  </header>
</template>

<style lang='scss'>
  .masthead {
    .primaryheader {
      display: flex;
      flex-direction: row;
      align-items: center;

      h1 {
        margin-right: 8px;
      }

      .badge-state {
        margin-top: 4px;
        padding: 2px 14px 1px 14px;
        font-size: 10px;
      }
    }

    .subheader{
      display: flex;
      flex-direction: row;
      color: var(--input-label);
      & > * {
        margin: 5px 20px 5px 0px;
      }

      .live-date {
        color: var(--body-text)
      }
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      align-items:center;
      & .btn-group {
        margin-right: 5px;
      }
    }

    .state-banner {
      margin: 3px 0 0 0;
    }
  }

</style>
