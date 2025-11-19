import type { Request, Response } from 'express';

const checkpointData = {
  summary: {
    total: 15,
    monitored: 12,
    aiNodes: 28,
    warnings24h: 5,
  },
  checkpoints: [
    {
      id: 'CP-001',
      name: 'Tin Can 港区卡口 A',
      district: 'Apapa',
      location: '港区北向入口',
      coordinates: '6.445192, 3.353281',
      coverageRoads: '港区主线 / 物流出口',
      types: ['车流统计', '车牌识别', '红灯监控'],
      manager: 'Chinedu',
      contact: '+234-802-011-9288',
      status: '正常',
      description: '港区主出入口，全天候运行',
    },
    {
      id: 'CP-004',
      name: '第三大陆桥桥头',
      district: 'Yaba',
      location: '第三大陆桥南向',
      coordinates: '6.496210, 3.383102',
      coverageRoads: '第三大陆桥 / Oworonshoki',
      types: ['车流统计', '逆行监控', '违规停车'],
      manager: 'Tunde',
      contact: '+234-801-782-5577',
      status: '关注',
      description: '早晚高峰拥堵点，需加强顺行引导',
    },
    {
      id: 'CP-007',
      name: 'Lekki 收费站',
      district: 'Lekki',
      location: 'Lekki-Epe 高速收费口',
      coordinates: '6.431821, 3.522288',
      coverageRoads: 'Lekki 高速',
      types: ['车牌识别', '红灯监控'],
      manager: 'Sara',
      contact: '+234-803-211-8822',
      status: '正常',
      description: '收费站车辆排队，依赖 AI 调度',
    },
    {
      id: 'CP-010',
      name: 'Benin 西入口',
      district: 'Lagos-Ibadan 高速',
      location: '高速公路西向',
      coordinates: '6.654521, 3.302111',
      coverageRoads: 'Lagos-Ibadan',
      types: ['车牌识别', '逆行监控'],
      manager: 'Idris',
      contact: '+234-805-233-7611',
      status: '中断',
      description: '当前骨干光纤调整，视频暂时不可用',
    },
  ],
  tasks: [
    {
      id: 'CP-T-01',
      title: 'Tin Can 南出口临时扩容',
      detail: '安装移动摄像机并调高阈值，避免车辆长时间滞留',
      window: '2024-05-10 06:00-10:00',
      owner: 'Chinedu',
    },
    {
      id: 'CP-T-03',
      title: '第三大陆桥顺行引导试点',
      detail: '新增逆行检测算法并联动交通广播',
      window: '2024-05-09 全天',
      owner: 'Tunde',
    },
  ],
};

const deploymentData = {
  summary: [
    { type: '港区卡口', cameras: 36, aiNodes: 10, gateways: 8 },
    { type: '城区路口', cameras: 28, aiNodes: 8, gateways: 7 },
    { type: '高速收费站', cameras: 18, aiNodes: 6, gateways: 4 },
  ],
  deployments: [
    {
      id: 'TD-001',
      checkpoint: 'Tin Can 港区卡口 A',
      deviceName: 'AI 边缘节点-港区 A1',
      deviceType: 'AI 边缘节点',
      poleCode: 'TC-A1',
      installation: '卡口北向岗亭',
      network: '市电 + 4G',
      status: '在线',
      aiModels: ['车牌识别', '红灯监测'],
    },
    {
      id: 'TD-003',
      checkpoint: '第三大陆桥桥头',
      deviceName: '高清摄像机-顺行 3 号',
      deviceType: '高清摄像机',
      poleCode: '3MB-03',
      installation: '桥头左侧墙体',
      network: '市电 + 光纤',
      status: '在线',
      aiModels: ['车流统计'],
    },
    {
      id: 'TD-006',
      checkpoint: 'Benin 西入口',
      deviceName: '4G 无线网关-高速西',
      deviceType: '4G 无线网关',
      poleCode: 'BEN-02',
      installation: '收费站机房',
      network: '4G + 卫星备份',
      status: '维护',
      aiModels: ['VPN 传输'],
    },
  ],
  maintenance: [
    {
      id: 'TM-01',
      checkpoint: 'Benin 西入口',
      action: '骨干光纤熔接 + 网关联调',
      schedule: '2024-05-09 21:00-23:00',
      owner: 'Idris',
      status: '待执行',
    },
    {
      id: 'TM-02',
      checkpoint: '第三大陆桥桥头',
      action: '逆行算法升级 v1.8',
      schedule: '2024-05-10 00:30-01:00',
      owner: 'Tunde',
      status: '执行中',
    },
  ],
};

const licenseData = {
  metrics: {
    totalToday: 18236,
    validPlates: 17890,
    blacklistHits: 6,
    lastSync: '2024-05-09 10:50',
  },
  records: [
    {
      id: 'LIC-001',
      checkpoint: 'Tin Can 港区卡口 A',
      plate: 'LAG-8821',
      vehicleType: '集卡',
      color: '蓝',
      captureTime: '2024-05-09 10:42:11',
      direction: '进港',
      status: '正常',
      snapshot: '/images/traffic/lic-001.jpg',
    },
    {
      id: 'LIC-004',
      checkpoint: '第三大陆桥桥头',
      plate: 'ABC-223LK',
      vehicleType: 'SUV',
      color: '黑',
      captureTime: '2024-05-09 10:38:06',
      direction: '离开城区',
      status: '异常',
      snapshot: '/images/traffic/lic-004.jpg',
    },
    {
      id: 'LIC-009',
      checkpoint: 'Lekki 收费站',
      plate: 'KJA-552FJ',
      vehicleType: '轿车',
      color: '白',
      captureTime: '2024-05-09 10:34:18',
      direction: '进城',
      status: '黑名单',
      snapshot: '/images/traffic/lic-009.jpg',
    },
  ],
};

