import type { Request, Response } from 'express';

const channelInfo = {
  summary: {
    total: 22,
    enabled: 18,
    widthMeters: 64,
  },
  channels: [
    {
      id: 'CH-001',
      name: 'Oshodi 天桥北口',
      region: 'Oshodi-Isolo',
      address: '天桥北向入口与 BRT 站旁',
      coordinates: '6.555303, 3.343987',
      channelType: '步行街通道',
      width: 3.2,
      manager: 'Grace Nneka',
      phone: '08031157644',
      mapFile: 'Oshodi-Bridge.pdf',
      status: '启用',
    },
    {
      id: 'CH-005',
      name: 'CMS 地铁东出口',
      region: 'Lagos Island',
      address: 'CMS 地铁站东出口',
      coordinates: '6.454332, 3.394822',
      channelType: '地铁站出口',
      width: 4.5,
      manager: 'Sara Yusuf',
      phone: '08037782288',
      mapFile: 'CMS-Exit.dwg',
      status: '启用',
    },
    {
      id: 'CH-009',
      name: 'Lekki BRT 走廊',
      region: 'Lekki',
      address: 'Lekki-BRT 高架换乘区',
      coordinates: '6.429912, 3.534421',
      channelType: '商场入口',
      width: 5.0,
      manager: 'Idris Ajayi',
      phone: '08052337611',
      mapFile: 'Lekki-BRT.png',
      status: '禁用',
    },
  ],
};

const deploymentData = {
  devices: [
    {
      id: 'CHD-001',
      channelId: 'CH-001',
      channelName: 'Oshodi 天桥北口',
      deviceType: '高清数字摄像机',
      deviceId: 'CAM-OSH-01',
      deviceName: '天桥北摄像机',
      position: '入口上方 3.2m',
      installHeight: 3.2,
      lensAngle: '俯角 15°',
      installDate: '2024-03-10',
      owner: 'Grace Nneka',
      status: '正常运行',
      testResult: '捕获率 96%',
    },
    {
      id: 'CHD-002',
      channelId: 'CH-001',
      channelName: 'Oshodi 天桥北口',
      deviceType: 'AI 边缘计算设备',
      deviceId: 'AIE-OSH-01',
      deviceName: '天桥边缘节点',
      position: '灯杆箱体',
      installDate: '2024-03-10',
      owner: 'Grace Nneka',
      status: '正常运行',
      testResult: '行人密度模型 v2.1',
    },
    {
      id: 'CHD-005',
      channelId: 'CH-005',
      channelName: 'CMS 地铁东出口',
      deviceType: '4G 无线网关',
      deviceId: 'GW-CMS-02',
      deviceName: '地铁出口网关',
      position: '出口旁配电箱',
      installDate: '2024-02-05',
      owner: 'Sara Yusuf',
      status: '待调试',
      testResult: '待完成链路切换',
    },
  ],
};

const keyPersonData = {
  records: [
    {
      id: 'KP-001',
      channelId: 'CH-005',
      channelName: 'CMS 地铁东出口',
      personId: 'PER-KEY-001',
      personName: 'Grace Obi',
      personType: '重点关注人员',
      captureTime: '2024-05-09 09:58:31',
      photos: ['/images/ped/key-001-a.jpg', '/images/ped/key-001-b.jpg'],
      video: '/videos/ped/key-001.mp4',
      accuracy: 0.94,
      behavior: '区域内徘徊 6 分钟',
      withCompanion: true,
      companionCount: 2,
      alarmStatus: '处理中（派安保）',
      alarmChannels: ['短信', '系统通知'],
      receiver: 'Sara Yusuf',
      resultRemark: '安保已到场核查',
      deviceId: 'AIE-CMS-01',
    },
    {
      id: 'KP-003',
      channelId: 'CH-001',
      channelName: 'Oshodi 天桥北口',
      personId: 'PER-KEY-004',
      personName: 'Emeka Dada',
      personType: '黑名单人员',
      captureTime: '2024-05-09 08:12:10',
      photos: ['/images/ped/key-003.jpg'],
      video: '/videos/ped/key-003.mp4',
      accuracy: 0.91,
      behavior: '携带大件物品快速通过',
      withCompanion: false,
      alarmStatus: '已处理（劝离）',
      alarmChannels: ['系统通知'],
      receiver: 'Grace Nneka',
      resultRemark: '登记后劝离',
      deviceId: 'CAM-OSH-01',
    },
  ],
};

