import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Table, Tag } from 'antd';
import type { DeploymentItem, KeyAreaDeploymentResponse } from '@/services/keyArea';
import { getKeyAreaDeployments } from '@/services/keyArea';

const statusColor: Record<DeploymentItem['status'], 'success' | 'processing' | 'default'> = {
  正常运行: 'success',
  待调试: 'processing',
  已拆除: 'default',
};

const DeviceDeployment: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaDeployments, {
    formatResult: (res: KeyAreaDeploymentResponse | { data: KeyAreaDeploymentResponse }) =>
      (res as { data?: KeyAreaDeploymentResponse })?.data ?? (res as KeyAreaDeploymentResponse),
  });

  const deployments = data?.deployments ?? [];

  const columns: ColumnsType<DeploymentItem> = useMemo(
    () => [
      { title: '部署 ID', dataIndex: 'id', width: 140 },
      { title: '所属场所', dataIndex: 'siteName', width: 200 },
      { title: '监测区域编号', dataIndex: 'zoneCode', width: 180 },
      { title: '区域面积（㎡）', dataIndex: 'zoneArea', width: 150 },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: 160,
        render: (value: DeploymentItem['deviceType']) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '设备名称 / 编号',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.deviceId}</div>
          </div>
        ),
      },
      { title: '安装位置', dataIndex: 'position', width: 220 },
      { title: '安装高度（m）', dataIndex: 'installHeight', width: 150 },
      { title: '部署时间', dataIndex: 'installDate', width: 160 },
      {
        title: '责任人',
        dataIndex: 'owner',
        width: 140,
      },
      {
        title: '部署状态',
        dataIndex: 'status',
        width: 140,
        render: (value: DeploymentItem['status']) => <Badge status={statusColor[value]} text={value} />,
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '设备部署管理' }}>
      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<DeploymentItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={deployments}
          pagination={{ pageSize: 7, showSizeChanger: false }}
          scroll={{ x: 1500 }}
        />
      </Card>
    </PageContainer>
  );
};

export default DeviceDeployment;
