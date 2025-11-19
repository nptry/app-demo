import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Table, Tag } from 'antd';
import type { ChannelDeploymentItem, ChannelDeploymentResponse } from '@/services/pedestrian';
import { getChannelDeployments } from '@/services/pedestrian';

const statusColor: Record<ChannelDeploymentItem['status'], 'success' | 'processing' | 'error'> = {
  在线: 'success',
  维护: 'processing',
  离线: 'error',
};

const DeviceDeployment: React.FC = () => {
  const { data, loading } = useRequest(getChannelDeployments, {
    formatResult: (res: ChannelDeploymentResponse | { data: ChannelDeploymentResponse }) =>
      (res as { data?: ChannelDeploymentResponse })?.data ?? (res as ChannelDeploymentResponse),
  });

  const devices = data?.devices ?? [];

  const columns: ColumnsType<ChannelDeploymentItem> = useMemo(
    () => [
      { title: '通道', dataIndex: 'channelName', width: 200 },
      { title: '设备名称', dataIndex: 'deviceName', width: 220, render: (value: string) => <strong>{value}</strong> },
      { title: '类型', dataIndex: 'deviceType', width: 160, render: (value: string) => <Tag color="blue">{value}</Tag> },
      { title: '安装位置', dataIndex: 'installation', width: 220 },
      { title: '节点编号', dataIndex: 'poleCode', width: 140 },
      { title: '算法/服务', dataIndex: 'aiModels', render: (models: string[]) => models.map((model) => (
        <Tag color="purple" key={model}>
          {model}
        </Tag>
      )) },
      { title: '网络', dataIndex: 'network', width: 180 },
      { title: '状态', dataIndex: 'status', width: 120, render: (value: ChannelDeploymentItem['status']) => <Badge status={statusColor[value]} text={value} /> },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '通道设备部署' }}>
      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<ChannelDeploymentItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={devices}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1200 }}
        />
        {!devices.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无设备数据</div>}
      </Card>
    </PageContainer>
  );
};

export default DeviceDeployment;
