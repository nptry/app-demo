/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },

  {
    path: '/device-management',
    name: 'device-management',
    icon: 'appstore',
    routes: [
      {
        path: '/device-management',
        redirect: '/device-management/basic-info',
      },
      {
        path: '/device-management/basic-info',
        name: 'basic-info',
        component: './DeviceManagement/BasicInfo',
      },
      {
        path: '/device-management/config-info',
        name: 'config-info',
        component: './DeviceManagement/ConfigInfo',
      },
      {
        path: '/device-management/status-monitoring',
        name: 'status-monitoring',
        component: './DeviceManagement/StatusMonitoring',
      },
    ],
  },
  {
    path: '/operations-management',
    name: 'operations-management',
    icon: 'tool',
    routes: [
      {
        path: '/operations-management',
        redirect: '/operations-management/infrastructure',
      },
      {
        path: '/operations-management/infrastructure',
        name: 'infrastructure',
        component: './OperationsManagement/Infrastructure',
      },
      {
        path: '/operations-management/resources',
        name: 'resources',
        component: './OperationsManagement/Resources',
      },
      {
        path: '/operations-management/fault',
        name: 'fault',
        component: './OperationsManagement/Fault',
      },
      {
        path: '/operations-management/statistics',
        name: 'statistics',
        component: './OperationsManagement/Statistics',
      },
    ],
  },
  {
    path: '/key-area-management',
    name: 'key-area-management',
    icon: 'cluster',
    routes: [
      {
        path: '/key-area-management',
        redirect: '/key-area-management/site-info',
      },
      {
        path: '/key-area-management/site-info',
        name: 'site-info',
        component: './KeyAreaManagement/SiteInfo',
      },
      {
        path: '/key-area-management/device-deployment',
        name: 'device-deployment',
        component: './KeyAreaManagement/DeviceDeployment',
      },
      {
        path: '/key-area-management/density-monitoring',
        name: 'density-monitoring',
        component: './KeyAreaManagement/DensityMonitoring',
      },
      {
        path: '/key-area-management/pedestrian-flow',
        name: 'pedestrian-flow',
        component: './KeyAreaManagement/PedestrianFlow',
      },
      {
        path: '/key-area-management/target-monitoring',
        name: 'target-monitoring',
        component: './KeyAreaManagement/TargetMonitoring',
      },
    ],
  },
  {
    path: '/traffic-checkpoint-management',
    name: 'traffic-checkpoint-management',
    icon: 'car',
    routes: [
      {
        path: '/traffic-checkpoint-management',
        redirect: '/traffic-checkpoint-management/checkpoint-info',
      },
      {
        path: '/traffic-checkpoint-management/checkpoint-info',
        name: 'checkpoint-info',
        component: './TrafficCheckpointManagement/CheckpointInfo',
      },
      {
        path: '/traffic-checkpoint-management/device-deployment',
        name: 'device-deployment',
        component: './TrafficCheckpointManagement/DeviceDeployment',
      },
      {
        path: '/traffic-checkpoint-management/license-records',
        name: 'license-records',
        component: './TrafficCheckpointManagement/LicenseRecords',
      },
      {
        path: '/traffic-checkpoint-management/traffic-monitoring',
        name: 'traffic-monitoring',
        component: './TrafficCheckpointManagement/TrafficMonitoring',
      },
      {
        path: '/traffic-checkpoint-management/red-light-monitoring',
        name: 'red-light-monitoring',
        component: './TrafficCheckpointManagement/RedLightMonitoring',
      },
      {
        path: '/traffic-checkpoint-management/retrograde-monitoring',
        name: 'retrograde-monitoring',
        component: './TrafficCheckpointManagement/RetrogradeMonitoring',
      },
      {
        path: '/traffic-checkpoint-management/parking-violation',
        name: 'parking-violation',
        component: './TrafficCheckpointManagement/ParkingViolation',
      },
    ],
  },
  {
    path: '/pedestrian-channel-management',
    name: 'pedestrian-channel-management',
    icon: 'branches',
    routes: [
      {
        path: '/pedestrian-channel-management',
        redirect: '/pedestrian-channel-management/channel-info',
      },
      {
        path: '/pedestrian-channel-management/channel-info',
        name: 'channel-info',
        component: './PedestrianChannelManagement/ChannelInfo',
      },
      {
        path: '/pedestrian-channel-management/device-deployment',
        name: 'device-deployment',
        component: './PedestrianChannelManagement/DeviceDeployment',
      },
      {
        path: '/pedestrian-channel-management/key-personnel-monitoring',
        name: 'key-personnel-monitoring',
        component: './PedestrianChannelManagement/KeyPersonnelMonitoring',
      },
      {
        path: '/pedestrian-channel-management/trajectory-tracking',
        name: 'trajectory-tracking',
        component: './PedestrianChannelManagement/TrajectoryTracking',
      },
      {
        path: '/pedestrian-channel-management/stranger-monitoring',
        name: 'stranger-monitoring',
        component: './PedestrianChannelManagement/StrangerMonitoring',
      },
      {
        path: '/pedestrian-channel-management/access-records',
        name: 'access-records',
        component: './PedestrianChannelManagement/AccessRecords',
      },
    ],
  },
  {
    path: '/key-personnel',
    name: 'key-personnel',
    icon: 'team',
    component: './UserManagement/KeyPersonnel',
  },
  {
    path: '/user-management',
    name: 'user-management',
    icon: 'user',
    routes: [
      {
        path: '/user-management',
        redirect: '/user-management/permission',
      },
      {
        path: '/user-management/permission',
        name: 'permission',
        component: './UserManagement/Permission',
      },
      {
        path: '/user-management/role',
        name: 'role',
        component: './UserManagement/Role',
      },
      {
        path: '/user-management/account',
        name: 'account',
        component: './UserManagement/Account',
      },
      {
        path: '/user-management/operation-log',
        name: 'operation-log',
        component: './UserManagement/OperationLog',
      },
    ],
  },
  {
    path: '/message-center',
    name: 'message-center',
    icon: 'bell',
    component: './MessageCenter',
  },

  {
    path: '/',
    redirect: '/device-management',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
