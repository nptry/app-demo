/**
 * 模块与权限组的展示名称映射
 */
const moduleTranslations: Record<string, string> = {
  role: '角色管理',
  permission: '权限管理',
  admin: '管理员管理',
  user: '用户管理',
  device: '设备管理',
  employee: '员工管理',
  customer: '客户管理',
  appointment: '预约管理',
  person_event_log: '摄像头日志',
  access_log: '日志查看',
  system_config: '系统配置',
  action_log: '行为日志',
  alarm_event_log: '预警事件日志',
  box_alarm_event: '车牌识别与记录',
  dashboard: '仪表盘',
  setting: '设置',
};

const groupTranslations: Record<string, string> = {
  system: '系统管理',
  basic: '基础数据',
  customer: '客户管理',
  logging: '日志管理',
  device: '设备管理',
  access: '访问控制',
  notification: '消息推送',
};

export const getModuleName = (moduleCode: string): string =>
  moduleTranslations[moduleCode] || moduleCode;

export const getGroupName = (groupCode: string): string =>
  groupTranslations[groupCode] || groupCode;

export default moduleTranslations;
