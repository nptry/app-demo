// Enum definitions
export enum DeviceStatus {
  ONLINE = '在线',
  OFFLINE = '离线',
  FAULT = '故障',
  MAINTENANCE = '维护中',
}

export enum FacilityStatus {
  NORMAL = '正常',
  MAINTENANCE = '维护',
  STOPPED = '停用',
}

export enum AlertLevel {
  URGENT = '紧急',
  IMPORTANT = '重要',
  NORMAL = '一般',
}

export enum TicketStatus {
  PENDING = '待派单',
  PROCESSING = '处理中',
  RESOLVED = '已解决',
}

export enum TrafficWarnType {
  PLATE_REC = '车牌识别',
  RED_LIGHT = '红灯违法',
  WRONG_WAY = '逆行监控',
  ILLEGAL_PARKING = '违规停车',
}

export enum PersonnelType {
  FOCUS = '重点关注人员',
  BLACKLIST = '黑名单人员',
  RESTRICTED = '限制进入人员',
}

export enum PersonnelStatus {
  CONTROLLED = '在控',
  LOST = '失控',
  RELEASED = '已解除',
}

// Interfaces
export interface IDevice {
  id: string;
  name: string;
  type: string; // 重点区域监测、交通卡口监测、行人通道监测
  status: DeviceStatus;
  installDate: string;
  x: number; // For map simulation
  y: number;
}

export interface IFacility {
  id: string;
  name: string;
  type: string; // 重点区域、交通卡口、行人通道、智慧灯杆
  status: FacilityStatus;
  x: number;
  y: number;
}

export interface ICheckpoint {
  id: string;
  name: string;
  status: '启用' | '停用';
  lanes: number;
  type: string;
  x: number;
  y: number;
}

export interface ITicket {
  id: string;
  deviceId: string;
  deviceName: string;
  faultType: string;
  level: AlertLevel;
  status: TicketStatus;
  createTime: string;
}

export interface ITrafficAlert {
  id: string;
  type: TrafficWarnType;
  timestamp: string;
  checkpointId: string;
}

export interface ICrowdArea {
  id: string;
  name: string;
  type: string; // 公共场所、商业区域、活动区域、政府办公区
  status: '启用' | '禁用';
  areaSize: number;
  density: number;
  alertCount: number;
  x: number;
  y: number;
}

export interface IPersonnel {
  id: string;
  name: string;
  type: PersonnelType;
  status: PersonnelStatus;
  lastSeen: string;
  location: string;
}
