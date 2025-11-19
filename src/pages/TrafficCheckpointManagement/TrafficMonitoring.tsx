import React from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, List, Row, Statistic, Table, Tag } from 'antd';
import type {
  TrafficIncidentItem,
  TrafficMonitoringResponse,
  TrafficTrendItem,
} from '@/services/traffic';
import { getTrafficMonitoring } from '@/services/traffic';

const TrafficMonitoring: React.FC = () => {
  const { data } = useRequest(getTrafficMonitoring, {
    formatResult: (res: TrafficMonitoringResponse | { data: TrafficMonitoringResponse }) =>
      (res as { data?: TrafficMonitoringResponse })?.data ?? (res as TrafficMonitoringResponse),
  });

  const metrics = data?.metrics ?? {
    totalVehicles: 0,
    avgSpeed: 0,
    incidents: 0,
    peakHour: '--',
  };
  const trend = data?.trend ?? [];
  const incidents = data?.incidents ?? [];

  const columns: ColumnsType<TrafficTrendItem> = [
    { title: '时间', dataIndex: 'time', width: 140 },
    { title: '进城', dataIndex: 'inbound', align: 'center' },
    { title: '出城', dataIndex: 'outbound', align: 'center' },
  ];

  return (
    <PageContainer header={{ title: '车流监控' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="今日累计车流" value={metrics.totalVehicles} suffix="辆" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="平均速度" value={metrics.avgSpeed} suffix="km/h" precision={0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="异常事件" value={metrics.incidents} suffix="起" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="峰值时段" value={metrics.peakHour} />
          </Card>
        </Col>
      </Row>

      <Card title="时段趋势" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<TrafficTrendItem>
          rowKey="time"
          columns={columns}
          dataSource={trend}
          pagination={false}
          size="small"
        />
        {!trend.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无趋势数据</div>}
      </Card>

      <Card title="事件列表" style={{ marginTop: 24 }}>
        <List
          dataSource={incidents}
          renderItem={(incident: TrafficIncidentItem) => (
            <List.Item key={incident.id}>
              <List.Item.Meta
                title={`${incident.checkpoint} · ${incident.type}`}
                description={
                  <div>
                    <div>{incident.description}</div>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>时间：{incident.time}</div>
                  </div>
                }
              />
              <Tag color={incident.status === '已恢复' ? 'green' : 'orange'}>{incident.status}</Tag>
            </List.Item>
          )}
        />
        {!incidents.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无事件</div>}
      </Card>
    </PageContainer>
  );
};

export default TrafficMonitoring;
