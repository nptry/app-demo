import type { Request, Response } from 'express';

const messageCenterData: API.NoticeIconItem[] = [
  {
    id: 'msg-001',
    title: '系统升级将在凌晨进行',
    description: '5月10日 02:00 - 04:00，平台将进入不可服务状态，请提前保存工作内容。',
    datetime: '2024-05-09 09:12',
    type: 'notification',
    read: false,
    extra: '重要',
  },
  {
    id: 'msg-002',
    title: '新设备已接入监控平台',
    description: '区域A的边缘设备已完成接入并开始同步状态。',
    datetime: '2024-05-08 17:44',
    type: 'notification',
    read: true,
  },
  {
    id: 'msg-003',
    title: '运维小组发送工作提醒',
    description: '请在今天内完成区域B的摄像头巡检。',
    datetime: '2024-05-09 08:03',
    avatar: 'https://avatars.githubusercontent.com/u/6412038?v=4',
    type: 'message',
  },
  {
    id: 'msg-004',
    title: '收到新的故障工单',
    description: '工单#1942，设备X在昨晚发生断连，需要确认原因。',
    datetime: '2024-05-08 22:14',
    avatar: 'https://avatars.githubusercontent.com/u/1234567?v=4',
    type: 'message',
    read: true,
  },
  {
    id: 'msg-005',
    title: '部署巡检任务待处理',
    description: '请将巡检报告上传至运维系统以便归档。',
    datetime: '2024-05-07 12:00',
    type: 'event',
    status: 'todo',
    extra: '未启动',
  },
  {
    id: 'msg-006',
    title: '紧急拉通窗口',
    description: '区域C的传输链路短时中断，请立即确认流量和链路状态。',
    datetime: '2024-05-09 03:21',
    type: 'event',
    status: 'urgent',
    extra: '需1小时内完成',
  },
  {
    id: 'msg-007',
    title: '在建项目任务进展',
    description: '项目组已完成基础设施布线，等待下一阶段审核。',
    datetime: '2024-05-04 15:40',
    type: 'event',
    status: 'doing',
    read: true,
  },
  {
    id: 'msg-008',
    title: '中心监控态势',
    description: '今日 08:10 至 09:00 所有卡口设备在线率稳定在 99.8%。',
    datetime: '2024-05-08 09:15',
    type: 'notification',
  },
  {
    id: 'msg-009',
    title: '客服回复：排查结果',
    description: '客户回复已确认数据同步问题为网络抖动，数据补录完成。',
    datetime: '2024-05-07 19:02',
    avatar: 'https://avatars.githubusercontent.com/u/37708671?v=4',
    type: 'message',
    read: true,
  },
  {
    id: 'msg-010',
    title: '版本发布待办',
    description: '请于 2024-05-11 前完成功能验收并填写发布记录。',
    datetime: '2024-05-05 10:20',
    type: 'event',
    status: 'processing',
    extra: '进行中',
  },
];

const getMessageCenter = (_req: Request, res: Response) => {
  res.json({
    data: messageCenterData,
  });
};

export default {
  'GET /api/message-center': getMessageCenter,
};
