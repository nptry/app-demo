import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { DeviceBasicInfoItem, DeviceBasicInfoResponse } from '@/services/device';
import { getDeviceBasicInfo } from '@/services/device';

const statusMap: Record<DeviceBasicInfoItem['status'], { text: string; status: 'success' | 'default' | 'warning' | 'error' }> = {
  online: { text: '在线', status: 'success' },
  maintenance: { text: '维护中', status: 'warning' },
  offline: { text: '离线', status: 'error' },
};

const BasicInfo: React.FC = () => {
  const { data, loading } = useRequest(getDeviceBasicInfo, {
    formatResult: (res: DeviceBasicInfoResponse | { data: DeviceBasicInfoResponse }) => {
      return (res as { data?: DeviceBasicInfoResponse })?.data ?? (res as DeviceBasicInfoResponse);
    },
  });

  const summary: DeviceBasicInfoResponse['summary'] = data?.summary ?? {
    total: 0,
    aiEdge: 0,
    gateways: 0,
    online: 0,
  };

  const devices = data?.devices ?? [];

  const columns: ColumnsType<DeviceBasicInfoItem> = useMemo(
    () => [
      {
        title: '设备编号',
        dataIndex: 'id',
        width: 120,
      },
      {
        title: '设备名称',
        dataIndex: 'name',
        render: (value) => <strong>{value}</strong>,
        width: 200,
      },
      {
        title: '设备类型',
        dataIndex: 'type',
        width: 140,
      },
      {
        title: '规格/型号',
        dataIndex: 'model',
        width: 140,
      },
      {
        title: '供应商',
        dataIndex: 'vendor',
        width: 160,
      },
      {
        title: '应用类型',
        dataIndex: 'application',
        width: 160,
        render: (value: string) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '安装位置',
        dataIndex: 'location',
        width: 220,
      },
      {
        title: '坐标',
        dataIndex: 'coordinates',
        width: 160,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        render: (value: DeviceBasicInfoItem['status']) => {
          const badge = statusMap[value];
          return <Badge status={badge.status} text={badge.text} />;
        },
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '设备基础信息' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="在册设备" value={summary.total} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="AI 边缘计算" value={summary.aiEdge} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="4G 无线网关" value={summary.gateways} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="当前在线" value={summary.online} suffix="台" />
          </Card>
        </Col>
      </Row>

      <Card title="设备清单" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<DeviceBasicInfoItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={devices}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </PageContainer>
  );
};

export default BasicInfo;
