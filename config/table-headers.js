// Note: 'id' is always the last sort, so you don't have to specify it here.

export const STATE = {
  name:      'state',
  labelKey:  'tableHeaders.state',
  sort:      'stateDisplay',
  value:     'stateDisplay',
  width:     100,
  default:   'unknown',
  formatter: 'BadgeStateFormatter',
};

export const DOWNLOAD = {
  name:          'download',
  labelKey:      'tableHeaders.download',
  value:         'download',
  canBeVariable: true,
  align:         'right',
};

export const INTERNAL_EXTERNAL_IP = {
  name:      'internal-external-ip',
  labelKey:  'tableHeaders.internalExternalIp',
  formatter: 'InternalExternalIP'
};

export const NAME = {
  name:          'name',
  labelKey:      'tableHeaders.name',
  value:         'nameDisplay',
  sort:          ['nameSort'],
  formatter:     'LinkDetail',
  canBeVariable: true,
};

export const NAMESPACE = {
  name:          'namespace',
  label:         'Namespace',
  value:         'metadata.namespace',
  sort:          ['nameSort'],
  canBeVariable: true,
};

export const SIMPLE_NAME = {
  name:          'name',
  labelKey:      'tableHeaders.simpleName',
  value:         'name',
  sort:          ['name'],
  width:         200
};

export const EFFECT = {
  name:          'effect',
  labelKey:      'tableHeaders.effect',
  value:         'effect',
  sort:          ['effect'],
};

export const NAME_UNLINKED = {
  name:          'name',
  labelKey:      'tableHeaders.nameUnlinked',
  value:         'nameDisplay',
  sort:          ['nameSort'],
  canBeVariable: true,
};

export const NAMESPACE_NAME_UNLINKED = {
  name:          'name',
  labelKey:      'tableHeaders.namespaceNameUnlinked',
  value:         'namespacedName',
  sort:          ['namespacedNameSort'],
  canBeVariable: true,
};

export const NAMESPACE_NAME = {
  name:          'name',
  labelKey:      'tableHeaders.namespaceName',
  value:         'namespacedName',
  sort:          ['namespacedNameSort'],
  formatter:     'LinkDetail',
  canBeVariable: true,
};

export const NODE = {
  name:      'node',
  labelKey:  'tableHeaders.node',
  value:     'spec.nodeName',
  sort:      'spec.nodeName',
  formatter: 'LinkNode'
};

export const NODE_NAME = {
  name:      'nodeName',
  labelKey:  'tableHeaders.nodeName',
  sort:      'name',
  value:     'name',
  formatter: 'LinkDetail',
};

export const ROLES = {
  name:      'roles',
  labelKey:  'tableHeaders.roles',
  sort:      'roles',
  value:     'roles'
};

export const VERSION = {
  name:     'version',
  labelKey: 'tableHeaders.version',
  sort:     'version',
  value:    'version'
};

export const CPU = {
  name:      'cpu',
  labelKey:  'tableHeaders.cpu',
  sort:      'cpu',
  value:     'cpuUsagePercentage',
  formatter: 'PercentageBar',
  width:     120,
};

export const RAM = {
  name:      'ram',
  labelKey:  'tableHeaders.ram',
  sort:      'ram',
  value:     'ramUsagePercentage',
  formatter: 'PercentageBar',
  width:     102,
};

export const PODS = {
  name:      'pods',
  labelKey:  'tableHeaders.pods',
  sort:      'pods',
  value:     'podUsage',
  formatter: 'PercentageBar'
};

export const AGE = {
  name:       'age',
  labelKey:   'tableHeaders.age',
  value:      'metadata.creationTimestamp',
  sort:       'metadata.creationTimestamp',
  search:     false,
  formatter:  'LiveDate',
  width:      75,
  align:     'right'
};

export const IMAGE = {
  name:     'image',
  labelKey: 'tableHeaders.image',
  value:    'image',
  sort:     ['image', 'nameSort'],
};

export const RIO_IMAGE = {
  name:     'image',
  labelKey: 'tableHeaders.rioImage',
  value:    'imageDisplay',
  sort:     ['imageDisplay', 'nameSort'],
};

