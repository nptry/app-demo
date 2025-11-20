import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table } from 'antd';
import type { DeviceBasicInfoItem, DeviceBasicInfoResponse } from '@/services/device';
import { getDeviceBasicInfo } from '@/services/device';

const statusBadge: Record<DeviceBasicInfoItem['status'], 'success' | 'processing' | 'error' | 'warning'> = {
  在线: 'success',
  维护中: 'warning',
  故障: 'error',
  离线: 'error',
};

const BasicInfo: React.FC = () => {
  const { data, loading } = useRequest(getDeviceBasicInfo, {
    formatResult: (res: DeviceBasicInfoResponse | { data: DeviceBasicInfoResponse }) =>
      (res as { data?: DeviceBasicInfoResponse })?.data ?? (res as DeviceBasicInfoResponse),
  });

  const summary = data?.summary ?? {
    total: 0,
    aiEdge: 0,
    gateways: 0,
    online: 0,
  };

  const devices = data?.devices ?? [];

  const columns: ColumnsType<DeviceBasicInfoItem> = useMemo(
    () => [
      { title: '设备 ID', dataIndex: 'id', width: 150 },
      {
        title: '设备名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '设备类型 / 型号',
        dataIndex: 'type',
        width: 220,
        render: (value: DeviceBasicInfoItem['type'], record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.model}</div>
          </div>
        ),
      },
      { title: '供应商', dataIndex: 'vendor', width: 160 },
      { title: '设备序列号', dataIndex: 'serialNumber', width: 200 },
      { title: '安装时间', dataIndex: 'installDate', width: 140 },
      { title: '质保期限', dataIndex: 'warrantyDate', width: 140 },
      {
        title: '设备状态',
        dataIndex: 'status',
        width: 140,
        render: (value: DeviceBasicInfoItem['status']) => (
          <Badge status={statusBadge[value]} text={value} />
        ),
      },
      { title: '备注', dataIndex: 'remark' },
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
          scroll={{ x: 1400 }}
        />
      </Card>
    </PageContainer>
  );
};

export default BasicInfo;
