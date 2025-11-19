import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type CheckpointSummary = {
  total: number;
  monitored: number;
  aiNodes: number;
  warnings24h: number;
};

export type CheckpointInfoItem = {
  id: string;
  name: string;
  district: string;
  location: string;
  coordinates: string;
  coverageRoads: string;
  types: string[];
  manager: string;
  contact: string;
  status: '正常' | '关注' | '中断';
  description: string;
};

export type CheckpointTaskItem = {
  id: string;
  title: string;
  detail: string;
  window: string;
  owner: string;
};

export type TrafficCheckpointResponse = {
  summary: CheckpointSummary;
  checkpoints: CheckpointInfoItem[];
  tasks: CheckpointTaskItem[];
};

export async function getTrafficCheckpoints(options?: Record<string, any>) {
  return request<ApiResponse<TrafficCheckpointResponse>>('/api/traffic/checkpoints', {
    method: 'GET',
    ...(options || {}),
  });
}

export type TrafficDeploymentSummary = {
  type: string;
  cameras: number;
  aiNodes: number;
  gateways: number;
};

export type TrafficDeploymentItem = {
  id: string;
  checkpoint: string;
  deviceName: string;
  deviceType: string;
  poleCode: string;
  installation: string;
  network: string;
  status: '在线' | '维护' | '离线';
  aiModels: string[];
};

export type TrafficMaintenanceItem = {
  id: string;
  checkpoint: string;
  action: string;
  schedule: string;
  owner: string;
  status: '待执行' | '执行中' | '完成';
};

export type TrafficDeploymentResponse = {
  summary: TrafficDeploymentSummary[];
  deployments: TrafficDeploymentItem[];
  maintenance: TrafficMaintenanceItem[];
};

export async function getTrafficDeployments(options?: Record<string, any>) {
  return request<ApiResponse<TrafficDeploymentResponse>>('/api/traffic/deployments', {
    method: 'GET',
    ...(options || {}),
  });
}

export type LicenseMetrics = {
  totalToday: number;
  validPlates: number;
  blacklistHits: number;
  lastSync: string;
};

export type LicenseRecordItem = {
  id: string;
  checkpoint: string;
  plate: string;
  vehicleType: string;
  color: string;
  captureTime: string;
  direction: string;
  status: '正常' | '黑名单' | '异常';
  snapshot: string;
};

export type LicenseRecordResponse = {
  metrics: LicenseMetrics;
  records: LicenseRecordItem[];
};

export async function getLicenseRecords(options?: Record<string, any>) {
  return request<ApiResponse<LicenseRecordResponse>>('/api/traffic/license-records', {
    method: 'GET',
    ...(options || {}),
  });
}

export type TrafficFlowMetrics = {
  totalVehicles: number;
  avgSpeed: number;
  incidents: number;
  peakHour: string;
};

export type TrafficTrendItem = {
  time: string;
  inbound: number;
  outbound: number;
};

export type TrafficIncidentItem = {
  id: string;
  checkpoint: string;
  type: string;
  description: string;
  status: '已恢复' | '处理中';
  time: string;
};

export type TrafficMonitoringResponse = {
  metrics: TrafficFlowMetrics;
  trend: TrafficTrendItem[];
  incidents: TrafficIncidentItem[];
};

export async function getTrafficMonitoring(options?: Record<string, any>) {
  return request<ApiResponse<TrafficMonitoringResponse>>('/api/traffic/monitoring', {
    method: 'GET',
    ...(options || {}),
  });
}

export type ViolationMetrics = {
  today: number;
  handled: number;
  pending: number;
  avgHandleMins: number;
};

export type ViolationRecordItem = {
  id: string;
  checkpoint: string;
  plate: string;
  violationTime: string;
  evidence: string;
  level: '一般' | '严重';
  handler: string;
  status: '待处置' | '处理中' | '已完成';
  description: string;
};

export type ViolationResponse = {
  metrics: ViolationMetrics;
  records: ViolationRecordItem[];
};

export async function getRedLightViolations(options?: Record<string, any>) {
  return request<ApiResponse<ViolationResponse>>('/api/traffic/red-light', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getRetrogradeViolations(options?: Record<string, any>) {
  return request<ApiResponse<ViolationResponse>>('/api/traffic/retrograde', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getParkingViolations(options?: Record<string, any>) {
  return request<ApiResponse<ViolationResponse>>('/api/traffic/parking', {
    method: 'GET',
    ...(options || {}),
  });
}
