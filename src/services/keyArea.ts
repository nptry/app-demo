import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type KeyAreaSummary = {
  totalSites: number;
  coverageSqKm: number;
  avgDailyVisitors: number;
  alerts24h: number;
};

export type KeyAreaSiteItem = {
  id: string;
  name: string;
  type: '商业区' | '交通枢纽' | '活动区域' | '居民社区';
  district: string;
  address: string;
  areaSize: string;
  manager: string;
  contact: string;
  status: '正常' | '关注' | '管控';
  riskLevel: '低' | '中' | '高';
  description: string;
};

export type KeyAreaMeasure = {
  id: string;
  title: string;
  detail: string;
  owner: string;
  lastUpdate: string;
};

export type KeyAreaSiteResponse = {
  summary: KeyAreaSummary;
  sites: KeyAreaSiteItem[];
  measures: KeyAreaMeasure[];
};

export async function getKeyAreaSites(options?: Record<string, any>) {
  return request<ApiResponse<KeyAreaSiteResponse>>('/api/key-area/sites', {
    method: 'GET',
    ...(options || {}),
  });
}

export type DeploymentSummaryItem = {
  type: string;
  cameras: number;
  aiNodes: number;
  gateways: number;
  coverage: string;
};

export type DeploymentDeviceItem = {
  id: string;
  areaName: string;
  deviceName: string;
  deviceType: string;
  poleCode: string;
  location: string;
  coordinates: string;
  aiModels: string[];
  status: '在线' | '维护' | '离线';
};

export type MaintenancePlanItem = {
  id: string;
  areaName: string;
  action: string;
  window: string;
  owner: string;
  status: '待执行' | '执行中' | '完成';
};

export type KeyAreaDeploymentResponse = {
  summary: DeploymentSummaryItem[];
  deployments: DeploymentDeviceItem[];
  maintenancePlans: MaintenancePlanItem[];
};

export async function getKeyAreaDeployments(options?: Record<string, any>) {
  return request<ApiResponse<KeyAreaDeploymentResponse>>('/api/key-area/deployments', {
    method: 'GET',
    ...(options || {}),
  });
}

export type DensityMetrics = {
  realtimeIndex: number;
  highRiskZones: number;
  warningsToday: number;
  lastSync: string;
};

export type DensityAreaItem = {
  id: string;
  areaName: string;
  zone: string;
  realtimeDensity: number;
  threshold: number;
  status: '正常' | '预警' | '超限';
  change: string;
};

export type DensityTrendItem = {
  time: string;
  avgDensity: number;
  highDensityZones: number;
};

export type DensityAlertItem = {
  id: string;
  areaName: string;
  reason: string;
  triggeredAt: string;
  handler: string;
  status: '处理中' | '已处理';
};

export type KeyAreaDensityResponse = {
  metrics: DensityMetrics;
  areas: DensityAreaItem[];
  trend: DensityTrendItem[];
  alerts: DensityAlertItem[];
};

export async function getKeyAreaDensity(options?: Record<string, any>) {
  return request<ApiResponse<KeyAreaDensityResponse>>('/api/key-area/density', {
    method: 'GET',
    ...(options || {}),
  });
}

export type FlowMetrics = {
  totalToday: number;
  peakHour: string;
  abnormalEvents: number;
  avgSpeed: number;
};

export type FlowDirectionItem = {
  id: string;
  areaName: string;
  mainDirection: string;
  eastToWest: number;
  westToEast: number;
  congestionLevel: '畅通' | '轻度拥挤' | '拥挤';
};

export type FlowTrendItem = {
  time: string;
  inbound: number;
  outbound: number;
};

export type FlowEventItem = {
  id: string;
  areaName: string;
  type: string;
  detail: string;
  time: string;
  status: '已恢复' | '处理中';
};

export type KeyAreaFlowResponse = {
  metrics: FlowMetrics;
  directions: FlowDirectionItem[];
  trend: FlowTrendItem[];
  events: FlowEventItem[];
};

export async function getKeyAreaFlow(options?: Record<string, any>) {
  return request<ApiResponse<KeyAreaFlowResponse>>('/api/key-area/flow', {
    method: 'GET',
    ...(options || {}),
  });
}

export type TargetMetrics = {
  watchlist: number;
  hitsToday: number;
  activeTracking: number;
  lastPush: string;
};

export type FocusPersonItem = {
  id: string;
  name: string;
  gender: '男' | '女';
  age: number;
  tags: string[];
  lastSeen: string;
  status: '跟踪中' | '已核查' | '待核查';
  areaName: string;
  riskLevel: '低' | '中' | '高';
};

export type TargetEventItem = {
  id: string;
  personName: string;
  eventType: string;
  areaName: string;
  matchedAt: string;
  action: string;
  handler: string;
};

export type PatrolRecordItem = {
  id: string;
  areaName: string;
  task: string;
  result: string;
  time: string;
  operator: string;
};

export type KeyAreaTargetResponse = {
  metrics: TargetMetrics;
  focusPersons: FocusPersonItem[];
  events: TargetEventItem[];
  patrols: PatrolRecordItem[];
};

export async function getKeyAreaTargets(options?: Record<string, any>) {
  return request<ApiResponse<KeyAreaTargetResponse>>('/api/key-area/targets', {
    method: 'GET',
    ...(options || {}),
  });
}
