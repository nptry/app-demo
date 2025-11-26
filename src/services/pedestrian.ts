import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type ChannelSummary = {
  total: number;
  enabled: number;
  widthMeters: number;
};

export type ChannelInfoItem = {
  id: string;
  name: string;
  region: string;
  address: string;
  coordinates: string;
  channelType: '商场入口' | '地铁站出口' | '步行街通道' | '政府入口';
  width: number;
  manager: string;
  phone: string;
  mapFile: string;
  status: '启用' | '禁用';
};

export type ChannelInfoResponse = {
  summary: ChannelSummary;
  channels: ChannelInfoItem[];
};

export async function getChannelInfo(options?: Record<string, any>) {
  return request<ApiResponse<ChannelInfoResponse>>('/api/pedestrian/channels', {
    method: 'GET',
    ...(options || {}),
  });
}

export type ChannelDeploymentItem = {
  id: string;
  channelId: string;
  channelName: string;
  deviceType: '高清数字摄像机' | 'AI 边缘计算设备';
  deviceId: string;
  deviceName: string;
  position: string;
  installHeight?: number;
  lensAngle?: string;
  installDate: string;
  owner: string;
  status: '正常运行' | '待调试' | '已拆除';
  testResult?: string;
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

export type KeyPersonRecord = {
  id: string;
  channelId: string;
  channelName: string;
  personId: string;
  personName: string;
  personType: string;
  captureTime: string;
  photos: string[];
  video: string;
  accuracy: number;
  behavior: string;
  withCompanion: boolean;
  companionCount?: number;
  alarmStatus: string;
  alarmChannels: string[];
  receiver: string;
  resultRemark?: string;
  deviceId: string;
};

export type KeyPersonResponse = {
  records: KeyPersonRecord[];
};

export async function getChannelWatch(options?: Record<string, any>) {
  return request<ApiResponse<KeyPersonResponse>>('/api/pedestrian/watch', {
    method: 'GET',
    ...(options || {}),
  });
}

export type TrajectoryPoint = {
  channelId: string;
  channelName: string;
  time: string;
  deviceId: string;
};

export type TrajectoryRecord = {
  id: string;
  personId: string;
  personName: string;
  range: string;
  duration: string;
  distanceKm: number;
  hotspots: string[];
  points: TrajectoryPoint[];
  operator: string;
  queryTime: string;
};

export type TrajectoryResponse = {
  trajectories: TrajectoryRecord[];
};

export async function getChannelTrajectories(options?: Record<string, any>) {
  return request<ApiResponse<TrajectoryResponse>>('/api/pedestrian/trajectories', {
    method: 'GET',
    ...(options || {}),
  });
}

export type CompanionMember = {
  id: string;
  gender: string;
  ageRange: string;
  appearance: string;
  position: string;
  photo: string;
};

export type CompanionRecord = {
  id: string;
  keyPersonId: string;
  keyPersonName: string;
  captureChannelId: string;
  captureChannelName: string;
  captureTime: string;
  companionCount: number;
  list: CompanionMember[];
  behavior: string;
  focus: boolean;
  reason?: string;
  linkResult?: string;
  remark?: string;
  deviceId: string;
  accuracy: number;
};

export type CompanionResponse = {
  records: CompanionRecord[];
};

export async function getStrangerRecords(options?: Record<string, any>) {
  return request<ApiResponse<CompanionResponse>>('/api/pedestrian/strangers', {
    method: 'GET',
    ...(options || {}),
  });
}

export type AccessRecord = {
  id: string;
  channelId: string;
  channelName: string;
  time: string;
  anonymousId: string;
  faceCode: string;
  gender: string;
  ageRange: string;
  direction: string;
  belongings: string;
  photo: string;
  abnormal: boolean;
  abnormalReason?: string;
  alarmStatus: string;
  remark?: string;
  deviceId: string;
  accuracy: number;
};

export type AccessResponse = {
  records: AccessRecord[];
};

export async function getAccessRecords(options?: Record<string, any>) {
  return request<ApiResponse<AccessResponse>>('/api/pedestrian/access', {
    method: 'GET',
    ...(options || {}),
  });
}
