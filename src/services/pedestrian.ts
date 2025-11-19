import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type ChannelSummary = {
  totalChannels: number;
  coveredDistricts: number;
  aiNodes: number;
  warningsToday: number;
};

export type ChannelInfoItem = {
  id: string;
  name: string;
  district: string;
  location: string;
  coordinates: string;
  type: string;
  manager: string;
  contact: string;
  status: '正常' | '关注' | '维护';
  description: string;
};

export type ChannelMeasureItem = {
  id: string;
  title: string;
  owner: string;
  window: string;
  detail: string;
};

export type ChannelInfoResponse = {
  summary: ChannelSummary;
  channels: ChannelInfoItem[];
  measures: ChannelMeasureItem[];
};

export async function getChannelInfo(options?: Record<string, any>) {
  return request<ApiResponse<ChannelInfoResponse>>('/api/pedestrian/channels', {
    method: 'GET',
    ...(options || {}),
  });
}

export type ChannelDeploymentItem = {
  id: string;
  channelName: string;
  deviceName: string;
  deviceType: string;
  installation: string;
  poleCode: string;
  aiModels: string[];
  network: string;
  status: '在线' | '维护' | '离线';
};

export type ChannelDeploymentResponse = {
  devices: ChannelDeploymentItem[];
};

export async function getChannelDeployments(options?: Record<string, any>) {
  return request<ApiResponse<ChannelDeploymentResponse>>('/api/pedestrian/deployments', {
    method: 'GET',
    ...(options || {}),
  });
}

export type ChannelWatchMetrics = {
  watchlist: number;
  hitsToday: number;
  onlineTasks: number;
  lastPush: string;
};

export type ChannelFocusItem = {
  id: string;
  personName: string;
  gender: '男' | '女';
  age: number;
  tags: string[];
  channelName: string;
  lastSeen: string;
  status: '待核查' | '跟踪中' | '已处理';
};

export type ChannelWatchEvent = {
  id: string;
  personName: string;
  eventType: string;
  time: string;
  action: string;
  operator: string;
};

export type ChannelWatchResponse = {
  metrics: ChannelWatchMetrics;
  persons: ChannelFocusItem[];
  events: ChannelWatchEvent[];
};

export async function getChannelWatch(options?: Record<string, any>) {
  return request<ApiResponse<ChannelWatchResponse>>('/api/pedestrian/watch', {
    method: 'GET',
    ...(options || {}),
  });
}

export type TrajectoryItem = {
  id: string;
  personName: string;
  path: string;
  duration: string;
  lastSeen: string;
  confidence: number;
};

export type TrajectoryResponse = {
  trajectories: TrajectoryItem[];
};

export async function getChannelTrajectories(options?: Record<string, any>) {
  return request<ApiResponse<TrajectoryResponse>>('/api/pedestrian/trajectories', {
    method: 'GET',
    ...(options || {}),
  });
}

export type StrangerMetric = {
  today: number;
  highRisk: number;
  followUp: number;
};

export type StrangerRecord = {
  id: string;
  channelName: string;
  captureTime: string;
  description: string;
  evidence: string;
  status: '已通知' | '已确认' | '待处理';
};

export type StrangerResponse = {
  metrics: StrangerMetric;
  records: StrangerRecord[];
};

export async function getStrangerRecords(options?: Record<string, any>) {
  return request<ApiResponse<StrangerResponse>>('/api/pedestrian/strangers', {
    method: 'GET',
    ...(options || {}),
  });
}

export type AccessRecord = {
  id: string;
  channelName: string;
  personName: string;
  credential: string;
  direction: string;
  time: string;
};

export type AccessResponse = {
  total: number;
  records: AccessRecord[];
};

export async function getAccessRecords(options?: Record<string, any>) {
  return request<ApiResponse<AccessResponse>>('/api/pedestrian/access', {
    method: 'GET',
    ...(options || {}),
  });
}
