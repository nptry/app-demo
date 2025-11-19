import type { Request, Response } from 'express';

const channelInfo = {
  summary: {
    totalChannels: 22,
    coveredDistricts: 9,
    aiNodes: 14,
    warningsToday: 3,
  },
  channels: [
    {
      id: 'CH-001',
      name: 'Oshodi 天桥北口',
      district: 'Oshodi-Isolo',
      location: '天桥北向入口与 BRT 站旁',
      coordinates: '6.555303, 3.343987',
      type: '天桥',
      manager: 'Grace',
      contact: '+234-803-778-2288',
      status: '正常',
      description: '全天候开放，晚间需加强照明',
    },
    {
      id: 'CH-005',
      name: 'CMS 地铁出口',
      district: 'Lagos Island',
      location: '地铁站东出口',
      coordinates: '6.454332, 3.394822',
      type: '地铁口',
      manager: 'Sara',
      contact: '+234-802-668-2211',
      status: '关注',
      description: '早晚高峰拥挤，需要联动保安分流',
    },
    {
      id: 'CH-009',
      name: 'Lekki BRT 走廊',
      district: 'Lekki',
      location: 'BRT 高架与地面换乘区',
      coordinates: '6.429912, 3.534421',
      type: '换乘区',
      manager: 'Idris',
      contact: '+234-805-233-7611',
      status: '维护',
      description: '当前进行施工封闭，部分通道改道',
    },
  ],
  measures: [
    {
      id: 'CH-M-01',
      title: 'CMS 高峰限流',
      owner: 'Sara',
      window: '每日 17:00-19:00',
      detail: '与轨道公司联动，实行 5 分钟一次闸门打开',
    },
    {
      id: 'CH-M-02',
      title: 'Oshodi 夜间巡逻',
      owner: 'Grace',
      window: '每日 22:00-02:00',
      detail: '补充 2 组巡逻队伍，检查陌生人聚集',
    },
  ],
};

const deploymentData = {
  devices: [
    {
      id: 'CHD-001',
      channelName: 'Oshodi 天桥北口',
      deviceName: 'AI 边缘节点-OSH-01',
      deviceType: 'AI 边缘节点',
      installation: '天桥北向拱顶',
      poleCode: 'OSH-01',
      aiModels: ['人脸识别', '轨迹跟踪'],
      network: '市电 + 4G',
      status: '在线',
    },
    {
      id: 'CHD-004',
      channelName: 'CMS 地铁出口',
      deviceName: '高清摄像机-CMS-02',
      deviceType: '高清摄像机',
      installation: '通道天花',
      poleCode: 'CMS-02',
      aiModels: ['人群统计'],
      network: '市电 + 光纤',
      status: '在线',
    },
    {
      id: 'CHD-009',
      channelName: 'Lekki BRT 走廊',
      deviceName: '4G 网关-LK-01',
      deviceType: '4G 网关',
      installation: '临时配电箱',
      poleCode: 'LK-01',
      aiModels: ['VPN'],
      network: '4G + 卫星备份',
      status: '维护',
    },
  ],
};

const watchData = {
  metrics: {
    watchlist: 34,
    hitsToday: 2,
    onlineTasks: 3,
    lastPush: '2024-05-09 10:36',
  },
  persons: [
    {
      id: 'CHW-01',
      personName: 'Obi Henry',
      gender: '男',
      age: 32,
      tags: ['黑名单'],
      channelName: 'CMS 地铁出口',
      lastSeen: '2024-05-09 09:58',
      status: '待核查',
    },
    {
      id: 'CHW-02',
      personName: 'Chioma Ada',
      gender: '女',
      age: 27,
      tags: ['重点关注', '重复出现'],
      channelName: 'Oshodi 天桥北口',
      lastSeen: '2024-05-09 09:12',
      status: '跟踪中',
    },
    {
      id: 'CHW-04',
      personName: 'Bello Sodiq',
      gender: '男',
      age: 41,
      tags: ['协查'],
      channelName: 'Lekki BRT 走廊',
      lastSeen: '2024-05-08 21:05',
      status: '已处理',
    },
  ],
  events: [
    {
      id: 'CHE-01',
      personName: 'Obi Henry',
      eventType: '黑名单触发',
      time: '2024-05-09 09:58',
      action: '推送至轨道安保组并派出巡逻',
      operator: 'Sara',
    },
    {
      id: 'CHE-02',
      personName: 'Chioma Ada',
      eventType: '逗留超时',
      time: '2024-05-09 09:20',
      action: '通知现场巡查确认',
      operator: 'Grace',
    },
  ],
};

const trajectoryData = {
  trajectories: [
    {
      id: 'TR-01',
      personName: 'Chioma Ada',
      path: 'Oshodi 北口 → 过街天桥 → BRT 南站',
      duration: '12 分钟',
      lastSeen: '2024-05-09 09:12',
      confidence: 92,
    },
    {
      id: 'TR-03',
      personName: 'Obi Henry',
      path: 'CMS 地铁出口 → 地面公交 → 市场',
      duration: '18 分钟',
      lastSeen: '2024-05-09 09:58',
      confidence: 87,
    },
  ],
};

const strangerData = {
  metrics: {
    today: 11,
    highRisk: 3,
    followUp: 4,
  },
  records: [
    {
      id: 'STR-01',
      channelName: 'Oshodi 天桥北口',
      captureTime: '2024-05-09 08:56',
      description: '陌生人连续三次在天桥南口徘徊',
      evidence: '/images/ped/str-01.jpg',
      status: '已通知',
    },
    {
      id: 'STR-03',
      channelName: 'CMS 地铁出口',
      captureTime: '2024-05-09 09:44',
      description: '携带大件行李可疑停留 6 分钟',
      evidence: '/images/ped/str-03.jpg',
      status: '已确认',
    },
  ],
};

const accessData = {
  total: 28600,
  records: [
    {
      id: 'ACC-01',
      channelName: 'Oshodi 天桥北口',
      personName: 'Okoro Jane',
      credential: '人脸识别',
      direction: '进站',
      time: '2024-05-09 10:44',
    },
    {
      id: 'ACC-04',
      channelName: 'CMS 地铁出口',
      personName: 'Ngene Peter',
      credential: '人脸识别',
      direction: '出站',
      time: '2024-05-09 10:39',
    },
    {
      id: 'ACC-08',
      channelName: 'Lekki BRT 走廊',
      personName: 'Olawale Timi',
      credential: '二维码',
      direction: '进站',
      time: '2024-05-09 10:30',
    },
  ],
};

export default {
  'GET /api/pedestrian/channels': (req: Request, res: Response) => {
    res.json({ success: true, data: channelInfo });
  },
  'GET /api/pedestrian/deployments': (req: Request, res: Response) => {
    res.json({ success: true, data: deploymentData });
  },
  'GET /api/pedestrian/watch': (req: Request, res: Response) => {
    res.json({ success: true, data: watchData });
  },
  'GET /api/pedestrian/trajectories': (req: Request, res: Response) => {
    res.json({ success: true, data: trajectoryData });
  },
  'GET /api/pedestrian/strangers': (req: Request, res: Response) => {
    res.json({ success: true, data: strangerData });
  },
  'GET /api/pedestrian/access': (req: Request, res: Response) => {
    res.json({ success: true, data: accessData });
  },
};
