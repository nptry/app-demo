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
  'GET /api/device/status': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: statusData,
    });
  },
};
