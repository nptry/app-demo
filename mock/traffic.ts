import type { Request, Response } from 'express';

const checkpointData = {
  summary: {
    total: 15,
    enabled: 12,
    laneCount: 68,
  },
  checkpoints: [
    {
      id: 'CP-001',
      name: 'Tin Can 港区卡口 A',
      checkpointTypes: ['车流监测', '车牌采集', '红灯监测', '逆行监测', '违停管理'],
      region: 'Apapa 港区',
      address: '港区北向入口',
      coordinates: '6.445192, 3.353281',
      laneCount: 4,
      laneDescription: '1：集卡直行；2：集卡左转；3：社会车辆；4：出口专用',
      speedLimit: 30,
      manager: 'Chinedu Lawson',
      phone: '08027719822',
      mapFile: 'TinCan-A.png',
      status: '启用',
    },
    {
      id: 'CP-004',
      name: '第三大陆桥桥头',
      checkpointTypes: ['车流监测', '逆行监测', '违停管理'],
      region: 'Yaba',
      address: '第三大陆桥南向入城',
      coordinates: '6.496210, 3.383102',
      laneCount: 3,
      laneDescription: '1：BRT 专用；2：社会车道；3：货运缓行',
      speedLimit: 60,
      manager: 'Tunde Alade',
      phone: '08017825577',
      mapFile: '3MB-South.pdf',
      status: '启用',
    },
    {
      id: 'CP-007',
      name: 'Lekki 收费站',
      checkpointTypes: ['车牌采集', '红灯监测'],
      region: 'Lekki',
      address: 'Lekki-Epe 高速收费口',
      coordinates: '6.431821, 3.522288',
      laneCount: 6,
      laneDescription: '4 条 ETC + 2 条人工',
      speedLimit: 40,
      manager: 'Sara Yusuf',
      phone: '08037782288',
      mapFile: 'Lekki-Toll.dwg',
      status: '启用',
    },
    {
      id: 'CP-010',
      name: 'Benin 西入口',
      checkpointTypes: ['车牌采集', '逆行监测'],
      region: 'Lagos-Ibadan 高速',
      address: '高速西向入口',
      coordinates: '6.654521, 3.302111',
      laneCount: 2,
      laneDescription: '1：西向入城；2：货运绕行',
      speedLimit: 70,
      manager: 'Idris Ajayi',
      phone: '08052337611',
      mapFile: 'Benin-West.png',
      status: '禁用',
    },
  ],
};

const deploymentData = {
  deployments: [
    {
      id: 'TD-001',
      checkpointId: 'CP-001',
      checkpointName: 'Tin Can 港区卡口 A',
      deviceType: '高清数字摄像机',
      deviceId: 'CAM-TC-A1',
      deviceName: '北向 1 号相机',
      lane: '车道 1：集卡直行',
      position: '北向岗亭东侧 4m',
      lensFocal: '12mm',
      installDate: '2024-02-28',
      owner: 'Chinedu Lawson',
      status: '正常运行',
      result: '识别准确率 98%',
    },
    {
      id: 'TD-002',
      checkpointId: 'CP-001',
      checkpointName: 'Tin Can 港区卡口 A',
      deviceType: 'AI 边缘计算设备',
      deviceId: 'AIE-TC-01',
      deviceName: '港区卡口 AI 节点',
      lane: '全车道',
      position: '岗亭机房',
      installDate: '2024-02-25',
      owner: 'Chinedu Lawson',
      status: '正常运行',
      result: '密度算法正常',
    },
    {
      id: 'TD-006',
      checkpointId: 'CP-004',
      checkpointName: '第三大陆桥桥头',
      deviceType: '高清数字摄像机',
      deviceId: 'CAM-3MB-03',
      deviceName: '顺行 3 号',
      lane: '车道 2：社会车辆',
      position: '桥头左侧墙体',
      lensFocal: '8mm',
      installDate: '2024-03-15',
      owner: 'Tunde Alade',
      status: '待调试',
    },
  ],
};

