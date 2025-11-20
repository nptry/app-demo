import React from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, List, Progress, Row, Statistic, Table } from 'antd';
import type { OperationsStatisticsResponse } from '@/services/operations';
import { getOperationsStatistics } from '@/services/operations';

const Statistics: React.FC = () => {
  const { data, loading } = useRequest(getOperationsStatistics, {
    formatResult: (res: OperationsStatisticsResponse | { data: OperationsStatisticsResponse }) =>
      (res as { data?: OperationsStatisticsResponse })?.data ?? (res as OperationsStatisticsResponse),
  });

  const stats = data ?? {
    period: '--',
    totalFaults: 0,
    resolved: 0,
    resolveRate: 0,
    avgHandleDuration: '--',
    typeDistribution: [],
    topDevices: [],
    topEngineers: [],
    generatedAt: '--',
  };

  return (
    <PageContainer header={{ title: '运维统计' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="统计周期" value={stats.period} />
            <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.45)' }}>生成时间：{stats.generatedAt}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="故障总数" value={stats.totalFaults} suffix="起" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="已处理" value={stats.resolved} suffix="起" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="平均处理时长" value={stats.avgHandleDuration} />
            <div style={{ marginTop: 12 }}>
              <Statistic title="解决率" value={stats.resolveRate} precision={1} suffix="%" />
              <Progress percent={stats.resolveRate} size="small" style={{ marginTop: 8 }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="故障类型分布">
            {stats.typeDistribution.length ? (
              stats.typeDistribution.map((item) => (
                <div key={item.type} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{item.type}</span>
                    <span>{item.value} 起</span>
                  </div>
                  <Progress percent={(item.value / stats.totalFaults) * 100} showInfo={false} strokeColor="#faad14" />
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: 16 }}>暂无分布数据</div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="故障高发设备 TOP">
            <Table
              rowKey="deviceName"
              size="small"
              columns={[
                { title: '设备', dataIndex: 'deviceName' },
                { title: '故障次数', dataIndex: 'count', width: 120, align: 'center' },
              ]}
              dataSource={stats.topDevices}
              pagination={false}
              loading={loading}
            />
            {!stats.topDevices.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无设备数据</div>}
          </Card>
        </Col>
      </Row>

      <Card title="运维人员处理量 TOP" style={{ marginTop: 24 }}>
        <List
          loading={loading}
          dataSource={stats.topEngineers}
          renderItem={(item) => (
            <List.Item key={item.engineer}>
              <List.Item.Meta title={item.engineer} description={`处理 ${item.handled} 起`} />
              <div style={{ minWidth: 180 }}>
                <div style={{ marginBottom: 4 }}>解决率：{(item.rate * 100).toFixed(0)}%</div>
                <Progress percent={item.rate * 100} showInfo={false} strokeColor="#52c41a" />
              </div>
            </List.Item>
          )}
        />
        {!stats.topEngineers.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无人员数据</div>}
      </Card>
    </PageContainer>
  );
};

export default Statistics;