export const POD_IMAGES = {
  name:      'pod_images',
  labelKey:  'tableHeaders.podImages',
  value:     'status.containerStatuses',
  formatter: 'PodImages'
};

export const ENDPOINTS = {
  name:      'endpoint',
  labelKey:  'tableHeaders.endpoints',
  value:     'status.endpoints',
  formatter: 'Endpoints',
  width:      60,
  align:     'center',
};

export const SCALE = {
  name:      'scale',
  labelKey:  'tableHeaders.scale',
  value:     'scales.desired',
  sort:      ['scales.desired', 'nameSort'],
  formatter: 'Scale',
  width:     60,
  align:     'center',
};

export const SIMPLE_SCALE = {
  name:      'simple-scale',
  labelKey:  'tableHeaders.simpleScale',
  value:     'scale',
  sort:      ['scale']
};

export const WEIGHT = {
  name:      'weight',
  labelKey:  'tableHeaders.weight',
  value:     'status.computedWeight',
  sort:      'status.computedWeight',
  formatter: 'Weight',
  width:     60,
  align:     'center',
};

export const SUCCESS = {
  name:     'success',
  labelKey: 'tableHeaders.success',
  value:    'success',
  width:    100,
  align:    'right',
};

export const REQ_RATE = {
  name:     'req-rate',
  labelKey: 'tableHeaders.reqRate',
  value:    'rps',
  width:    100,
  align:    'right',
};

export const P95 = {
  name:     'p95',
  labelKey: 'tableHeaders.p95',
  value:    'p95',
  width:    100,
  align:    'right',
};

export const KEYS = {
  name:      'keys',
  labelKey:  'tableHeaders.keys',
  sort:      false,
  value:     'keysDisplay',
};

export const TARGET_KIND = {
  name:     'target-kind',
  labelKey: 'tableHeaders.targetKind',
  value:    'kindDisplay',
  width:    100,
};

export const TARGET = {
  name:     'target',
  labelKey: 'tableHeaders.target',
  value:    'targetDisplay',
};

export const MATCHES = {
  name:      'matches',
  labelKey:  'tableHeaders.matches',
  value:     'spec.routes',
  formatter: 'RouterMatch'
};

export const DESTINATION = {
  name:      'destination',
  labelKey:  'tableHeaders.destination',
  value:     'spec.routes',
  formatter: 'RouterDestination'
};

export const USERNAME = {
  name:     'username',
  labelKey: 'tableHeaders.username',
  value:    'username'
};

export const USER_DISPLAY_NAME = {
  name:     'display name',
  labelKey: 'tableHeaders.userDisplayName',
  value:    'name'
};

export const USER_ID = {
  name:     'user-id',
  labelKey: 'tableHeaders.userId',
  value:    'id'
};

export const USER_STATUS = {
  name:      'user-state',
  labelKey:  'tableHeaders.userStatus',
  value:     'stateDisplay',
  formatter: 'BadgeStateFormatter'
};

export const ADDRESS = {
  name:     'address',
  labelKey: 'tableHeaders.address',
  value:    'address',
  sort:     ['address'],
};

export const SIMPLE_TYPE = {
  name:     'type',
  labelKey: 'tableHeaders.simpleType',
  value:    'type',
  sort:     ['type'],
  width:    175,
};

export const IMAGE_SIZE = {
  name:      'sizeBytes',
  labelKey:  'tableHeaders.imageSize',
  value:     'sizeBytes',
  sort:      ['sizeBytes'],
  formatter: 'Si'
};

export const TYPE = {
  name:     'type',
  labelKey: 'tableHeaders.type',
  value:    'typeDisplay',
  sort:     ['typeDisplay'],
  width:    100,
};

