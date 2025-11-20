import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table } from 'antd';
import type { DeviceStatusItem, DeviceStatusResponse } from '@/services/device';
import { getDeviceStatus } from '@/services/device';

const statusColor: Record<DeviceStatusItem['realtimeStatus'], 'success' | 'warning' | 'error' | 'default'> = {
  在线: 'success',
  维护中: 'warning',
  故障: 'error',
  离线: 'default',
};

const StatusMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getDeviceStatus, {
    formatResult: (res: DeviceStatusResponse | { data: DeviceStatusResponse }) =>
      (res as { data?: DeviceStatusResponse })?.data ?? (res as DeviceStatusResponse),
  });

  const metrics = data?.metrics ?? {
    onlineRate: 0,
    offlineDevices: 0,
    faultDevices: 0,
    lastSync: '--',
  };
  const statuses = data?.statuses ?? [];

  const columns: ColumnsType<DeviceStatusItem> = useMemo(
    () => [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.type}</div>
          </div>
        ),
      },
      {
        title: '实时状态',
        dataIndex: 'realtimeStatus',
        width: 140,
        render: (value: DeviceStatusItem['realtimeStatus']) => (
          <Badge status={statusColor[value]} text={value} />
        ),
      },
      {
        title: 'CPU / 内存占用',
        dataIndex: 'cpuUsage',
        width: 180,
        render: (value: number | undefined, record) =>
          value !== undefined && record.memoryUsage !== undefined
            ? `${value}% / ${record.memoryUsage}%`
            : '—',
      },
      {
        title: '网络信号强度',
        dataIndex: 'signalStrength',
        width: 160,
        render: (value: string | undefined) => value ?? '—',
      },
      { title: '数据上传速率', dataIndex: 'uploadRate', width: 160 },
      { title: '最后心跳时间', dataIndex: 'lastHeartbeat', width: 200 },
      { title: '异常提示', dataIndex: 'exception' },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '设备状态监测' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="在线率" value={metrics.onlineRate} precision={1} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="离线设备" value={metrics.offlineDevices} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="故障设备" value={metrics.faultDevices} suffix="台" valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="状态同步时间" value={metrics.lastSync} />
          </Card>
        </Col>
      </Row>

      <Card title="实时设备状态" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<DeviceStatusItem>
          rowKey={(record) => record.deviceId}
          columns={columns}
          dataSource={statuses}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </PageContainer>
  );
};

export default StatusMonitoring;
