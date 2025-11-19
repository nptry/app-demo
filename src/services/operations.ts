import { request } from '@umijs/max';

export type InfrastructureSummary = {
  regions: number;
  checkpoints: number;
  pedestrianZones: number;
  lampPoles: number;
  aiNodes: number;
  gateways: number;
};

export type InfrastructureFacilityItem = {
  lampPoles: number;
  cameras: number;
  aiNodes: number;
  gateways: number;
};

export type InfrastructureItem = {
  id: string;
  area: string;
  type: '重点区域' | '交通卡口' | '行人通道';
  location: string;
  facilities: InfrastructureFacilityItem;
  networkStatus: '正常' | '关注' | '中断';
  lastInspection: string;
  responsible: string;
};

export type NetworkLinkItem = {
  id: string;
  name: string;
  status: '正常' | '预警' | '中断';
  latency: string;
  availability: string;
};

export type InfrastructureResponse = {
  summary: InfrastructureSummary;
  infrastructures: InfrastructureItem[];
  networkLinks: NetworkLinkItem[];
};

export type ResourceSummary = {
  teams: number;
  engineers: number;
  vehicles: number;
  spareParts: number;
};

export type EngineerItem = {
  id: string;
  name: string;
  team: string;
  specialty: string;
  shift: string;
  phone: string;
  status: '执行任务' | '待命' | '休整';
};

export type ResourceAssetItem = {
  id: string;
  type: '车辆' | '备件' | '工器具';
  name: string;
  quantity: number;
  location: string;
  availability: string;
};

export type DispatchPlanItem = {
  id: string;
  target: string;
  window: string;
  scope: string;
  leader: string;
  status: '待命' | '执行中' | '已完成';
};

export type ResourceResponse = {
  summary: ResourceSummary;
  engineers: EngineerItem[];
  assets: ResourceAssetItem[];
  dispatchPlans: DispatchPlanItem[];
};

export type FaultOverview = {
  todayAlarms: number;
  openOrders: number;
  avgResponseMins: number;
  avgRecoveryHours: number;
};

export type FaultOrderItem = {
  id: string;
  title: string;
  device: string;
  location: string;
  faultType: string;
  level: '低' | '中' | '高';
  reportedAt: string;
  channel: '远程' | '现场';
  status: '待处理' | '处理中' | '已恢复';
  assignedTo: string;
};

export type RemoteActionItem = {
  id: string;
  device: string;
  action: string;
  detail: string;
  time: string;
  result: string;
};

export type FaultDistributionItem = {
  category: string;
  count: number;
  proportion: number;
};

export type FaultResponse = {
  overview: FaultOverview;
  orders: FaultOrderItem[];
  remoteActions: RemoteActionItem[];
  distribution: FaultDistributionItem[];
};

export type OperationsKpi = {
  availability: number;
  faultRate: number;
  mttr: number;
  responseWithin15: number;
};

export type StatisticsTrendItem = {
  month: string;
  incidents: number;
  avgResponse: number;
  remoteRate: number;
};

export type ResourceUsageItem = {
  resource: string;
  utilization: number;
  workload: string;
};

export type NetworkHealthItem = {
  node: string;
  latency: string;
  packetLoss: string;
  status: '正常' | '关注' | '中断';
};

export type OperationsStatisticsResponse = {
  kpis: OperationsKpi;
  trend: StatisticsTrendItem[];
  resourceUsage: ResourceUsageItem[];
  networkHealth: NetworkHealthItem[];
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
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
