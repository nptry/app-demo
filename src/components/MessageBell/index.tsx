import { BellOutlined } from '@ant-design/icons';
import { history, useRequest } from '@umijs/max';
import { Badge, Button, Tooltip } from 'antd';
import React, { useMemo } from 'react';

import { getMessageCenterList } from '@/services/messageCenter';

const MessageBell: React.FC = () => {
  const { data = [], loading } = useRequest(getMessageCenterList, {
    formatResult: (res) => res?.data ?? [],
    refreshInterval: 60000,
  });

  const unreadCount = useMemo(
    () => data.filter((item) => !item.read).length,
    [data],
  );

  return (
    <Tooltip title="消息中心">
      <Badge
        count={unreadCount}
        overflowCount={99}
        size="small"
        offset={[-10, 8]}
      >
        <Button
          type="text"
          loading={loading}
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          onClick={() => history.push('/message-center')}
          style={{ padding: '0 12px' }}
        />
      </Badge>
    </Tooltip>
  );
};

export default MessageBell;
