import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type DevicePointInfo = {
  id: number;
  name: string;
  pointType: 'checkpoint' | 'site';
  code?: string;
  deviceId?: number;
};

export type DeviceRecord = {
  id: number;
  name: string;
  sn?: string;
  model?: string;
  status?: 'online' | 'offline' | 'fault' | 'maintenance';
  device_type?: string;
  ip_address?: string;
  device_identifier?: string;
  metadata?: Record<string, any>;
  point_ids?: number[];
  points?: DevicePointInfo[];
  created_at?: string;
  updated_at?: string;
};

export type DeviceSummary = {
  total: number;
  aiEdge: number;
  gateways: number;
  online: number;
};

export type DeviceListResponse = {
  summary: DeviceSummary;
  records: DeviceRecord[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
};

export type DeviceListParams = {
  page?: number;
  per_page?: number;
  query?: string;
  status?: 'online' | 'offline' | 'fault' | 'maintenance';
  device_type?: string;
  refresh_status?: string;
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
  type: '智能盒子';
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

export async function getDevices(params?: DeviceListParams) {
  return request<ApiResponse<DeviceListResponse>>('/api/v1/admin/devices', {
    method: 'GET',
    params,
  });
}

export async function getDeviceStatus(options?: Record<string, any>) {
  return request<ApiResponse<DeviceStatusResponse>>(
    '/api/v1/admin/devices/status',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

type DevicePayload = {
  name?: string;
  sn?: string;
  model?: string;
  device_type?: string;
  ip_address?: string;
  status?: 'online' | 'offline' | 'fault' | 'maintenance';
  metadata?: Record<string, any>;
  point_ids?: (string | number)[];
};

export async function createDevice(
  body: DevicePayload,
  options?: Record<string, any>,
) {
  return request<ApiResponse<DeviceRecord>>('/api/v1/admin/devices', {
    method: 'POST',
    data: { device: body },
    ...(options || {}),
  });
}

export async function updateDevice(
  id: string,
  body: DevicePayload,
  options?: Record<string, any>,
) {
  return request<ApiResponse<DeviceRecord>>(`/api/v1/admin/devices/${id}`, {
    method: 'PATCH',
    data: { device: body },
    ...(options || {}),
  });
}

export async function deleteDevice(id: string, options?: Record<string, any>) {
  return request<ApiResponse<Record<string, never>>>(
    `/api/v1/admin/devices/${id}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}
