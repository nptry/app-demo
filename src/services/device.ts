import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type DeviceBasicInfoItem = {
  id: string;
  name: string;
  type: 'AI 边缘计算设备';
  model: string;
  vendor: string;
  serialNumber: string;
  installDate: string;
  warrantyDate: string;
  status: '在线' | '离线' | '故障' | '维护中';
  remark?: string;
};

export type DeviceBasicInfoResponse = {
  summary: {
    total: number;
    aiEdge: number;
    gateways: number;
    online: number;
  };
  devices: DeviceBasicInfoItem[];
};

export type DeviceApplicationSummary = {
  type: string;
  count: number;
  coverage: string;
  aiModels: string[];
};

export type DeviceApplicationItem = {
  deviceId: string;
  deviceName: string;
  applicationType: '重点区域监测' | '交通卡口监测' | '行人通道监测';
  region: string;
  address: string;
  coordinates: string;
  lampId: string;
  description?: string;
  deployDate: string;
};

export type DeviceConfigResponse = {
  summary: DeviceApplicationSummary[];
  applications: DeviceApplicationItem[];
};

export type DeviceStatusMetrics = {
  onlineRate: number;
  offlineDevices: number;
  faultDevices: number;
  lastSync: string;
};

export type DeviceStatusItem = {
  deviceId: string;
  deviceName: string;
  type: 'AI 边缘计算设备';
  realtimeStatus: '在线' | '离线' | '故障' | '维护中';
  cpuUsage?: number;
  memoryUsage?: number;
  signalStrength?: string;
  uploadRate: string;
  lastHeartbeat: string;
  exception?: string;
};

export type DeviceStatusResponse = {
  metrics: DeviceStatusMetrics;
  statuses: DeviceStatusItem[];
};

export async function getDeviceBasicInfo(options?: Record<string, any>) {
  return request<ApiResponse<DeviceBasicInfoResponse>>('/api/device/basic-info', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getDeviceConfigInfo(options?: Record<string, any>) {
  return request<ApiResponse<DeviceConfigResponse>>('/api/device/config-info', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getDeviceStatus(options?: Record<string, any>) {
  return request<ApiResponse<DeviceStatusResponse>>('/api/device/status', {
    method: 'GET',
    ...(options || {}),
  });
}