const monitoringData = {
  metrics: {
    totalVehicles: 56200,
    avgSpeed: 38,
    incidents: 3,
    peakHour: '09:00-10:00',
  },
  trend: [
    { time: '06:00', inbound: 4800, outbound: 3500 },
    { time: '07:00', inbound: 7200, outbound: 5400 },
    { time: '08:00', inbound: 9800, outbound: 6600 },
    { time: '09:00', inbound: 11200, outbound: 7800 },
    { time: '10:00', inbound: 10300, outbound: 8500 },
  ],
  incidents: [
    {
      id: 'TI-01',
      checkpoint: '第三大陆桥桥头',
      type: '拥堵',
      description: '桥头轻微追尾导致 8 分钟拥堵',
      status: '已恢复',
      time: '2024-05-09 09:25',
    },
    {
      id: 'TI-02',
      checkpoint: 'Tin Can 港区卡口 A',
      type: '设备预警',
      description: 'AI 边缘节点温度偏高，切换风冷',
      status: '处理中',
      time: '2024-05-09 09:50',
    },
  ],
};

const redLightData = {
  metrics: {
    today: 18,
    handled: 12,
    pending: 6,
    avgHandleMins: 32,
  },
  records: [
    {
      id: 'RL-01',
      checkpoint: 'Lekki 收费站',
      plate: 'LAG-5521',
      violationTime: '2024-05-09 09:15',
      evidence: '/images/traffic/rl-01.jpg',
      level: '一般',
      handler: 'Sara',
      status: '已完成',
      description: '收费闸口车辆闯红灯强行通过',
    },
    {
      id: 'RL-02',
      checkpoint: 'Tin Can 港区卡口 A',
      plate: 'APP-1123',
      violationTime: '2024-05-09 09:43',
      evidence: '/images/traffic/rl-02.jpg',
      level: '严重',
      handler: 'Chinedu',
      status: '处理中',
      description: '大货车闯红灯与人行混行',
    },
  ],
};

const retrogradeData = {
  metrics: {
    today: 9,
    handled: 7,
    pending: 2,
    avgHandleMins: 18,
  },
  records: [
    {
      id: 'RG-01',
      checkpoint: '第三大陆桥桥头',
      plate: 'BDG-8221',
      violationTime: '2024-05-09 08:10',
      evidence: '/images/traffic/rg-01.jpg',
      level: '严重',
      handler: 'Tunde',
      status: '已完成',
      description: '两轮车逆行上桥',
    },
    {
      id: 'RG-03',
      checkpoint: 'Benin 西入口',
      plate: 'EPE-2399',
      violationTime: '2024-05-09 07:55',
      evidence: '/images/traffic/rg-03.jpg',
      level: '一般',
      handler: 'Idris',
      status: '待处置',
      description: '临时施工段车辆逆行掉头',
    },
  ],
};

const parkingData = {
  metrics: {
    today: 22,
    handled: 14,
    pending: 8,
    avgHandleMins: 26,
  },
  records: [
    {
      id: 'PK-01',
      checkpoint: '第三大陆桥桥头',
      plate: 'KTU-1133',
      violationTime: '2024-05-09 09:02',
      evidence: '/images/traffic/pk-01.jpg',
      level: '一般',
      handler: 'Tunde',
      status: '处理中',
      description: '路肩停车卸货影响通行',
    },
    {
      id: 'PK-03',
      checkpoint: 'Lekki 收费站',
      plate: 'ABC-2331',
      violationTime: '2024-05-09 08:28',
      evidence: '/images/traffic/pk-03.jpg',
      level: '严重',
      handler: 'Sara',
      status: '已完成',
      description: '私家车占用应急车道',
    },
  ],
};

export default {
  'GET /api/traffic/checkpoints': (req: Request, res: Response) => {
    res.json({ success: true, data: checkpointData });
  },
  'GET /api/traffic/deployments': (req: Request, res: Response) => {
    res.json({ success: true, data: deploymentData });
  },
  'GET /api/traffic/license-records': (req: Request, res: Response) => {
    res.json({ success: true, data: licenseData });
  },
  'GET /api/traffic/monitoring': (req: Request, res: Response) => {
    res.json({ success: true, data: monitoringData });
  },
  'GET /api/traffic/red-light': (req: Request, res: Response) => {
    res.json({ success: true, data: redLightData });
  },
  'GET /api/traffic/retrograde': (req: Request, res: Response) => {
    res.json({ success: true, data: retrogradeData });
  },
  'GET /api/traffic/parking': (req: Request, res: Response) => {
    res.json({ success: true, data: parkingData });
  },
};
