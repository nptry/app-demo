import type { Request, Response } from 'express';

const basicInfoData = {
  summary: {
    total: 18,
    aiEdge: 10,
    gateways: 8,
    online: 15,
  },
  devices: [
    {
      id: 'DEV-AIE-001',
      name: 'AI 边缘节点-拉各斯 CBD',
      type: 'AI 边缘计算设备',
      model: 'AIE-4000',
      vendor: 'Didikon',
      serialNumber: 'AIE4000-202405-001',
      installDate: '2023-11-08',
      warrantyDate: '2026-11-07',
      status: '在线',
      remark: '2024-12 需升级算法版本',
    },
    {
      id: 'DEV-AIE-004',
      name: 'AI 边缘节点-港口堆场',
      type: 'AI 边缘计算设备',
      model: 'AIE-4200',
      vendor: 'Didikon',
      serialNumber: 'AIE4200-202405-004',
      installDate: '2024-01-12',
      warrantyDate: '2027-01-11',
      status: '在线',
    },
    {
      id: 'DEV-AIE-006',
      name: 'AI 边缘节点-维多利亚路口',
      type: 'AI 边缘计算设备',
      model: 'AIE-4200',
      vendor: 'Didikon',
      serialNumber: 'AIE4200-202405-006',
      installDate: '2024-02-20',
      warrantyDate: '2027-02-19',
      status: '维护中',
      remark: '2024-05-10 更换 UPS 模块',
    },
    {
      id: 'DEV-AIE-010',
      name: 'AI 边缘节点-人行通道一期',
      type: 'AI 边缘计算设备',
      model: 'AIE-3800',
      vendor: 'Didikon',
      serialNumber: 'AIE3800-202403-010',
      installDate: '2024-03-30',
      warrantyDate: '2027-03-29',
      status: '在线',
    },
    {
      id: 'DEV-AIE-012',
      name: 'AI 边缘节点-商贸区北侧',
      type: 'AI 边缘计算设备',
      model: 'AIE-4000',
      vendor: 'Didikon',
      serialNumber: 'AIE4000-202404-012',
      installDate: '2024-04-18',
      warrantyDate: '2027-04-17',
      status: '在线',
    },
  ],
};

const configInfoData = {
  summary: [
    {
      type: '重点区域监测',
      count: 7,
      coverage: 'Ikeja 商业区 / Balogun 市场',
      aiModels: ['人群密度', '目标人群', '异常聚集'],
    },
    {
      type: '交通卡口监测',
      count: 6,
      coverage: 'Tin Can 港区 / Victoria Island 主干道',
      aiModels: ['车牌识别', '逆行检测', '闯红灯'],
    },
    {
      type: '行人通道监测',
      count: 5,
      coverage: 'Oshodi 行人天桥 / BRT 枢纽',
      aiModels: ['行人统计', '重点人员', '通行记录'],
    },
  ],
  applications: [
    {
      deviceId: 'DEV-AIE-001',
      deviceName: 'AI 边缘节点-拉各斯 CBD',
      applicationType: '重点区域监测',
      region: 'Ikeja 商业区 A',
      address: 'Allen 大道智慧灯杆 12 号',
      coordinates: '6.601839, 3.351486',
      lampId: 'LAMP-IKJ-12',
      description: '监测 CBD 主广场人群密度与重点人员',
      deployDate: '2023-11-08',
    },
    {
      deviceId: 'DEV-AIE-004',
      deviceName: 'AI 边缘节点-港口堆场',
      applicationType: '交通卡口监测',
      region: 'Tin Can 港区卡口 B',
      address: '港区北向出口智慧灯杆',
      coordinates: '6.435188, 3.349822',
      lampId: 'LAMP-TC-08',
      description: '港区车辆出入与违停监测',
      deployDate: '2024-01-12',
    },
    {
      deviceId: 'DEV-AIE-006',
      deviceName: 'AI 边缘节点-维多利亚路口',
      applicationType: '交通卡口监测',
      region: 'Victoria Island 主干路',
      address: 'Adeola Odeku 与 Akin Adesola 路口',
      coordinates: '6.428512, 3.421087',
      lampId: 'LAMP-VI-03',
      description: '红灯抓拍、逆行检测',
      deployDate: '2024-02-20',
    },
    {
      deviceId: 'DEV-AIE-010',
      deviceName: 'AI 边缘节点-人行通道一期',
      applicationType: '行人通道监测',
      region: 'Oshodi 行人通行区',
      address: 'Oshodi 天桥中段',
      coordinates: '6.555303, 3.343987',
      lampId: 'LAMP-OSH-01',
      description: '行人通道关键点位人脸抓拍',
      deployDate: '2024-03-30',
    },
  ],
};

const statusData = {
  metrics: {
    onlineRate: 98.6,
    offlineDevices: 1,
    faultDevices: 1,
    lastSync: '2024-05-09 10:45:12',
  },
  statuses: [
    {
      deviceId: 'DEV-AIE-001',
      deviceName: 'AI 边缘节点-拉各斯 CBD',
      type: 'AI 边缘计算设备',
      realtimeStatus: '在线',
      cpuUsage: 58,
      memoryUsage: 61,
      uploadRate: '2.3 Mbps',
      lastHeartbeat: '2024-05-09 10:45:05',
    },
    {
      deviceId: 'DEV-AIE-006',
      deviceName: 'AI 边缘节点-维多利亚路口',
      type: 'AI 边缘计算设备',
      realtimeStatus: '维护中',
      cpuUsage: 32,
      memoryUsage: 40,
      uploadRate: '0 Mbps',
      lastHeartbeat: '2024-05-09 10:30:11',
      exception: '算法升级维护，现场待调试',
    },
    {
      deviceId: 'DEV-AIE-010',
      deviceName: 'AI 边缘节点-人行通道一期',
      type: 'AI 边缘计算设备',
      realtimeStatus: '在线',
      cpuUsage: 63,
      memoryUsage: 58,
      uploadRate: '1.8 Mbps',
      lastHeartbeat: '2024-05-09 10:43:12',
    },
  ],
};

export default {
  'GET /api/device/basic-info': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: basicInfoData,
    });
  },
  'GET /api/device/config-info': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: configInfoData,
    });
  },
  'GET /api/device/status': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: statusData,
    });
  },
};
