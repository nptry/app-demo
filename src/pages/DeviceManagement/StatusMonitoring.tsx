import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import {
  Badge,
  Card,
  Col,
  Progress,
  Row,
  Statistic,
  Table,
  Timeline,
} from 'antd';
import type {
  DeviceAlertItem,
  DeviceStatusItem,
  DeviceStatusResponse,
} from '@/services/device';
import { getDeviceStatus } from '@/services/device';

const statusBadge: Record<DeviceStatusItem['status'], { text: string; status: 'success' | 'processing' | 'error' | 'warning' | 'default' }> = {
  online: { text: '在线', status: 'success' },
  warning: { text: '预警', status: 'warning' },
  offline: { text: '离线', status: 'error' },
};

const StatusMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getDeviceStatus, {
    formatResult: (res: DeviceStatusResponse | { data: DeviceStatusResponse }) =>
      (res as { data?: DeviceStatusResponse })?.data ?? (res as DeviceStatusResponse),
  });

  const metrics = data?.metrics ?? {
    uptime: 0,
    offlineDevices: 0,
    warnings: 0,
    lastSync: '--',
  };
  const statuses = data?.statuses ?? [];
  const alerts = data?.alerts ?? [];
  const trend = (data?.trend ?? []) as DeviceStatusResponse['trend'];

  const columns: ColumnsType<DeviceStatusItem> = useMemo(
    () => [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 240,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.type}</div>
          </div>
        ),
      },
      {
        title: '运行状态',
        dataIndex: 'status',
        width: 140,
        render: (value: DeviceStatusItem['status']) => {
          const badge = statusBadge[value];
          return <Badge status={badge.status} text={badge.text} />;
        },
      },
      {
        title: '健康评分',
        dataIndex: 'healthScore',
        width: 180,
        render: (value: number) => (
          <Progress
            percent={value}
            size="small"
            strokeColor={value >= 80 ? '#52c41a' : value >= 60 ? '#faad14' : '#ff4d4f'}
          />
        ),
      },
      {
        title: '最近心跳',
        dataIndex: 'lastHeartbeat',
        width: 180,
      },
      {
        title: '设备温度',
        dataIndex: 'temperature',
        width: 140,
        render: (value: number) => `${value} ℃`,
      },
      {
        title: '功耗/负载',
        dataIndex: 'powerLoad',
        width: 160,
      },
      {
        title: '网络时延',
        dataIndex: 'networkLatency',
        width: 140,
        render: (value: number) => `${value} ms`,
      },
    ],
    [],
  );

  const trendColumns: ColumnsType<DeviceStatusResponse['trend'][number]> = [
    {
      title: '时间段',
      dataIndex: 'time',
    },
    {
      title: '在线设备',
      dataIndex: 'online',
      align: 'center',
    },
    {
      title: '预警设备',
      dataIndex: 'warnings',
      align: 'center',
    },
    {
      title: '离线设备',
      dataIndex: 'offline',
      align: 'center',
    },
  ];

  return (
    <PageContainer header={{ title: '设备状态监测' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="近24小时在线率" value={metrics.uptime} precision={2} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="离线设备" value={metrics.offlineDevices} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="告警/预警" value={metrics.warnings} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="状态同步" value={metrics.lastSync} />
          </Card>
        </Col>
      </Row>

      <Card title="实时设备状态" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<DeviceStatusItem>
          rowKey="id"
          columns={columns}
          dataSource={statuses}
          loading={loading}
          pagination={{ pageSize: 7, showSizeChanger: false }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="在线趋势" bodyStyle={{ paddingTop: 8 }}>
            <Table<DeviceStatusResponse['trend'][number]>
              rowKey={(record) => record.time}
              size="small"
              pagination={false}
              columns={trendColumns}
              dataSource={trend}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="最新告警" bodyStyle={{ paddingTop: 16 }}>
            <Timeline
              items={alerts.map((alert: DeviceAlertItem) => ({
                color: alert.status === '已关闭' ? 'green' : 'red',
                children: (
                  <div>
                    <div style={{ fontWeight: 600 }}>{alert.deviceName}</div>
                    <div style={{ color: 'rgba(0,0,0,0.65)' }}>{alert.issue}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      触发时间：{alert.triggeredAt}
                    </div>
                    <div style={{ fontSize: 12 }}>
                      责任人：{alert.handler} · 状态：{alert.status}
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default StatusMonitoring;
