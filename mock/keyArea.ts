import type { Request, Response } from 'express';

const siteData = {
  summary: {
    totalSites: 12,
    coverageSqKm: 6.8,
    avgDailyVisitors: 185000,
    alerts24h: 6,
  },
  sites: [
    {
      id: 'SITE-001',
      name: 'Ikeja 商业区',
      type: '商业区',
      district: 'Ikeja',
      address: 'Allen 大道与Obafemi路交汇',
      areaSize: '1.3 km²',
      manager: 'Oluwaseun',
      contact: '+234-801-882-2211',
      status: '正常',
      riskLevel: '中',
      description: 'CBD 核心片区，周边有大型购物中心与地铁站',
    },
    {
      id: 'SITE-004',
      name: 'Balogun 市场',
      type: '商业区',
      district: 'Lagos Island',
      address: 'Balogun 北区',
      areaSize: '0.8 km²',
      manager: 'Idris',
      contact: '+234-802-312-9877',
      status: '关注',
      riskLevel: '高',
      description: '人群密度高，易发生踩踏与扒窃风险',
    },
    {
      id: 'SITE-006',
      name: 'Oshodi 枢纽',
      type: '交通枢纽',
      district: 'Oshodi-Isolo',
      address: 'Oshodi BRT 枢纽与天桥',
      areaSize: '0.6 km²',
      manager: 'Grace',
      contact: '+234-803-778-2288',
      status: '正常',
      riskLevel: '中',
      description: 'BRT / 铁路 / 天桥三线交汇，全天候人流',
    },
    {
      id: 'SITE-009',
      name: 'Tafawa Balewa 广场',
      type: '活动区域',
      district: 'Lagos Island',
      address: 'Awolowo 路 45 号',
      areaSize: '0.5 km²',
      manager: 'Sara',
      contact: '+234-805-221-9910',
      status: '管控',
      riskLevel: '高',
      description: '大型活动举办地，本周举办音乐节需要加强控流',
    },
  ],
  measures: [
    {
      id: 'MS-01',
      title: 'Balogun 北区“单向通行”管控',
      detail: '对 A/B 主通道实施单向通行，引导人流走外围回流',
      owner: 'Idris',
      lastUpdate: '2024-05-08 18:30',
    },
    {
      id: 'MS-02',
      title: 'Oshodi 夜间巡查',
      detail: '夜间 22:00-02:00 增派 2 组巡查队，重点关注天桥南口',
      owner: 'Grace',
      lastUpdate: '2024-05-09 07:10',
    },
    {
      id: 'MS-03',
      title: '音乐节现场容量控制',
      detail: '对广场分区设置 4 条入场闸机，超 80% 密度自动暂停入场',
      owner: 'Sara',
      lastUpdate: '2024-05-09 09:50',
    },
  ],
};

