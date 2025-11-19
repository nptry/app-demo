import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table, Timeline } from 'antd';
import type {
  DensityAlertItem,
  DensityAreaItem,
  DensityTrendItem,
  KeyAreaDensityResponse,
} from '@/services/keyArea';
import { getKeyAreaDensity } from '@/services/keyArea';

const statusColor: Record<DensityAreaItem['status'], 'success' | 'warning' | 'error'> = {
  正常: 'success',
  预警: 'warning',
  超限: 'error',
};

const DensityMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaDensity, {
    formatResult: (res: KeyAreaDensityResponse | { data: KeyAreaDensityResponse }) =>
      (res as { data?: KeyAreaDensityResponse })?.data ?? (res as KeyAreaDensityResponse),
  });

  const metrics = data?.metrics ?? {
    realtimeIndex: 0,
    highRiskZones: 0,
    warningsToday: 0,
    lastSync: '--',
  };
  const areas = data?.areas ?? [];
  const trend = data?.trend ?? [];
  const alerts = data?.alerts ?? [];

  const columns: ColumnsType<DensityAreaItem> = useMemo(
    () => [
      {
        title: '场所/区域',
        dataIndex: 'areaName',
        width: 220,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.zone}</div>
          </div>
        ),
      },
      {
        title: '实时密度 (人/100㎡)',
        dataIndex: 'realtimeDensity',
        width: 200,
      },
      {
        title: '阈值',
        dataIndex: 'threshold',
        width: 120,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 140,
        render: (value: DensityAreaItem['status']) => (
          <Badge status={statusColor[value]} text={value} />
        ),
      },
      {
        title: '变化趋势',
        dataIndex: 'change',
        width: 120,
      },
    ],
    [],
  );

  const trendColumns: ColumnsType<DensityTrendItem> = [
    { title: '时间', dataIndex: 'time', width: 120 },
    { title: '平均密度', dataIndex: 'avgDensity', width: 160, align: 'center' },
    { title: '高密度区域数', dataIndex: 'highDensityZones', align: 'center' },
  ];

  return (
    <PageContainer header={{ title: '人群密度监测' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="实时密度指数" value={metrics.realtimeIndex} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="高风险区域" value={metrics.highRiskZones} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="今日预警" value={metrics.warningsToday} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="同步时间" value={metrics.lastSync} />
          </Card>
        </Col>
      </Row>

      <Card title="实时密度" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<DensityAreaItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={areas}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="趋势分析" bodyStyle={{ paddingTop: 8 }}>
            <Table<DensityTrendItem>
              rowKey="time"
              dataSource={trend}
              columns={trendColumns}
              pagination={false}
              size="small"
            />
            {!trend.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无趋势数据</div>}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="告警时间轴" bodyStyle={{ paddingTop: 16 }}>
            <Timeline
              items={alerts.map((alert: DensityAlertItem) => ({
                color: alert.status === '已处理' ? 'green' : 'red',
                children: (
                  <div>
                    <div style={{ fontWeight: 600 }}>{alert.areaName}</div>
                    <div style={{ color: 'rgba(0,0,0,0.65)' }}>{alert.reason}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      时间：{alert.triggeredAt} · 责任人：{alert.handler}
                    </div>
                    <div style={{ fontSize: 12 }}>状态：{alert.status}</div>
                  </div>
                ),
              }))}
            />
            {!alerts.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无告警</div>}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DensityMonitoring;
