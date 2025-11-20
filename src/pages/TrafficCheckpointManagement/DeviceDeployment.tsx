import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Table, Tag } from 'antd';
import type { TrafficDeploymentItem, TrafficDeploymentResponse } from '@/services/traffic';
import { getTrafficDeployments } from '@/services/traffic';

const statusColor: Record<TrafficDeploymentItem['status'], 'success' | 'processing' | 'default'> = {
  正常运行: 'success',
  待调试: 'processing',
  已拆除: 'default',
};

const DeviceDeployment: React.FC = () => {
  const { data, loading } = useRequest(getTrafficDeployments, {
    formatResult: (res: TrafficDeploymentResponse | { data: TrafficDeploymentResponse }) =>
      (res as { data?: TrafficDeploymentResponse })?.data ?? (res as TrafficDeploymentResponse),
  });

  const deployments = data?.deployments ?? [];

  const columns: ColumnsType<TrafficDeploymentItem> = useMemo(
    () => [
      { title: '部署 ID', dataIndex: 'id', width: 140 },
      { title: '卡口名称', dataIndex: 'checkpointName', width: 200 },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: 180,
        render: (value: TrafficDeploymentItem['deviceType']) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '设备名称 / 编号',
        dataIndex: 'deviceName',
        width: 240,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.deviceId}</div>
          </div>
        ),
      },
      { title: '安装车道/位置', dataIndex: 'lane', width: 200 },
      { title: '安装位置描述', dataIndex: 'position', width: 220 },
      { title: '镜头焦距', dataIndex: 'lensFocal', width: 140 },
      { title: '部署时间', dataIndex: 'installDate', width: 160 },
      { title: '责任人', dataIndex: 'owner', width: 160 },
      {
        title: '部署状态',
        dataIndex: 'status',
        width: 140,
        render: (value: TrafficDeploymentItem['status']) => <Badge status={statusColor[value]} text={value} />,
      },
      { title: '调试结果', dataIndex: 'result', width: 200 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '卡口设备部署' }}>
      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<TrafficDeploymentItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={deployments}
          pagination={{ pageSize: 7, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>
    </PageContainer>
  );
};

export default DeviceDeployment;
