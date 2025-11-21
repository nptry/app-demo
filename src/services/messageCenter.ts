import { request } from '@umijs/max';

export type MessageCenterItem = API.NoticeIconItem;
export type MessageCenterResponse = API.NoticeIconList;

export async function getMessageCenterList(options?: { [key: string]: any }) {
  return request<MessageCenterResponse>('/api/message-center', {
    method: 'GET',
    ...(options || {}),
  });
}
