import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type CheckpointInfoItem = {
  id: string;
  name: string;
  checkpointTypes: string[];
  region: string;
  address: string;
  coordinates: string;
  laneCount: number;
  laneDescription: string;
  speedLimit: number;
  manager: string;
  phone: string;
  mapFile: string;
  status: '启用' | '禁用';
};

export type TrafficCheckpointResponse = {
  summary: {
    total: number;
    enabled: number;
    laneCount: number;
  };
  checkpoints: CheckpointInfoItem[];
};

export async function getTrafficCheckpoints(options?: Record<string, any>) {
  return request<ApiResponse<TrafficCheckpointResponse>>('/api/traffic/checkpoints', {
    method: 'GET',
    ...(options || {}),
  });
}

export type TrafficDeploymentItem = {
  id: string;
  checkpointId: string;
  checkpointName: string;
  deviceType: '高清数字摄像机' | 'AI 边缘计算设备';
  deviceId: string;
  deviceName: string;
  lane: string;
  position: string;
  lensFocal?: string;
  installDate: string;
  owner: string;
  status: '正常运行' | '待调试' | '已拆除';
  result?: string;
};

export type TrafficDeploymentResponse = {
  deployments: TrafficDeploymentItem[];
};

export async function getTrafficDeployments(options?: Record<string, any>) {
  return request<ApiResponse<TrafficDeploymentResponse>>('/api/traffic/deployments', {
    method: 'GET',
    ...(options || {}),
  });
}

export type LicenseRecordItem = {
  id: string;
  checkpointName: string;
  lane: string;
  captureTime: string;
  plateNumber: string;
  plateColor: string;
  vehicleColor: string;
  vehicleType: string;
  speed: number;
  photos: string[];
  accuracy: number;
  abnormal: boolean;
  reason?: string;
  deviceId: string;
};

export type LicenseRecordResponse = {
  records: LicenseRecordItem[];
};

export async function getLicenseRecords(options?: Record<string, any>) {
  return request<ApiResponse<LicenseRecordResponse>>('/api/traffic/license-records', {
    method: 'GET',
    ...(options || {}),
  });
}

export type TrafficMonitoringRecord = {
  id: string;
  checkpointName: string;
  lane: string;
  period: string;
  range: string;
  totalVehicles: number;
  threshold: number;
  congestion: boolean;
  duration?: string;
  suggestion?: string;
  avgSpeed: number;
  maxSpeed: number;
  deviceId: string;
  accuracy: number;
};

export type TrafficMonitoringResponse = {
  records: TrafficMonitoringRecord[];
};

export async function getTrafficMonitoring(options?: Record<string, any>) {
  return request<ApiResponse<TrafficMonitoringResponse>>('/api/traffic/monitoring', {
    method: 'GET',
    ...(options || {}),
  });
}

export type RedLightRecord = {
  id: string;
  checkpointName: string;
  lane: string;
  violationTime: string;
  lightOnTime: string;
  plateNumber: string;
  vehicleType: string;
  photos: string[];
  video: string;
  position: string;
  speed: number;
  alarm: {
    triggered: boolean;
    receiver?: string;
    status?: '未处理' | '处理中（录入执法系统）' | '已处理（生成罚单）' | '误报';
    remark?: string;
  };
  deviceId: string;
  accuracy: number;
};

export type RetrogradeRecord = {
  id: string;
  checkpointName: string;
  lane: string;
  directionRule: string;
  violationTime: string;
  plateNumber: string;
  vehicleType: string;
  photos: string[];
  video: string;
  distance: number;
  speed: number;
  alarmStatus: string;
  remark?: string;
  deviceId: string;
  accuracy: number;
};

export type ParkingViolationRecord = {
  id: string;
  checkpointName: string;
  area: string;
  rule: string;
  startTime: string;
  duration: string;
  threshold: number;
  plateNumber: string;
  vehicleType: string;
  photos: string[];
  video: string;
  specialVehicle: boolean;
  specialReason?: string;
  alarmStatus: string;
  remark?: string;
  deviceId: string;
  accuracy: number;
};

export async function getRedLightViolations(options?: Record<string, any>) {
  return request<ApiResponse<RedLightRecord[]>>('/api/traffic/red-light', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getRetrogradeViolations(options?: Record<string, any>) {
  return request<ApiResponse<RetrogradeRecord[]>>('/api/traffic/retrograde', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getParkingViolations(options?: Record<string, any>) {
  return request<ApiResponse<ParkingViolationRecord[]>>('/api/traffic/parking', {
    method: 'GET',
    ...(options || {}),
  });
}