const deploymentData = {
  summary: [
    { type: '重点区域', cameras: 64, aiNodes: 18, gateways: 12, coverage: 'Ikeja / Balogun' },
    { type: '交通枢纽', cameras: 42, aiNodes: 11, gateways: 8, coverage: 'Oshodi / CMS' },
    { type: '活动区域', cameras: 26, aiNodes: 7, gateways: 5, coverage: 'Tafawa Balewa / 国家体育场' },
  ],
  deployments: [
    {
      id: 'DEP-001',
      areaName: 'Ikeja 商业区',
      deviceName: 'AI 边缘节点-Allen 大道',
      deviceType: 'AI 边缘节点',
      poleCode: 'IKEJA-08',
      location: 'Allen 大道 8 号灯杆',
      coordinates: '6.601839, 3.351486',
      aiModels: ['人群密度', '重点人员'],
      status: '在线',
    },
    {
      id: 'DEP-004',
      areaName: 'Balogun 市场',
      deviceName: '4G 无线网关-北区',
      deviceType: '4G 无线网关',
      poleCode: 'BAL-02',
      location: '北区入口光纤交接箱',
      coordinates: '6.452772, 3.395870',
      aiModels: ['网络备份'],
      status: '维护',
    },
    {
      id: 'DEP-006',
      areaName: 'Oshodi 枢纽',
      deviceName: '高清摄像机-天桥中段',
      deviceType: '高清摄像机',
      poleCode: 'OSH-05',
      location: '天桥中段 5 号灯杆',
      coordinates: '6.555303, 3.343987',
      aiModels: ['人流方向'],
      status: '在线',
    },
    {
      id: 'DEP-010',
      areaName: 'Tafawa Balewa 广场',
      deviceName: 'AI 边缘节点-西入口',
      deviceType: 'AI 边缘节点',
      poleCode: 'TBP-03',
      location: '西入口布控点',
      coordinates: '6.445912, 3.406210',
      aiModels: ['密度分析', '异常聚集'],
      status: '在线',
    },
  ],
  maintenancePlans: [
    {
      id: 'MP-01',
      areaName: 'Balogun 市场',
      action: '4G 网关更换 + 供电巡检',
      window: '2024-05-10 02:00-05:00',
      owner: 'Idris',
      status: '待执行',
    },
    {
      id: 'MP-02',
      areaName: 'Oshodi 枢纽',
      action: '人流算法升级 v2.4',
      window: '2024-05-09 23:00-23:40',
      owner: 'Grace',
      status: '执行中',
    },
    {
      id: 'MP-03',
      areaName: 'Tafawa Balewa 广场',
      action: '移动摄像机临时加装',
      window: '2024-05-09 15:00-17:00',
      owner: 'Sara',
      status: '完成',
    },
  ],
};

const densityData = {
  metrics: {
    realtimeIndex: 63,
    highRiskZones: 3,
    warningsToday: 4,
    lastSync: '2024-05-09 10:45',
  },
  areas: [
    {
      id: 'DEN-001',
      areaName: 'Balogun 市场',
      zone: '北区 A1',
      realtimeDensity: 85,
      threshold: 80,
      status: '超限',
      change: '+6%',
    },
    {
      id: 'DEN-004',
      areaName: 'Oshodi 枢纽',
      zone: '天桥南口',
      realtimeDensity: 58,
      threshold: 70,
      status: '正常',
      change: '-4%',
    },
    {
      id: 'DEN-006',
      areaName: 'Tafawa Balewa 广场',
      zone: '主舞台前区',
      realtimeDensity: 74,
      threshold: 75,
      status: '预警',
      change: '+3%',
    },
    {
      id: 'DEN-009',
      areaName: 'Ikeja 商业区',
      zone: 'CBD 西侧',
      realtimeDensity: 62,
      threshold: 80,
      status: '正常',
      change: '+1%',
    },
  ],
  trend: [
    { time: '08:00', avgDensity: 48, highDensityZones: 1 },
    { time: '09:00', avgDensity: 55, highDensityZones: 2 },
    { time: '10:00', avgDensity: 63, highDensityZones: 3 },
    { time: '11:00', avgDensity: 60, highDensityZones: 2 },
  ],
  alerts: [
    {
      id: 'ALERT-01',
      areaName: 'Balogun 市场 北区 A1',
      reason: '密度超过 80%，自动启动单向放行',
      triggeredAt: '2024-05-09 09:55',
      handler: 'Idris',
      status: '处理中',
    },
    {
      id: 'ALERT-02',
      areaName: 'Tafawa Balewa 主舞台',
      reason: '连续 5 分钟密度上升，推送预警',
      triggeredAt: '2024-05-09 09:40',
      handler: 'Sara',
      status: '已处理',
    },
  ],
};

