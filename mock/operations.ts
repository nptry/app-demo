import type { Request, Response } from 'express';

const infrastructureData = {
  summary: {
    regions: 8,
    checkpoints: 12,
    pedestrianZones: 5,
    lampPoles: 268,
    aiNodes: 68,
    gateways: 54,
  },
  infrastructures: [
    {
      id: 'INF-001',
      area: 'Ikeja 商业区',
      type: '重点区域',
      location: 'Allen 大道 / Awolowo 路',
      facilities: {
        lampPoles: 56,
        cameras: 84,
        aiNodes: 18,
        gateways: 12,
      },
      networkStatus: '正常',
      lastInspection: '2024-05-08 17:20',
      responsible: 'Oluwaseun',
    },
    {
      id: 'INF-004',
      area: 'Tin Can 港区卡口 B',
      type: '交通卡口',
      location: '港区北向出口',
      facilities: {
        lampPoles: 32,
        cameras: 48,
        aiNodes: 15,
        gateways: 9,
      },
      networkStatus: '关注',
      lastInspection: '2024-05-09 09:30',
      responsible: 'Chinedu',
    },
    {
      id: 'INF-007',
      area: 'Oshodi 行人天桥',
      type: '行人通道',
      location: 'Oshodi BRT 枢纽',
      facilities: {
        lampPoles: 44,
        cameras: 60,
        aiNodes: 12,
        gateways: 8,
      },
      networkStatus: '正常',
      lastInspection: '2024-05-09 07:55',
      responsible: 'Grace',
    },
    {
      id: 'INF-009',
      area: 'Victoria Island 主干路',
      type: '交通卡口',
      location: 'Adeola Odeku / Akin Adesola',
      facilities: {
        lampPoles: 38,
        cameras: 52,
        aiNodes: 14,
        gateways: 11,
      },
      networkStatus: '正常',
      lastInspection: '2024-05-08 15:10',
      responsible: 'Sara',
    },
    {
      id: 'INF-011',
      area: 'Balogun 市场',
      type: '重点区域',
      location: 'Balogun 北区',
      facilities: {
        lampPoles: 34,
        cameras: 46,
        aiNodes: 9,
        gateways: 7,
      },
      networkStatus: '中断',
      lastInspection: '2024-05-09 06:40',
      responsible: 'Idris',
    },
  ],
  networkLinks: [
    { id: 'LINK-01', name: '云平台 ↔ Ikeja 汇聚点', status: '正常', latency: '86 ms', availability: '99.91%' },
    { id: 'LINK-02', name: '云平台 ↔ Tin Can 港区', status: '预警', latency: '142 ms', availability: '99.24%' },
    { id: 'LINK-03', name: '云平台 ↔ Oshodi 枢纽', status: '正常', latency: '78 ms', availability: '99.95%' },
    { id: 'LINK-04', name: '云平台 ↔ Balogun 北区', status: '中断', latency: '--', availability: '96.40%' },
  ],
};

const resourceData = {
  summary: {
    teams: 5,
    engineers: 24,
    vehicles: 6,
    spareParts: 128,
  },
  engineers: [
    {
      id: 'ENG-003',
      name: 'Abiola',
      team: 'AI 算法保障组',
      specialty: '算法升级 / 远程维护',
      shift: '白班',
      phone: '+234-801-223-8899',
      status: '执行任务',
    },
    {
      id: 'ENG-006',
      name: 'Grace',
      team: '通道现场保障组',
      specialty: '通道布控 / 现场维护',
      shift: '夜班',
      phone: '+234-802-771-9822',
      status: '待命',
    },
    {
      id: 'ENG-011',
      name: 'Idris',
      team: '网络通信组',
      specialty: '4G 网关 / 传输线路',
      shift: '白班',
      phone: '+234-803-115-7644',
      status: '执行任务',
    },
    {
      id: 'ENG-014',
      name: 'Sara',
      team: '交通卡口保障组',
      specialty: '卡口布控 / 大灯维护',
      shift: '白班',
      phone: '+234-801-873-2231',
      status: '休整',
    },
    {
      id: 'ENG-018',
      name: 'Chinedu',
      team: '网络通信组',
      specialty: '骨干链路 / VPN',
      shift: '夜班',
      phone: '+234-802-099-2211',
      status: '待命',
    },
  ],
  assets: [
    { id: 'AST-01', type: '车辆', name: '应急保障车-1', quantity: 1, location: 'Ikeja 运维中心', availability: '执行 Tin Can 卡口故障处理' },
    { id: 'AST-03', type: '车辆', name: '巡检电动车', quantity: 3, location: 'Oshodi 枢纽', availability: '可用' },
    { id: 'AST-05', type: '备件', name: '工业摄像机', quantity: 26, location: 'Didikon 仓库', availability: '库存充足' },
    { id: 'AST-08', type: '备件', name: '4G 无线网关模块', quantity: 18, location: 'Tin Can 临时仓', availability: '可用于更换' },
    { id: 'AST-10', type: '工器具', name: '登高作业包', quantity: 4, location: 'Balogun 前置点', availability: '需补充 1 套' },
  ],
  dispatchPlans: [
    {
      id: 'PLAN-01',
      target: 'Balogun 北区基站',
      window: '2024-05-09 14:00-16:00',
      scope: '更换熔纤盒 + 骨干链路巡检',
      leader: 'Idris',
      status: '执行中',
    },
    {
      id: 'PLAN-02',
      target: 'Tin Can 卡口 B',
      window: '2024-05-09 20:00-23:00',
      scope: '4G 网关固件回退 + 交通相机调试',
      leader: 'Chinedu',
      status: '待命',
    },
    {
      id: 'PLAN-03',
      target: 'Oshodi 行人天桥',
      window: '2024-05-10 09:00-12:00',
      scope: '通道密度算法升级 + 现场核查',
      leader: 'Grace',
      status: '待命',
    },
  ],
};

