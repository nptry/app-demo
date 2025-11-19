import React from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Table, Tag } from 'antd';
import type { TrajectoryItem, TrajectoryResponse } from '@/services/pedestrian';
import { getChannelTrajectories } from '@/services/pedestrian';

const TrajectoryTracking: React.FC = () => {
  const { data, loading } = useRequest(getChannelTrajectories, {
    formatResult: (res: TrajectoryResponse | { data: TrajectoryResponse }) =>
      (res as { data?: TrajectoryResponse })?.data ?? (res as TrajectoryResponse),
  });

  const trajectories = data?.trajectories ?? [];

  const columns: ColumnsType<TrajectoryItem> = [
    { title: '人员', dataIndex: 'personName', width: 200, render: (value: string) => <strong>{value}</strong> },
    { title: '行进路径', dataIndex: 'path', width: 360 },
    { title: '持续时长', dataIndex: 'duration', width: 160 },
    { title: '最近出现', dataIndex: 'lastSeen', width: 180 },
    { title: '置信度', dataIndex: 'confidence', render: (value: number) => <Tag color={value >= 90 ? 'green' : 'orange'}>{value}%</Tag> },
  ];

  return (
    <PageContainer header={{ title: '轨迹跟踪' }}>
      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<TrajectoryItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={trajectories}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1100 }}
        />
        {!trajectories.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无轨迹数据</div>}
      </Card>
    </PageContainer>
  );
};

export default TrajectoryTracking;