const flowData = {
  metrics: {
    totalToday: 138000,
    peakHour: '09:00-10:00',
    abnormalEvents: 2,
    avgSpeed: 0.92,
  },
  directions: [
    {
      id: 'FLOW-001',
      areaName: 'Oshodi 枢纽',
      mainDirection: '北 → 南',
      eastToWest: 3200,
      westToEast: 2800,
      congestionLevel: '轻度拥挤',
    },
    {
      id: 'FLOW-003',
      areaName: 'Ikeja 商业区',
      mainDirection: '东 → 西',
      eastToWest: 4100,
      westToEast: 2500,
      congestionLevel: '畅通',
    },
    {
      id: 'FLOW-005',
      areaName: 'Tafawa Balewa 广场',
      mainDirection: '多点向内',
      eastToWest: 2100,
      westToEast: 1900,
      congestionLevel: '拥挤',
    },
  ],
  trend: [
    { time: '07:00', inbound: 8200, outbound: 6100 },
    { time: '08:00', inbound: 11200, outbound: 8400 },
    { time: '09:00', inbound: 14600, outbound: 9100 },
    { time: '10:00', inbound: 13100, outbound: 9900 },
    { time: '11:00', inbound: 11800, outbound: 10400 },
  ],
  events: [
    {
      id: 'FE-01',
      areaName: 'Oshodi 枢纽',
      type: '异常反向流动',
      detail: 'BRT 北口出现 200 人逆向拥入，触发广播疏导',
      time: '2024-05-09 09:20',
      status: '已恢复',
    },
    {
      id: 'FE-02',
      areaName: 'Tafawa Balewa 广场',
      type: '拥堵持续',
      detail: '主舞台出口拥堵 6 分钟，已扩展外圈缓冲区',
      time: '2024-05-09 09:50',
      status: '处理中',
    },
  ],
};

const targetData = {
  metrics: {
    watchlist: 62,
    hitsToday: 3,
    activeTracking: 5,
    lastPush: '2024-05-09 10:32',
  },
  focusPersons: [
    {
      id: 'TP-01',
      name: 'Okoye Chika',
      gender: '女',
      age: 34,
      tags: ['涉案', '频繁出现'],
      lastSeen: '2024-05-09 09:42',
      status: '跟踪中',
      areaName: 'Balogun 市场',
      riskLevel: '高',
    },
    {
      id: 'TP-04',
      name: 'Abdul Musa',
      gender: '男',
      age: 41,
      tags: ['重点关注'],
      lastSeen: '2024-05-09 08:58',
      status: '已核查',
      areaName: 'Ikeja 商业区',
      riskLevel: '中',
    },
    {
      id: 'TP-06',
      name: 'Sarah Bello',
      gender: '女',
      age: 29,
      tags: ['黑名单'],
      lastSeen: '2024-05-09 08:10',
      status: '待核查',
      areaName: 'Tafawa Balewa 广场',
      riskLevel: '高',
    },
  ],
  events: [
    {
      id: 'TE-01',
      personName: 'Okoye Chika',
      eventType: '黑名单触发',
      areaName: 'Balogun 市场北区',
      matchedAt: '2024-05-09 09:42',
      action: '通知现场巡逻人员核查',
      handler: 'Idris',
    },
    {
      id: 'TE-02',
      personName: 'Sarah Bello',
      eventType: '频繁停留',
      areaName: 'Tafawa Balewa 广场',
      matchedAt: '2024-05-09 08:12',
      action: '推送移动警务终端确认',
      handler: 'Sara',
    },
  ],
  patrols: [
    {
      id: 'PR-01',
      areaName: 'Balogun 市场',
      task: '黑名单复核 + 封控点巡查',
      result: '确认人员已离开，保持 30 分钟观察',
      time: '2024-05-09 10:05',
      operator: 'Idris',
    },
    {
      id: 'PR-03',
      areaName: 'Oshodi 枢纽',
      task: '夜间巡逻',
      result: '未发现异常，补充 2 块引导标识',
      time: '2024-05-09 07:30',
      operator: 'Grace',
    },
  ],
};

export default {
  'GET /api/key-area/sites': (req: Request, res: Response) => {
    res.json({ success: true, data: siteData });
  },
  'GET /api/key-area/deployments': (req: Request, res: Response) => {
    res.json({ success: true, data: deploymentData });
  },
  'GET /api/key-area/density': (req: Request, res: Response) => {
    res.json({ success: true, data: densityData });
  },
  'GET /api/key-area/flow': (req: Request, res: Response) => {
    res.json({ success: true, data: flowData });
  },
  'GET /api/key-area/targets': (req: Request, res: Response) => {
    res.json({ success: true, data: targetData });
  },
};
