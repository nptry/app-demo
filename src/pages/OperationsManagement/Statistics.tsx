import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import { Card, Col, List, Progress, Row, Statistic, Table } from 'antd';
import React, { useCallback } from 'react';
import type { OperationsStatisticsResponse } from '@/services/operations';
import { getOperationsStatistics } from '@/services/operations';

const Statistics: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getOperationsStatistics, {
    formatResult: (
      res:
        | OperationsStatisticsResponse
        | { data: OperationsStatisticsResponse },
    ) =>
      (res as { data?: OperationsStatisticsResponse })?.data ??
      (res as OperationsStatisticsResponse),
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
    <PageContainer
      header={{ title: t('pages.operations.statistics.pageTitle') }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.statistics.card.period')}
              value={stats.period}
            />
            <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.45)' }}>
              {t('pages.operations.statistics.card.generatedAt', {
                time: stats.generatedAt,
              })}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.statistics.card.totalFaults')}
              value={stats.totalFaults}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.statistics.card.resolved')}
              value={stats.resolved}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.statistics.card.avgDuration')}
              value={stats.avgHandleDuration}
            />
            <div style={{ marginTop: 12 }}>
              <Statistic
                title={t('pages.operations.statistics.card.resolveRate')}
                value={stats.resolveRate}
                precision={1}
                suffix="%"
              />
              <Progress
                percent={stats.resolveRate}
                size="small"
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title={t('pages.operations.statistics.distribution.title')}>
            {stats.typeDistribution.length ? (
              stats.typeDistribution.map((item) => (
                <div key={item.type} style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span>{item.type}</span>
                    <span>
                      {t('pages.operations.statistics.distribution.count', {
                        value: item.value,
                      })}
                    </span>
                  </div>
                  <Progress
                    percent={(item.value / stats.totalFaults) * 100}
                    showInfo={false}
                    strokeColor="#faad14"
                  />
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: 16 }}>
                {t('pages.operations.statistics.distribution.none')}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={t('pages.operations.statistics.devices.title')}>
            <Table
              rowKey="deviceName"
              size="small"
              columns={[
                {
                  title: t('pages.operations.statistics.table.columns.device'),
                  dataIndex: 'deviceName',
                },
                {
                  title: t('pages.operations.statistics.table.columns.count'),
                  dataIndex: 'count',
                  width: 120,
                  align: 'center',
                },
              ]}
              dataSource={stats.topDevices}
              pagination={false}
              loading={loading}
            />
            {!stats.topDevices.length && (
              <div style={{ textAlign: 'center', padding: 16 }}>
                {t('pages.operations.statistics.devices.none')}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.operations.statistics.engineers.title')}
        style={{ marginTop: 24 }}
      >
        <List
          loading={loading}
          dataSource={stats.topEngineers}
          renderItem={(item) => (
            <List.Item key={item.engineer}>
              <List.Item.Meta
                title={item.engineer}
                description={t(
                  'pages.operations.statistics.engineers.handled',
                  { count: item.handled },
                )}
              />
              <div style={{ minWidth: 180 }}>
                <div style={{ marginBottom: 4 }}>
                  {t('pages.operations.statistics.engineers.rate', {
                    rate: (item.rate * 100).toFixed(0),
                  })}
                </div>
                <Progress
                  percent={item.rate * 100}
                  showInfo={false}
                  strokeColor="#52c41a"
                />
              </div>
            </List.Item>
          )}
        />
        {!stats.topEngineers.length && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            {t('pages.operations.statistics.engineers.none')}
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default Statistics;