export const STATUS = {
  name:     'status',
  labelKey: 'tableHeaders.status',
  value:    'status',
  sort:     ['status'],
  width:    175
};
export const LAST_HEARTBEAT_TIME = {
  name:      'lastHeartbeatTime',
  labelKey:  'tableHeaders.lastHeartbeatTime',
  value:     'lastHeartbeatTime',
  sort:      ['lastHeartbeatTime'],
  formatter: 'LiveDate',
  width:     175
};
export const REASON = {
  name:     'reason',
  labelKey: 'tableHeaders.reason',
  value:    'reason',
  sort:     ['reason']
};
export const MESSAGE = {
  name:     'message',
  labelKey: 'tableHeaders.message',
  value:    'message',
  sort:     ['message']
};
export const KEY = {
  name:     'key',
  labelKey: 'tableHeaders.key',
  value:    'key',
  sort:     ['key']
};
export const VALUE = {
  name:      'value',
  labelKey:  'tableHeaders.value',
  value:     'value',
  sort:      ['value'],
};

export const BUILT_IN = {
  name:      'builtIn',
  labelKey:  'tableHeaders.builtIn',
  value:     'builtIn',
  sort:      ['builtIn'],
  align:     'center',
  formatter: 'IconIsDefault'
};

export const CLUSTER_CREATOR_DEFAULT = {
  name:      'default',
  labelKey:  'tableHeaders.clusterCreatorDefault',
  value:     'default',
  sort:      ['Default'],
  align:     'center',
  formatter: 'IconIsDefault'
};

export const RBAC_HEADERS = [
  {
    name:      'create',
    labelKey:  'tableHeaders.rbac.create',
    value:     'create',
    align:     'center',
    formatter: 'IconIsDefault',
  },
  {
    name:      'delete',
    labelKey:  'tableHeaders.rbac.delete',
    value:     'delete',
    align:     'center',
    formatter: 'IconIsDefault',
  },
  {
    name:      'get',
    labelKey:  'tableHeaders.rbac.get',
    value:     'get',
    align:     'center',
    formatter: 'IconIsDefault',
  },
  {
    name:      'list',
    labelKey:  'tableHeaders.rbac.list',
    value:     'list',
    align:     'center',
    formatter: 'IconIsDefault',
  },
  {
    name:      'patch',
    labelKey:  'tableHeaders.rbac.patch',
    value:     'patch',
    align:     'center',
    formatter: 'IconIsDefault',
  },
  {
    name:      'update',
    labelKey:  'tableHeaders.rbac.update',
    value:     'update',
    align:     'center',
    formatter: 'IconIsDefault',
  },
  {
    name:      'watch',
    labelKey:  'tableHeaders.rbac.watch',
    value:     'watch',
    align:     'center',
    formatter: 'IconIsDefault',
  }
];

export const RESOURCE = {
  name:     'resource',
  labelKey: 'tableHeaders.resource',
  value:    'resource',
  sort:     ['resourceNames']
};

export const API_GROUP = {
  name:     'apigroups',
  labelKey: 'tableHeaders.apiGroup',
  value:    'apiGroups',
  sort:     ['apiGroups']
};

export const INGRESS_TARGET = {
  name:      'ingressTarget',
  labelKey:  'tableHeaders.ingressTarget',
  value:     "$['spec']",
  formatter: 'IngressTarget',
  sort:      "$['spec']['rules'][0].host",
};

export const SPEC_TYPE = {
  name:      'type',
  labelKey:  'tableHeaders.type',
  value:     `$['spec']['type']`,
  sort:      `$['spec']['type']`,
  formatter: 'ServiceType',
  width:     100,
};

export const TARGET_PORT = {
  formatter: 'ServiceTargets',
  labelKey:  'tableHeaders.targetPort',
  name:      'targetPort',
  sort:      `$['spec']['targetPort']`,
  value:     `$['spec']['targetPort']`,
};

export const SELECTOR = {
  formatter: 'KeyValue',
  name:      'selector',
  labelKey:  'tableHeaders.selector',
  value:     `$['spec']['selector']`,
  sort:      `$['spec']['selector']`,
};

export const CHART = {
  name:     'chart',
  labelKey: 'tableHeaders.chart',
  value:    'chartDisplay',
  sort:     'chartDisplay'
};

export const RESOURCES = {
  name:     'resources',
  labelKey: 'tableHeaders.resources',
  value:    'spec.resources.length',
  sort:     'spec.resources.length',
  width:    100,
};

export const URL = {
  name:     'url',
  labelKey: 'tableHeaders.url',
  value:    'spec.url',
  sort:     'spec.url',
};
