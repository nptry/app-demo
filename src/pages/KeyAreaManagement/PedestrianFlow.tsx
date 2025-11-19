import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, List, Row, Statistic, Table, Tag } from 'antd';
import type {
  FlowDirectionItem,
  FlowEventItem,
  FlowTrendItem,
  KeyAreaFlowResponse,
} from '@/services/keyArea';
import { getKeyAreaFlow } from '@/services/keyArea';

const levelColor: Record<FlowDirectionItem['congestionLevel'], string> = {
  畅通: 'green',
  轻度拥挤: 'orange',
  拥挤: 'red',
};

const PedestrianFlow: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaFlow, {
    formatResult: (res: KeyAreaFlowResponse | { data: KeyAreaFlowResponse }) =>
      (res as { data?: KeyAreaFlowResponse })?.data ?? (res as KeyAreaFlowResponse),
  });

  const metrics = data?.metrics ?? {
    totalToday: 0,
    peakHour: '--',
    abnormalEvents: 0,
    avgSpeed: 0,
  };

  const directions = data?.directions ?? [];
  const trend = data?.trend ?? [];
  const events = data?.events ?? [];

  const columns: ColumnsType<FlowDirectionItem> = useMemo(
    () => [
      {
        title: '场所',
        dataIndex: 'areaName',
        width: 200,
      },
      {
        title: '主要方向',
        dataIndex: 'mainDirection',
        width: 160,
      },
      {
        title: '东→西 (人/15min)',
        dataIndex: 'eastToWest',
        width: 200,
        align: 'center',
      },
      {
        title: '西→东 (人/15min)',
        dataIndex: 'westToEast',
        width: 200,
        align: 'center',
      },
      {
        title: '拥堵等级',
        dataIndex: 'congestionLevel',
        width: 140,
        render: (value: FlowDirectionItem['congestionLevel']) => (
          <Tag color={levelColor[value]}>{value}</Tag>
        ),
      },
    ],
    [],
  );

  const trendColumns: ColumnsType<FlowTrendItem> = [
    { title: '时间', dataIndex: 'time', width: 140 },
    { title: '进入 (人次)', dataIndex: 'inbound', width: 160, align: 'center' },
    { title: '离开 (人次)', dataIndex: 'outbound', width: 160, align: 'center' },
  ];

  return (
    <PageContainer header={{ title: '行人流量监测' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="今日累计人流" value={metrics.totalToday} suffix="人次" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="峰值时段" value={metrics.peakHour} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="异常事件" value={metrics.abnormalEvents} suffix="起" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="平均速度" value={metrics.avgSpeed} precision={2} suffix="m/s" />
          </Card>
        </Col>
      </Row>

      <Card title="方向分布" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<FlowDirectionItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={directions}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="时段趋势" bodyStyle={{ paddingTop: 8 }}>
            <Table<FlowTrendItem>
              rowKey="time"
              columns={trendColumns}
              dataSource={trend}
              pagination={false}
              size="small"
            />
            {!trend.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无趋势数据</div>}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="异常事件" bodyStyle={{ paddingTop: 16 }}>
            <List
              dataSource={events}
              renderItem={(event: FlowEventItem) => (
                <List.Item key={event.id}>
                  <List.Item.Meta
                    title={`${event.areaName} · ${event.type}`}
                    description={
                      <div>
                        <div>{event.detail}</div>
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>时间：{event.time}</div>
                      </div>
                    }
                  />
                  <Tag color={event.status === '已恢复' ? 'green' : 'orange'}>{event.status}</Tag>
                </List.Item>
              )}
            />
            {!events.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无事件</div>}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default PedestrianFlow;