const faultData = {
  overview: {
    todayAlarms: 7,
    openOrders: 3,
    avgResponseMins: 11,
    avgRecoveryHours: 2.6,
  },
  orders: [
    {
      id: 'ORD-20240509-01',
      title: '港区卡口 B 网络抖动',
      device: '4G 无线网关-港区二期',
      location: 'Tin Can 港区卡口 B',
      faultType: '网络中断',
      level: '高',
      reportedAt: '2024-05-09 08:42',
      channel: '远程',
      status: '处理中',
      assignedTo: 'Chinedu',
    },
    {
      id: 'ORD-20240509-02',
      title: 'Balogun 北区骨干光纤告警',
      device: 'AI 边缘节点-商贸区北侧',
      location: 'Balogun 市场北区',
      faultType: '传输异常',
      level: '中',
      reportedAt: '2024-05-09 07:55',
      channel: '现场',
      status: '待处理',
      assignedTo: 'Idris',
    },
    {
      id: 'ORD-20240508-04',
      title: 'Oshodi 行人通道温度上升',
      device: 'AI 边缘节点-人行通道一期',
      location: 'Oshodi 天桥',
      faultType: '设备温度',
      level: '中',
      reportedAt: '2024-05-08 22:18',
      channel: '远程',
      status: '已恢复',
      assignedTo: 'Grace',
    },
    {
      id: 'ORD-20240507-09',
      title: 'VI 主干路算法升级失败',
      device: 'AI 边缘节点-维多利亚路口',
      location: 'VI 主干路',
      faultType: '软件升级',
      level: '低',
      reportedAt: '2024-05-07 17:48',
      channel: '远程',
      status: '已恢复',
      assignedTo: 'Abiola',
    },
  ],
  remoteActions: [
    {
      id: 'ACT-01',
      device: '4G 无线网关-港区二期',
      action: '远程检测',
      detail: '对 4G 信号与 VPN 通道进行检测，发现基站侧丢包 18%',
      time: '2024-05-09 08:45',
      result: '触发应急路由策略',
    },
    {
      id: 'ACT-02',
      device: 'AI 边缘节点-维多利亚路口',
      action: '远程维护',
      detail: '重新加载算法容器并推送补丁包',
      time: '2024-05-08 23:10',
      result: '容器状态恢复正常',
    },
    {
      id: 'ACT-03',
      device: 'AI 边缘节点-人行通道一期',
      action: '远程升级',
      detail: '行人密度算法版本从 v2.3 升级至 v2.4',
      time: '2024-05-08 21:55',
      result: '升级成功，监控温度趋势',
    },
  ],
  distribution: [
    { category: '网络传输', count: 5, proportion: 38 },
    { category: '硬件设备', count: 4, proportion: 31 },
    { category: '算法/软件', count: 3, proportion: 23 },
    { category: '供电环境', count: 1, proportion: 8 },
  ],
};

const statisticsData = {
  kpis: {
    availability: 99.42,
    faultRate: 0.58,
    mttr: 2.4,
    responseWithin15: 93,
  },
  trend: [
    { month: '1月', incidents: 48, avgResponse: 14, remoteRate: 62 },
    { month: '2月', incidents: 52, avgResponse: 13, remoteRate: 65 },
    { month: '3月', incidents: 44, avgResponse: 12, remoteRate: 68 },
    { month: '4月', incidents: 38, avgResponse: 11, remoteRate: 71 },
    { month: '5月', incidents: 17, avgResponse: 10, remoteRate: 74 },
  ],
  resourceUsage: [
    { resource: 'AI 算法保障组', utilization: 78, workload: '重点区域算法巡检 + 升级' },
    { resource: '网络通信组', utilization: 86, workload: '骨干链路巡检 + 4G 网关优化' },
    { resource: '交通卡口保障组', utilization: 64, workload: '卡口摄像机维保 + 现场检修' },
    { resource: '通道现场保障组', utilization: 71, workload: '人行通道实时巡查' },
  ],
  networkHealth: [
    { node: 'Ikeja 汇聚点', latency: '82 ms', packetLoss: '0.9%', status: '正常' },
    { node: 'Tin Can 港区', latency: '148 ms', packetLoss: '2.6%', status: '关注' },
    { node: 'Balogun 北区', latency: '--', packetLoss: '--', status: '中断' },
    { node: 'Oshodi 枢纽', latency: '76 ms', packetLoss: '0.6%', status: '正常' },
  ],
};

export default {
  'GET /api/operations/infrastructure': (req: Request, res: Response) => {
    res.json({ success: true, data: infrastructureData });
  },
  'GET /api/operations/resources': (req: Request, res: Response) => {
    res.json({ success: true, data: resourceData });
  },
  'GET /api/operations/faults': (req: Request, res: Response) => {
    res.json({ success: true, data: faultData });
  },
  'GET /api/operations/statistics': (req: Request, res: Response) => {
    res.json({ success: true, data: statisticsData });
  },
};
