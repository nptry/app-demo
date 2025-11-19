import type { Request, Response } from 'express';

const permissionData = {
  summary: {
    totalPermissions: 34,
    modules: 8,
    sensitive: 5,
  },
  permissions: [
    {
      id: 'PERM-01',
      module: '设备管理',
      description: '查看设备清单与详情',
      scope: ['查询', '导出'],
      assignedRoles: ['设备管理员', '运维主管'],
    },
    {
      id: 'PERM-05',
      module: '运维管理',
      description: '创建/派发工单',
      scope: ['新建', '派发', '关闭'],
      assignedRoles: ['运维调度'],
    },
    {
      id: 'PERM-11',
      module: '重点区域人群',
      description: '查看密度&告警数据',
      scope: ['实时监测', '下载截图'],
      assignedRoles: ['区域管理员', '值守人员'],
    },
    {
      id: 'PERM-20',
      module: '交通卡口',
      description: '查看车牌识别记录',
      scope: ['查询', '导出', '布控'],
      assignedRoles: ['交警联络员'],
    },
    {
      id: 'PERM-26',
      module: '用户管理',
      description: '添加/禁用账号',
      scope: ['新建', '修改', '禁用'],
      assignedRoles: ['平台管理员'],
    },
  ],
};

const roleData = {
  total: 9,
  roles: [
    {
      id: 'ROLE-01',
      name: '平台管理员',
      type: '管理',
      description: '负责平台策略、账号审批、全局配置',
      scope: ['用户管理', '安全策略', '全局设置'],
      members: 4,
      updatedAt: '2024-05-08 20:30',
    },
    {
      id: 'ROLE-03',
      name: '运维调度',
      type: '运维',
      description: '接收告警、创建工单、调度现场资源',
      scope: ['运维管理', '消息推送'],
      members: 6,
      updatedAt: '2024-05-09 09:40',
    },
    {
      id: 'ROLE-05',
      name: '区域管理员',
      type: '业务',
      description: '重点区域数据监测、现场协调与核查',
      scope: ['重点区域', '消息机制'],
      members: 8,
      updatedAt: '2024-05-07 17:12',
    },
    {
      id: 'ROLE-07',
      name: '数据分析',
      type: '业务',
      description: '输出运营分析报表并支持执法取证',
      scope: ['数据导出', '密度趋势', '车牌记录'],
      members: 3,
      updatedAt: '2024-05-06 11:00',
    },
  ],
};

const accountData = {
  summary: {
    total: 62,
    active: 48,
    pending: 6,
    locked: 8,
  },
  accounts: [
    {
      id: 'ACC-001',
      username: 'admin01',
      realName: 'Oluwaseun Ade',
      org: '拉各斯智慧项目部',
      dept: '平台管理中心',
      position: '平台管理员',
      phone: '+234-801-223-8899',
      email: 'admin01@didikon.com',
      role: '平台管理员',
      status: '启用',
      lastLogin: '2024-05-09 09:55',
    },
    {
      id: 'ACC-006',
      username: 'ops-supervisor',
      realName: 'Chinedu Lawson',
      org: '拉各斯智慧项目部',
      dept: '运维调度中心',
      position: '运维主管',
      phone: '+234-802-771-9822',
      email: 'ops.supervisor@didikon.com',
      role: '运维调度',
      status: '启用',
      lastLogin: '2024-05-09 10:22',
    },
    {
      id: 'ACC-012',
      username: 'area-manager-ikeja',
      realName: 'Grace Nneka',
      org: '拉各斯智慧项目部',
      dept: '重点区域中心',
      position: '区域管理员',
      phone: '+234-803-115-7644',
      email: 'grace@didikon.com',
      role: '区域管理员',
      status: '启用',
      lastLogin: '2024-05-09 08:47',
    },
    {
      id: 'ACC-017',
      username: 'contractor-temp',
      realName: 'Sara Yusuf',
      org: 'Didikon 供应商',
      dept: '临时支持',
      position: '外协工程师',
      phone: '+234-803-778-2288',
      email: 'sara.yusuf@contractor.com',
      role: '运维调度',
      status: '待激活',
      lastLogin: '--',
    },
    {
      id: 'ACC-021',
      username: 'ops-temp',
      realName: 'Idris Ajayi',
      org: '拉各斯智慧项目部',
      dept: '运维调度中心',
      position: '现场工程师',
      phone: '+234-805-233-7611',
      email: 'idris@didikon.com',
      role: '运维调度',
      status: '禁用',
      lastLogin: '2024-05-06 18:22',
    },
  ],
};

const logData = {
  logs: [
    {
      id: 'LOG-01',
      operator: 'Oluwaseun Ade',
      account: 'admin01',
      action: '创建账号',
      target: 'ops-supervisor',
      ip: '10.1.1.12',
      result: '成功',
      timestamp: '2024-05-09 09:42:11',
    },
    {
      id: 'LOG-03',
      operator: 'Chinedu Lawson',
      account: 'ops-supervisor',
      action: '禁用账号',
      target: 'ops-temp',
      ip: '10.1.5.33',
      result: '成功',
      timestamp: '2024-05-09 09:10:04',
    },
    {
      id: 'LOG-05',
      operator: 'Grace Nneka',
      account: 'area-manager-ikeja',
      action: '导出密度数据',
      target: 'Balogun 市场',
      ip: '10.1.9.18',
      result: '成功',
      timestamp: '2024-05-09 08:52:27',
    },
    {
      id: 'LOG-07',
      operator: 'Sara Yusuf',
      account: 'contractor-temp',
      action: '登录尝试',
      target: '平台',
      ip: '10.1.22.45',
      result: '失败',
      timestamp: '2024-05-09 07:10:16',
    },
  ],
};

const keyPersonData = {
  total: 11,
  onDuty: 7,
  backup: 4,
  persons: [
    {
      id: 'KP-01',
      name: 'Grace Nneka',
      role: '区域管理员',
      region: 'Ikeja 商业区',
      phone: '+234-803-115-7644',
      email: 'grace@didikon.com',
      permissions: ['重点区域', '告警响应'],
      status: '在岗',
    },
    {
      id: 'KP-03',
      name: 'Chinedu Lawson',
      role: '运维调度',
      region: '全局',
      phone: '+234-802-771-9822',
      email: 'ops.supervisor@didikon.com',
      permissions: ['运维工单', '网络监控'],
      status: '在岗',
    },
    {
      id: 'KP-05',
      name: 'Idris Ajayi',
      role: '网络工程师',
      region: '港区链路',
      phone: '+234-805-233-7611',
      email: 'idris@didikon.com',
      permissions: ['链路维护'],
      status: '停用',
    },
    {
      id: 'KP-07',
      name: 'Sara Yusuf',
      role: '外协工程师',
      region: 'Lekki 区',
      phone: '+234-803-778-2288',
      email: 'sara.yusuf@contractor.com',
      permissions: ['设备巡检'],
      status: '请假',
    },
  ],
};

export default {
  'GET /api/user/permissions': (req: Request, res: Response) => {
    res.json({ success: true, data: permissionData });
  },
  'GET /api/user/roles': (req: Request, res: Response) => {
    res.json({ success: true, data: roleData });
  },
  'GET /api/user/accounts': (req: Request, res: Response) => {
    res.json({ success: true, data: accountData });
  },
  'GET /api/user/operation-logs': (req: Request, res: Response) => {
    res.json({ success: true, data: logData });
  },
  'GET /api/user/key-persons': (req: Request, res: Response) => {
    res.json({ success: true, data: keyPersonData });
  },
};
