import { request } from '@umijs/max';

export type DeviceBasicInfoItem = {
  id: string;
  name: string;
  type: string;
  model: string;
  vendor: string;
  application: string;
  location: string;
  coordinates: string;
  status: 'online' | 'maintenance' | 'offline';
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

export type DeviceConfigSummary = {
  type: string;
  count: number;
  coverage: string;
  aiModels: string[];
};

export type DeviceDeploymentItem = {
  id: string;
  deviceName: string;
  applicationType: string;
  deploymentArea: string;
  poleCode: string;
  location: string;
  coordinates: string;
  network: string;
  edgeApps: string[];
};

export type DeviceConfigResponse = {
  applicationSummary: DeviceConfigSummary[];
  deployments: DeviceDeploymentItem[];
};

export type DeviceStatusItem = {
  id: string;
  deviceName: string;
  type: string;
  status: 'online' | 'warning' | 'offline';
  lastHeartbeat: string;
  healthScore: number;
  temperature: number;
  powerLoad: string;
  networkLatency: number;
};

export type DeviceAlertItem = {
  id: string;
  deviceName: string;
  issue: string;
  triggeredAt: string;
  handler: string;
  status: '处理中' | '已关闭';
};

export type DeviceStatusResponse = {
  metrics: {
    uptime: number;
    offlineDevices: number;
    warnings: number;
    lastSync: string;
  };
  statuses: DeviceStatusItem[];
  alerts: DeviceAlertItem[];
  trend: {
    time: string;
    online: number;
    warnings: number;
    offline: number;
  }[];
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export async function getDeviceBasicInfo(options?: { [key: string]: any }) {
  return request<ApiResponse<DeviceBasicInfoResponse>>('/api/device/basic-info', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getDeviceConfigInfo(options?: { [key: string]: any }) {
  return request<ApiResponse<DeviceConfigResponse>>('/api/device/config-info', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getDeviceStatus(options?: { [key: string]: any }) {
  return request<ApiResponse<DeviceStatusResponse>>('/api/device/status', {
    method: 'GET',
    ...(options || {}),
  });
}
