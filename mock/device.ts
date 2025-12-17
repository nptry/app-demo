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
      type: '智能盒子',
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
      type: '智能盒子',
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
      type: '智能盒子',
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
      type: '智能盒子',
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
      type: '智能盒子',
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
      type: '智能盒子',
      realtimeStatus: '在线',
      cpuUsage: 58,
      memoryUsage: 61,
      uploadRate: '2.3 Mbps',
      lastHeartbeat: '2024-05-09 10:45:05',
    },
    {
      deviceId: 'DEV-AIE-006',
      deviceName: 'AI 边缘节点-维多利亚路口',
      type: '智能盒子',
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
      type: '智能盒子',
      realtimeStatus: '在线',
      cpuUsage: 63,
      memoryUsage: 58,
      uploadRate: '1.8 Mbps',
      lastHeartbeat: '2024-05-09 10:43:12',
    },
  ],
};

const toApiStatus = (status: string) => {
  switch (status) {
    case '在线':
      return 'online';
    case '离线':
      return 'offline';
    case '故障':
      return 'fault';
    default:
      return 'maintenance';
  }
};

const deviceRecords = basicInfoData.devices.map((device, index) => ({
  id: index + 1,
  name: device.name,
  sn: device.serialNumber,
  model: device.model,
  status: toApiStatus(device.status),
  device_type: 'box',
  metadata: {
    remark: device.remark,
    vendor: device.vendor,
    install_date: device.installDate,
    warranty_date: device.warrantyDate,
  },
  point_ids: [],
  points: [],
  created_at: device.installDate,
  updated_at: device.installDate,
}));

export default {
  'GET /api/v1/admin/devices': (req: Request, res: Response) => {
    const page = Number(req.query?.page ?? 1);
    const perPage = Number(req.query?.per_page ?? deviceRecords.length);
    const start = (page - 1) * perPage;
    const pagedRecords = deviceRecords.slice(start, start + perPage);
    const pages = Math.max(1, Math.ceil(deviceRecords.length / perPage));

    res.json({
      success: true,
      data: {
        summary: basicInfoData.summary,
        records: pagedRecords,
        total: deviceRecords.length,
        page,
        per_page: perPage,
        pages,
      },
    });
  },
  'GET /api/v1/admin/devices/status': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: statusData,
    });
  },
};
