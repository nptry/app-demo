import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Table, Tag } from 'antd';
import type { ChannelDeploymentItem, ChannelDeploymentResponse } from '@/services/pedestrian';
import { getChannelDeployments } from '@/services/pedestrian';

const statusColor: Record<ChannelDeploymentItem['status'], 'success' | 'processing' | 'default'> = {
  正常运行: 'success',
  待调试: 'processing',
  已拆除: 'default',
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
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.deviceId}</div>
          </div>
        ),
      },
      { title: '设备类型', dataIndex: 'deviceType', width: 180, render: (value: ChannelDeploymentItem['deviceType']) => <Tag color="blue">{value}</Tag> },
      { title: '安装位置', dataIndex: 'position', width: 220 },
      { title: '安装高度 (m)', dataIndex: 'installHeight', width: 140 },
      { title: '镜头角度', dataIndex: 'lensAngle', width: 160 },
      { title: '部署时间', dataIndex: 'installDate', width: 160 },
      { title: '责任人', dataIndex: 'owner', width: 160 },
      { title: '状态', dataIndex: 'status', width: 140, render: (value: ChannelDeploymentItem['status']) => <Badge status={statusColor[value]} text={value} /> },
      { title: '捕获测试结果', dataIndex: 'testResult', width: 200 },
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
          scroll={{ x: 1500 }}
        />
      </Card>
    </PageContainer>
  );
};

export default DeviceDeployment;
