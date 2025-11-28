import {
  AlertLevel,
  DeviceStatus,
  FacilityStatus,
  PersonnelStatus,
  PersonnelType,
  TicketStatus,
} from './types';

// 1. Devices & Facilities
export const generateDevices = (count: number) => {
  const types = ['重点区域监测', '交通卡口监测', '行人通道监测'];
  return Array.from({ length: count }).map((_, i) => ({
    id: `DEV-${1000 + i}`,
    name: `感知设备-${i}`,
    type: types[i % types.length],
    status:
      i % 10 === 0
        ? DeviceStatus.FAULT
        : i % 5 === 0
          ? DeviceStatus.OFFLINE
          : DeviceStatus.ONLINE,
    installDate: `2023-${(i % 12) + 1}-15`,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));
};

export const generateFacilities = (count: number) => {
  const types = ['重点区域', '交通卡口', '行人通道', '智慧灯杆'];
  return Array.from({ length: count }).map((_, i) => ({
    id: `FAC-${1000 + i}`,
    name: `设施点位-${i}`,
    type: types[i % types.length],
    status:
      i % 20 === 0
        ? FacilityStatus.MAINTENANCE
        : i % 30 === 0
          ? FacilityStatus.STOPPED
          : FacilityStatus.NORMAL,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));
};

// 2. Faults / Tickets
export const generateTickets = (count: number) => {
  const faults = ['网络中断', '硬件损坏', 'CPU过载', '软件异常'];
  return Array.from({ length: count }).map((_, i) => ({
    id: `WO-${2000 + i}`,
    deviceId: `DEV-${1000 + (i % 50)}`,
    deviceName: `感知设备-${i % 50}`,
    faultType: faults[Math.floor(Math.random() * faults.length)],
    level:
      Object.values(AlertLevel)[
        Math.floor(Math.random() * Object.values(AlertLevel).length)
      ],
    status:
      Object.values(TicketStatus)[
        Math.floor(Math.random() * Object.values(TicketStatus).length)
      ],
    createTime: `2024-05-20 ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
  }));
};

// 3. Traffic
export const generateTrafficStats = () => [
  { name: '00:00', redLight: 2, wrongWay: 0, illegalPark: 5, total: 120 },
  { name: '04:00', redLight: 1, wrongWay: 1, illegalPark: 2, total: 80 },
  { name: '08:00', redLight: 15, wrongWay: 3, illegalPark: 20, total: 1200 },
  { name: '12:00', redLight: 8, wrongWay: 2, illegalPark: 35, total: 950 },
  { name: '16:00', redLight: 12, wrongWay: 5, illegalPark: 40, total: 1100 },
  { name: '20:00', redLight: 25, wrongWay: 8, illegalPark: 15, total: 800 },
];

export const checkpointTypes = [
  { name: '流量监测', value: 45 },
  { name: '违规抓拍', value: 30 },
  { name: '综合安防', value: 25 },
];

export const generateCheckpoints = (count: number) => {
  const types = ['流量监测', '综合安防', '违规抓拍'];
  return Array.from({ length: count }).map((_, i) => ({
    id: `CP-${i}`,
    name: `交通卡口-${i}`,
    status: i % 15 === 0 ? '停用' : '启用',
    lanes: Math.floor(Math.random() * 4) + 2,
    type: types[i % 3],
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));
};

// 4. Crowd / Areas
export const generateCrowdAreas = (count: number) => {
  const types = ['公共场所', '商业区域', '活动区域', '政府办公区'];
  return Array.from({ length: count }).map((_, i) => ({
    id: `AREA-${i}`,
    name: `重点区域-${i}`,
    type: types[i % types.length],
    status: i % 10 === 0 ? '禁用' : '启用',
    areaSize: 500 + Math.floor(Math.random() * 2000),
    density: Math.floor(Math.random() * 100), // People per 100sqm
    alertCount: Math.floor(Math.random() * 5),
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));
};

// Human Traffic Trend (New)
export const generateHumanTrafficStats = () => [
  { name: '00:00', count: 500 },
  { name: '04:00', count: 120 },
  { name: '08:00', count: 3500 },
  { name: '12:00', count: 5200 },
  { name: '16:00', count: 4800 },
  { name: '20:00', count: 6100 },
];

// NEW: Crowd Density Alert Trend
export const generateCrowdAlertTrend = () => [
  { name: '00:00', value: 2 },
  { name: '04:00', value: 0 },
  { name: '08:00', value: 12 },
  { name: '12:00', value: 25 },
  { name: '16:00', value: 18 },
  { name: '20:00', value: 30 },
];

// NEW: Intrusion Alert Trend (Line Chart Data - Legacy/Optional)
export const generateIntrusionTrend = () => [
  { name: '00:00', value: 5 },
  { name: '04:00', value: 8 },
  { name: '08:00', value: 3 },
  { name: '12:00', value: 2 },
  { name: '16:00', value: 4 },
  { name: '20:00', value: 12 },
];

// NEW: Intrusion Data for Polar Bar Chart (Radial Bar)
export const intrusionByArea = [
  { name: '围墙周界', value: 45, fill: '#4ade80' }, // Emerald
  { name: '地下管廊', value: 32, fill: '#2dd4bf' }, // Teal
  { name: '配电房', value: 28, fill: '#fbbf24' }, // Amber
  { name: '核心机房', value: 15, fill: '#f87171' }, // Red
  { name: '楼顶天台', value: 10, fill: '#a78bfa' }, // Purple
];

// 5. Personnel
export const generatePersonnel = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `P-${i}`,
    name: `人员-${i}`,
    type: Object.values(PersonnelType)[i % 3],
    status: Object.values(PersonnelStatus)[i % 3],
    lastSeen: `2024-05-20 ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    location: `区域-${Math.floor(Math.random() * 20)}`,
  }));
};

// 6. User Stats (Static for demo)
export const userStats = {
  permissions: {
    total: 150,
    usage: 80,
    management: 70,
    active: 140,
    disabled: 10,
  },
  roles: { total: 12, active: 10, disabled: 2, deptCoverage: 8 },
  accounts: { total: 45, active: 42, disabled: 3 },
  logs: { total: 15420, trend: [120, 150, 180, 140, 200, 210, 190] },
};

export const deviceData = generateDevices(120);
export const facilityData = generateFacilities(80);
export const checkpointData = generateCheckpoints(48);
export const ticketData = generateTickets(60);
export const trafficTrend = generateTrafficStats();
export const humanTrafficTrend = generateHumanTrafficStats();
export const crowdAreas = generateCrowdAreas(20);
export const personnelData = generatePersonnel(50);
export const crowdAlertTrend = generateCrowdAlertTrend();
export const intrusionTrend = generateIntrusionTrend();
