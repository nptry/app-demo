import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Progress, Row, Statistic, Table, Tag } from 'antd';
import type {
  NetworkHealthItem,
  OperationsStatisticsResponse,
  ResourceUsageItem,
  StatisticsTrendItem,
} from '@/services/operations';
import { getOperationsStatistics } from '@/services/operations';

const networkStatus: Record<NetworkHealthItem['status'], string> = {
  正常: 'green',
  关注: 'gold',
  中断: 'red',
};

const Statistics: React.FC = () => {
  const { data } = useRequest(getOperationsStatistics, {
    formatResult: (res: OperationsStatisticsResponse | { data: OperationsStatisticsResponse }) =>
      (res as { data?: OperationsStatisticsResponse })?.data ?? (res as OperationsStatisticsResponse),
  });

  const kpis = data?.kpis ?? {
    availability: 0,
    faultRate: 0,
    mttr: 0,
    responseWithin15: 0,
  };
  const trend = data?.trend ?? [];
  const resourceUsage = data?.resourceUsage ?? [];
  const networkHealth = data?.networkHealth ?? [];

  const trendColumns: ColumnsType<StatisticsTrendItem> = useMemo(
    () => [
      { title: '月份', dataIndex: 'month', width: 120 },
      { title: '故障事件（起）', dataIndex: 'incidents', width: 160, align: 'center' },
      { title: '平均响应（分钟）', dataIndex: 'avgResponse', width: 180, align: 'center' },
      {
        title: '远程处置占比',
        dataIndex: 'remoteRate',
        render: (value: number) => <Progress percent={value} size="small" />,
      },
    ],
    [],
  );

  const resourceColumns: ColumnsType<ResourceUsageItem> = useMemo(
    () => [
      { title: '资源组', dataIndex: 'resource', width: 200 },
      { title: '利用率', dataIndex: 'utilization', width: 200, render: (value: number) => <Progress percent={value} size="small" /> },
      { title: '主要任务', dataIndex: 'workload' },
    ],
    [],
  );

  const networkColumns: ColumnsType<NetworkHealthItem> = useMemo(
    () => [
      { title: '节点', dataIndex: 'node', width: 200 },
      { title: '时延', dataIndex: 'latency', width: 140 },
      { title: '丢包率', dataIndex: 'packetLoss', width: 140 },
      {
        title: '状态',
        dataIndex: 'status',
        render: (value: NetworkHealthItem['status']) => <Tag color={networkStatus[value]}>{value}</Tag>,
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '运维统计' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="系统可用率" value={kpis.availability} precision={2} suffix="%" />
            <Progress percent={Number(kpis.availability.toFixed(2))} size="small" style={{ marginTop: 12 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="故障率" value={kpis.faultRate} precision={2} suffix="%" />
            <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.45)' }}>越低越好</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="平均修复时长" value={kpis.mttr} precision={1} suffix="小时" />
            <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.45)' }}>近30天</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="15分钟响应率" value={kpis.responseWithin15} precision={0} suffix="%" />
            <Progress percent={kpis.responseWithin15} size="small" style={{ marginTop: 12 }} strokeColor="#52c41a" />
          </Card>
        </Col>
      </Row>

      <Card title="月度趋势" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<StatisticsTrendItem>
          rowKey="month"
          columns={trendColumns}
          dataSource={trend}
          pagination={false}
          size="small"
          scroll={{ x: 700 }}
        />
        {!trend.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无趋势数据</div>}
      </Card>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="资源利用情况" bodyStyle={{ paddingTop: 8 }}>
            <Table<ResourceUsageItem>
              rowKey="resource"
              columns={resourceColumns}
              dataSource={resourceUsage}
              pagination={false}
              size="small"
            />
            {!resourceUsage.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无资源数据</div>}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="网络健康度" bodyStyle={{ paddingTop: 8 }}>
            <Table<NetworkHealthItem>
              rowKey="node"
              columns={networkColumns}
              dataSource={networkHealth}
              pagination={false}
              size="small"
            />
            {!networkHealth.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无网络健康数据</div>}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Statistics;
