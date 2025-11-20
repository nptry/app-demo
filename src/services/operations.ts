import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type FacilitySummary = {
  regions: number;
  checkpoints: number;
  pedestrianPoints: number;
  lampPoles: number;
};

export type FacilityItem = {
  id: string;
  type: '监测区域' | '交通卡口' | '行人通道点位' | '智慧灯杆';
  name: string;
  region: string;
  address: string;
  coordinates: string;
  owner: string;
  phone: string;
  status: '正常运行' | '待维护' | '停用';
  buildDate: string;
  remark?: string;
};

export type InfrastructureResponse = {
  summary: FacilitySummary;
  facilities: FacilityItem[];
};

export type ResourceSummary = {
  vehicles: number;
  engineers: number;
  spareParts: number;
};

export type ResourceItem = {
  id: string;
  resourceType: '运维车辆' | '运维人员' | '设备配件';
  name: string;
  status: string;
  department: string;
  contact: string;
  phone: string;
  detail: string;
  lastDispatch?: string;
};

export type ResourceResponse = {
  summary: ResourceSummary;
  resources: ResourceItem[];
};

export type FaultOrderItem = {
  id: string;
  deviceId: string;
  deviceName: string;
  reportedAt: string;
  faultType: string;
  description: string;
  level: '紧急（1 小时）' | '重要（4 小时）' | '一般（24 小时）';
  dispatchTime: string;
  owner: string;
  status: '待派单' | '待处理' | '处理中' | '已解决' | '无法解决（需升级）';
  solution?: string;
  finishTime?: string;
  result?: '完全解决' | '部分解决' | '未解决（需换硬件）';
  remark?: string;
};

export type FaultResponse = {
  stats: {
    todayFaults: number;
    inProgress: number;
    waiting: number;
  };
  orders: FaultOrderItem[];
};

export type FaultTypeDistribution = {
  type: string;
  value: number;
};

export type TopDeviceItem = {
  deviceName: string;
  count: number;
};

export type TopEngineerItem = {
  engineer: string;
  handled: number;
  rate: number;
};

export type OperationsStatisticsResponse = {
  period: string;
  totalFaults: number;
  resolved: number;
  resolveRate: number;
  avgHandleDuration: string;
  typeDistribution: FaultTypeDistribution[];
  topDevices: TopDeviceItem[];
  topEngineers: TopEngineerItem[];
  generatedAt: string;
};

export async function getInfrastructureOverview(options?: Record<string, any>) {
  return request<ApiResponse<InfrastructureResponse>>('/api/operations/infrastructure', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getResourceOverview(options?: Record<string, any>) {
  return request<ApiResponse<ResourceResponse>>('/api/operations/resources', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getFaultOverview(options?: Record<string, any>) {
  return request<ApiResponse<FaultResponse>>('/api/operations/faults', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getOperationsStatistics(options?: Record<string, any>) {
  return request<ApiResponse<OperationsStatisticsResponse>>('/api/operations/statistics', {
    method: 'GET',
    ...(options || {}),
  });
}