const trajectoryData = {
  trajectories: [
    {
      id: 'TR-001',
      personId: 'PER-KEY-001',
      personName: 'Grace Obi',
      range: '2024-05-09 09:20-10:20',
      duration: '00:60',
      distanceKm: 1.8,
      hotspots: ['CMS 地铁东出口', 'Balogun 北区'],
      points: [
        { channelId: 'CH-005', channelName: 'CMS 地铁东出口', time: '09:28', deviceId: 'AIE-CMS-01' },
        { channelId: 'CH-004', channelName: 'Balogun 北区入口', time: '10:05', deviceId: 'AIE-BAL-01' },
      ],
      operator: 'Sara Yusuf',
      queryTime: '2024-05-09 10:25:00',
    },
  ],
};

const companionData = {
  records: [
    {
      id: 'COMP-001',
      keyPersonId: 'PER-KEY-001',
      keyPersonName: 'Grace Obi',
      captureChannelId: 'CH-005',
      captureChannelName: 'CMS 地铁东出口',
      captureTime: '2024-05-09 09:58:31',
      companionCount: 2,
      list: [
        {
          id: 'COMP-001-01',
          gender: '男',
          ageRange: '25-30',
          appearance: '黑色夹克，背包',
          position: '左侧',
          photo: '/images/ped/comp-001-01.jpg',
        },
        {
          id: 'COMP-001-02',
          gender: '女',
          ageRange: '20-25',
          appearance: '白色上衣，手提袋',
          position: '右侧',
          photo: '/images/ped/comp-001-02.jpg',
        },
      ],
      behavior: '三人结伴交谈，停留 5 分钟',
      focus: true,
      reason: '同行人员频繁遮挡摄像机',
      linkResult: 'COMP-001-01 在 10:30 于 Balogun 再次出现',
      remark: '已通知现场跟进',
      deviceId: 'AIE-CMS-01',
      accuracy: 0.9,
    },
  ],
};

const accessData = {
  records: [
    {
      id: 'ACC-001',
      channelId: 'CH-001',
      channelName: 'Oshodi 天桥北口',
      time: '2024-05-09 10:42:12.201',
      anonymousId: 'ANON-20240509-0001',
      faceCode: 'FACE-1A3B',
      gender: '男',
      ageRange: '25-30',
      direction: '进',
      belongings: '小型背包',
      photo: '/images/ped/access-001.jpg',
      abnormal: false,
      alarmStatus: '记录',
      deviceId: 'CAM-OSH-01',
      accuracy: 0.95,
    },
    {
      id: 'ACC-002',
      channelId: 'CH-005',
      channelName: 'CMS 地铁东出口',
      time: '2024-05-09 10:43:55.012',
      anonymousId: 'ANON-20240509-0002',
      faceCode: 'FACE-7F2C',
      gender: '女',
      ageRange: '18-22',
      direction: '出',
      belongings: '大型行李箱',
      photo: '/images/ped/access-002.jpg',
      abnormal: true,
      abnormalReason: '携带大型物品逆向推行',
      alarmStatus: '处理中（通知安保）',
      remark: '安保 2 分钟后到场',
      deviceId: 'CAM-CMS-02',
      accuracy: 0.88,
    },
  ],
};

export default {
  'GET /api/pedestrian/channels': (req: Request, res: Response) => {
    res.json({ success: true, data: channelInfo });
  },
  'GET /api/pedestrian/deployments': (req: Request, res: Response) => {
    res.json({ success: true, data: deploymentData });
  },
  'GET /api/pedestrian/watch': (req: Request, res: Response) => {
    res.json({ success: true, data: keyPersonData });
  },
  'GET /api/pedestrian/trajectories': (req: Request, res: Response) => {
    res.json({ success: true, data: trajectoryData });
  },
  'GET /api/pedestrian/strangers': (req: Request, res: Response) => {
    res.json({ success: true, data: companionData });
  },
  'GET /api/pedestrian/access': (req: Request, res: Response) => {
    res.json({ success: true, data: accessData });
  },
};