const licenseData = {
  records: [
    {
      id: 'LIC-001',
      checkpointName: 'Tin Can 港区卡口 A',
      lane: '车道 1：集卡直行',
      captureTime: '2024-05-09 10:42:11',
      plateNumber: 'LAG-8821',
      plateColor: '蓝色',
      vehicleColor: '黄色',
      vehicleType: '集卡',
      speed: 28,
      photos: ['/images/traffic/lic-001-front.jpg', '/images/traffic/lic-001-side.jpg'],
      accuracy: 0.97,
      abnormal: false,
      deviceId: 'CAM-TC-A1',
    },
    {
      id: 'LIC-006',
      checkpointName: '第三大陆桥桥头',
      lane: '车道 2：社会车辆',
      captureTime: '2024-05-09 10:38:06',
      plateNumber: 'ABC-223LK',
      plateColor: '黄色',
      vehicleColor: '黑色',
      vehicleType: 'SUV',
      speed: 72,
      photos: ['/images/traffic/lic-004-front.jpg'],
      accuracy: 0.91,
      abnormal: true,
      reason: '疑似遮挡，需人工核查',
      deviceId: 'CAM-3MB-02',
    },
  ],
};

const monitoringData = {
  records: [
    {
      id: 'FLOW-CP-001-1030',
      checkpointName: 'Tin Can 港区卡口 A',
      lane: '车道 1：集卡直行',
      period: '10:00-10:30',
      range: '2024-05-09 10:00-10:30',
      totalVehicles: 130,
      threshold: 150,
      congestion: false,
      avgSpeed: 32,
      maxSpeed: 48,
      deviceId: 'AIE-TC-01',
      accuracy: 0.9,
    },
    {
      id: 'FLOW-CP-004-1015',
      checkpointName: '第三大陆桥桥头',
      lane: '车道 2：社会车辆',
      period: '10:00-10:15',
      range: '2024-05-09 10:00-10:15',
      totalVehicles: 420,
      threshold: 350,
      congestion: true,
      duration: '15 分钟',
      suggestion: '广播提醒绕行，通知交警现场疏导',
      avgSpeed: 18,
      maxSpeed: 40,
      deviceId: 'AIE-3MB-01',
      accuracy: 0.87,
    },
  ],
};

const redLightData = [
  {
    id: 'RED-001',
    checkpointName: 'Lekki 收费站',
    lane: 'ETC 1 号',
    violationTime: '2024-05-09 09:15:12.321',
    lightOnTime: '2024-05-09 09:15:10.000',
    plateNumber: 'KJA-552FJ',
    vehicleType: '轿车',
    photos: ['/images/redlight/red-001-a.jpg', '/images/redlight/red-001-b.jpg', '/images/redlight/red-001-c.jpg'],
    video: '/videos/redlight/red-001.mp4',
    position: '东向西第一道停止线',
    speed: 48,
    alarm: {
      triggered: true,
      receiver: 'Sara Yusuf',
      status: '处理中（录入执法系统）',
      remark: '准备生成罚单',
    },
    deviceId: 'CAM-LEK-01',
    accuracy: 0.96,
  },
];

const retrogradeData = [
  {
    id: 'REV-001',
    checkpointName: '第三大陆桥桥头',
    lane: '单向南向',
    directionRule: '仅允许南向→北向',
    violationTime: '2024-05-09 08:35:22.103',
    plateNumber: 'LND-667K',
    vehicleType: '小型货车',
    photos: ['/images/retro/rev-001-a.jpg', '/images/retro/rev-001-b.jpg'],
    video: '/videos/rev/rev-001.mp4',
    distance: 120,
    speed: 30,
    alarmStatus: '通知交警拦截',
    remark: '交警 3 分钟后拦截',
    deviceId: 'CAM-3MB-05',
    accuracy: 0.92,
  },
];

const parkingData = [
  {
    id: 'PARK-001',
    checkpointName: 'Tin Can 港区卡口 A',
    area: '卡口东侧禁停区',
    rule: '全天禁停',
    startTime: '2024-05-09 09:40:10',
    duration: '00:07:40',
    threshold: 180,
    plateNumber: 'LAG-991XK',
    vehicleType: '小货车',
    photos: ['/images/park/park-001-a.jpg', '/images/park/park-001-b.jpg'],
    video: '/videos/park/park-001.mp4',
    specialVehicle: false,
    alarmStatus: '处理中（通知执法）',
    remark: '执法队 09:50 到场',
    deviceId: 'CAM-TC-A4',
    accuracy: 0.89,
  },
];

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
