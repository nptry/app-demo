import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useMemo } from 'react';
import type {
  TrafficMonitoringRecord,
  TrafficMonitoringResponse,
} from '@/services/traffic';
import { getTrafficMonitoring } from '@/services/traffic';

const TrafficMonitoring: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getTrafficMonitoring, {
    formatResult: (
      res: TrafficMonitoringResponse | { data: TrafficMonitoringResponse },
    ) =>
      (res as { data?: TrafficMonitoringResponse })?.data ??
      (res as TrafficMonitoringResponse),
  });

  const records = data?.records ?? [];
  const congestionCount = records.filter((record) => record.congestion).length;
  const recordUnitLabel = t('pages.common.unit.records');

  const columns: ColumnsType<TrafficMonitoringRecord> = useMemo(
    () => [
      {
        title: t('pages.trafficMonitoring.columns.checkpoint'),
        dataIndex: 'checkpointName',
        width: 220,
      },
      {
        title: t('pages.trafficMonitoring.columns.lane'),
        dataIndex: 'lane',
        width: 180,
      },
      {
        title: t('pages.trafficMonitoring.columns.period'),
        dataIndex: 'period',
        width: 200,
      },
      {
        title: t('pages.trafficMonitoring.columns.range'),
        dataIndex: 'range',
        width: 220,
      },
      {
        title: t('pages.trafficMonitoring.columns.totalVehicles'),
        dataIndex: 'totalVehicles',
        width: 140,
      },
      {
        title: t('pages.trafficMonitoring.columns.threshold'),
        dataIndex: 'threshold',
        width: 140,
      },
      {
        title: t('pages.trafficMonitoring.columns.congestion'),
        dataIndex: 'congestion',
        width: 140,
        render: (value: boolean) => (
          <Tag color={value ? 'orange' : 'green'}>
            {value
              ? t('pages.trafficMonitoring.tag.congested')
              : t('pages.trafficMonitoring.tag.normal')}
          </Tag>
        ),
      },
      {
        title: t('pages.trafficMonitoring.columns.duration'),
        dataIndex: 'duration',
        width: 160,
        render: (value: string | undefined) => value ?? '—',
      },
      {
        title: t('pages.trafficMonitoring.columns.suggestion'),
        dataIndex: 'suggestion',
        width: 240,
        render: (value: string | undefined) => value ?? '—',
      },
      {
        title: t('pages.trafficMonitoring.columns.device'),
        dataIndex: 'deviceId',
        width: 180,
      },
    ],
    [t],
  );

  return (
    <PageContainer header={{ title: t('pages.trafficMonitoring.pageTitle') }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.trafficMonitoring.stat.records')}
              value={records.length}
              suffix={recordUnitLabel}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.trafficMonitoring.stat.congestionEvents')}
              value={congestionCount}
              suffix={recordUnitLabel}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.trafficMonitoring.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
      >
        <Table<TrafficMonitoringRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1700 }}
        />
      </Card>
    </PageContainer>
  );
};

export default TrafficMonitoring;
