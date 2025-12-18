import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useMemo } from 'react';
import type { FlowRecord, KeyAreaFlowResponse } from '@/services/keyArea';
import { getKeyAreaFlow } from '@/services/keyArea';

const PedestrianFlow: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getKeyAreaFlow, {
    formatResult: (res: KeyAreaFlowResponse | { data: KeyAreaFlowResponse }) =>
      (res as { data?: KeyAreaFlowResponse })?.data ??
      (res as KeyAreaFlowResponse),
  });

  const metrics = data?.metrics ?? {
    totalFlows: 0,
    abnormalEvents: 0,
    lastSync: '--',
  };
  const records = data?.records ?? [];
  const personTimesUnit = t('pages.keyArea.flow.unit.personTimes');
  const eventUnit = t('pages.keyArea.flow.unit.events');
  const directionLabelMap = useMemo(
    () => ({
      双向: t('pages.keyArea.flow.direction.twoWay'),
      单向: t('pages.keyArea.flow.direction.oneWay'),
      上行: t('pages.keyArea.flow.direction.upward'),
      下行: t('pages.keyArea.flow.direction.downward'),
    }),
    [t],
  );

  const columns: ColumnsType<FlowRecord> = useMemo(
    () => [
      {
        title: t('pages.keyArea.flow.columns.site'),
        dataIndex: 'siteName',
        width: 200,
      },
      {
        title: t('pages.keyArea.flow.columns.zoneCode'),
        dataIndex: 'zoneCode',
        width: 180,
      },
      {
        title: t('pages.keyArea.flow.columns.time'),
        dataIndex: 'time',
        width: 180,
      },
      {
        title: t('pages.keyArea.flow.columns.direction'),
        dataIndex: 'direction',
        width: 140,
        render: (value: string) => directionLabelMap[value] ?? value ?? '—',
      },
      {
        title: t('pages.keyArea.flow.columns.forwardFlow'),
        dataIndex: 'forwardFlow',
        width: 160,
        render: (value: number, record) =>
          record.reverseFlow !== undefined && record.reverseFlow !== null
            ? `${value} / ${record.reverseFlow ?? 0}`
            : `${value}`,
      },
      {
        title: t('pages.keyArea.flow.columns.totalFlow'),
        dataIndex: 'totalFlow',
        width: 140,
      },
      {
        title: t('pages.keyArea.flow.columns.threshold'),
        dataIndex: 'threshold',
        width: 140,
      },
      {
        title: t('pages.keyArea.flow.columns.abnormal'),
        dataIndex: 'abnormal',
        width: 120,
        render: (value: boolean) => (
          <Tag color={value ? 'orange' : 'green'}>
            {value
              ? t('pages.keyArea.flow.abnormal.true')
              : t('pages.keyArea.flow.abnormal.false')}
          </Tag>
        ),
      },
      {
        title: t('pages.keyArea.flow.columns.duration'),
        dataIndex: 'duration',
        width: 140,
        render: (value: string | undefined) => value ?? '—',
      },
      {
        title: t('pages.keyArea.flow.columns.suggestion'),
        dataIndex: 'suggestion',
        width: 220,
        render: (value: string | undefined) => value ?? '—',
      },
      {
        title: t('pages.keyArea.flow.columns.device'),
        dataIndex: 'deviceId',
        width: 160,
      },
    ],
    [directionLabelMap, t],
  );

  return (
    <PageContainer header={{ title: t('pages.keyArea.flow.pageTitle') }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.keyArea.flow.stats.totalFlows')}
              value={metrics.totalFlows}
              suffix={personTimesUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.keyArea.flow.stats.abnormalEvents')}
              value={metrics.abnormalEvents}
              suffix={eventUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.keyArea.flow.stats.lastSync')}
              value={metrics.lastSync}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.keyArea.flow.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
      >
        <Table<FlowRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1500 }}
        />
      </Card>
    </PageContainer>
  );
};

export default PedestrianFlow;
