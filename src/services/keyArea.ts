
import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type KeyAreaSiteSummary = {
  totalSites: number;
  enabledSites: number;
  totalAreaSqm: number;
};

export type KeyAreaSiteItem = {
  id: string;
  name: string;
  siteType: '公共场所' | '活动区域' | '政府办公区' | '商业区域';
  region: string;
  address: string;
  coordinates: string;
  areaSize: number;
  manager: string;
  phone: string;
  plan: string;
  description?: string;
  status: '启用' | '禁用';
};

export type KeyAreaSiteResponse = {
  summary: KeyAreaSiteSummary;
  sites: KeyAreaSiteItem[];
};

export async function getKeyAreaSites(options?: Record<string, any>) {
  return request<ApiResponse<KeyAreaSiteResponse>>('/api/key-area/sites', {
    method: 'GET',
    ...(options || {}),
  });
}

export type DeploymentItem = {
  id: string;
  siteId: string;
  siteName: string;
  zoneCode: string;
  zoneArea: number;
  deviceType: '高清数字摄像机' | 'AI 边缘计算设备' | '4G 无线网关';
  deviceId: string;
  deviceName: string;
  position: string;
  installHeight?: number;
  installDate: string;
  owner: string;
  status: '正常运行' | '待调试' | '已拆除';
};

export type KeyAreaDeploymentResponse = {
  deployments: DeploymentItem[];
};

export async function getKeyAreaDeployments(options?: Record<string, any>) {
  return request<ApiResponse<KeyAreaDeploymentResponse>>('/api/key-area/deployments', {
    method: 'GET',
    ...(options || {}),
  });
}

export type DensityTrendPoint = {
  time: string;
  density: number;
};

export type DensityRecord = {
  id: string;
  siteId: string;
  siteName: string;
  zoneCode: string;
  zoneArea: number;
  time: string;
  density: number;
  totalPeople: number;
  threshold: number;
  trend: DensityTrendPoint[];
  alarm: {
    triggered: boolean;
    triggeredAt?: string;
    receiver?: string;
    status?: '未处理' | '处理中' | '已处理';
    remark?: string;
  };
  sourceDeviceId: string;
  confidence: number;
};

export type KeyAreaDensityResponse = {
  metrics: {
    alertCount: number;
    highDensityZones: number;
    lastSync: string;
  };
  records: DensityRecord[];
};

export async function getKeyAreaDensity(options?: Record<string, any>) {
  return request<ApiResponse<KeyAreaDensityResponse>>('/api/key-area/density', {
    method: 'GET',
    ...(options || {}),
  });
}

export type FlowRecord = {
  id: string;
  siteId: string;
  siteName: string;
  zoneCode: string;
  direction: string;
  time: string;
  forwardFlow: number;
  reverseFlow?: number;
  totalFlow: number;
  threshold: number;
  abnormal: boolean;
  duration?: string;
  suggestion?: string;
  deviceId: string;
  accuracy: number;
};

export type KeyAreaFlowResponse = {
  metrics: {
    totalFlows: number;
    abnormalEvents: number;
    lastSync: string;
  };
  records: FlowRecord[];
};

export async function getKeyAreaFlow(options?: Record<string, any>) {
  return request<ApiResponse<KeyAreaFlowResponse>>('/api/key-area/flow', {
    method: 'GET',
    ...(options || {}),
  });
}

export type TargetRecord = {
  id: string;
  siteId: string;
  siteName: string;
  zoneCode: string;
  watchlistId: string;
  time: string;
  personId: string;
  personName: string;
  personType: string;
  behavior: string;
  alarm: {
    triggered: boolean;
    channels?: string[];
    receiver?: string;
    status?: '未处理' | '处理中' | '已处理' | '误报';
    remark?: string;
  };
  deviceId: string;
  accuracy: number;
};

export type KeyAreaTargetResponse = {
  metrics: {
    watchlistCount: number;
    hitsToday: number;
    activeAlarms: number;
    lastPush: string;
  };
  records: TargetRecord[];
};

export async function getKeyAreaTargets(options?: Record<string, any>) {
  return request<ApiResponse<KeyAreaTargetResponse>>('/api/key-area/targets', {
    method: 'GET',
    ...(options || {}),
  });
}
