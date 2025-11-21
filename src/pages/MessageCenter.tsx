import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Avatar, Card, List, Space, Tag, Typography } from 'antd';
import React, { useMemo } from 'react';

import { getMessageCenterList } from '@/services/messageCenter';

const statusLabelMap: Record<string, string> = {
  todo: '待开始',
  doing: '进行中',
  urgent: '紧急',
  processing: '处理中',
};

const statusColorMap: Record<string, string> = {
  todo: 'default',
  doing: 'processing',
  urgent: 'volcano',
  processing: 'blue',
};

const listCardStyle = {
  marginTop: 24,
  borderRadius: 16,
  background: '#ffffff',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)',
  overflow: 'hidden' as const,
};

const buildAvatar = (item: API.NoticeIconItem) => {
  if (item.avatar) {
    return <Avatar src={item.avatar} />;
  }
  const label = item.title?.trim().slice(0, 1);
  return <Avatar>{label || '?'}</Avatar>;
};

const renderActionTags = (item: API.NoticeIconItem) => {
  const tags: React.ReactNode[] = [];
  if (!item.read) {
    tags.push(
      <Tag key="unread" color="processing">
        未读
      </Tag>,
    );
  }
  if (item.status) {
    tags.push(
      <Tag key="status" color={statusColorMap[item.status] ?? 'default'}>
        {statusLabelMap[item.status] ?? item.status}
      </Tag>,
    );
  } else if (item.extra) {
    tags.push(
      <Tag key="extra" color="default">
        {item.extra}
      </Tag>,
    );
  }
  if (tags.length) {
    return <Space size="small">{tags}</Space>;
  }
  return null;
};

const MessageCenter: React.FC = () => {
  const { data = [], loading } = useRequest<API.NoticeIconItem[]>(
    getMessageCenterList,
    {
      formatResult: (res) => res?.data ?? [],
    },
  );

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (!a.datetime || !b.datetime) {
        return 0;
      }
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    });
  }, [data]);

  return (
    <PageContainer title="消息中心">
      <Card bordered={false} bodyStyle={{ padding: 0 }} style={listCardStyle}>
        <List
          loading={loading}
          dataSource={sortedData}
          locale={{ emptyText: '当前暂无消息' }}
          renderItem={(item, index) => {
            const fallbackKey = item.id ?? item.key ?? `message-${index}`;
            return (
              <List.Item
                key={fallbackKey}
                extra={renderActionTags(item)}
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid #f0f0f0',
                  alignItems: 'flex-start',
                  gap: 20,
                }}
              >
                <List.Item.Meta
                  avatar={buildAvatar(item)}
                  title={<Typography.Text strong>{item.title}</Typography.Text>}
                  description={
                    <div>
                      {item.description && (
                        <Typography.Text type="secondary">
                          {item.description}
                        </Typography.Text>
                      )}
                      {item.datetime && (
                        <Typography.Text type="secondary">
                          {item.datetime}
                        </Typography.Text>
                      )}
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>
    </PageContainer>
  );
};

export default MessageCenter;
