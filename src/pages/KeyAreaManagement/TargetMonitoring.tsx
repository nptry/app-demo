import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import { Badge, Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useMemo } from 'react';
import type { KeyAreaTargetResponse, TargetRecord } from '@/services/keyArea';
import { getKeyAreaTargets } from '@/services/keyArea';

const TargetMonitoring: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getKeyAreaTargets, {
    formatResult: (
      res: KeyAreaTargetResponse | { data: KeyAreaTargetResponse },
    ) =>
      (res as { data?: KeyAreaTargetResponse })?.data ??
      (res as KeyAreaTargetResponse),
  });

  const metrics = data?.metrics ?? {
    watchlistCount: 0,
    hitsToday: 0,
    activeAlarms: 0,
    lastPush: '--',
  };
  const records = data?.records ?? [];
  const watchlistUnit = t('pages.keyArea.target.unit.people');
  const hitUnit = t('pages.keyArea.target.unit.times');
  const recordUnit = t('pages.common.unit.records');

  const columns: ColumnsType<TargetRecord> = useMemo(
    () => [
      {
        title: t('pages.keyArea.target.columns.site'),
        dataIndex: 'siteName',
        width: 200,
      },
      {
        title: t('pages.keyArea.target.columns.zoneCode'),
        dataIndex: 'zoneCode',
        width: 180,
      },
      {
        title: t('pages.keyArea.target.columns.person'),
        dataIndex: 'personName',
        width: 180,
        render: (value: string, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.personType ?? t('pages.common.text.unknown')}
            </div>
          </div>
        ),
      },
      {
        title: t('pages.keyArea.target.columns.matchTime'),
        dataIndex: 'time',
        width: 180,
      },
      {
        title: t('pages.keyArea.target.columns.alarmStatus'),
        dataIndex: 'alarm',
        width: 180,
        render: (alarm: TargetRecord['alarm']) => (
          <div>
            <Badge
              status={alarm.triggered ? 'error' : 'default'}
              text={
                alarm.triggered
                  ? (alarm.status ?? t('pages.keyArea.target.alarm.triggered'))
                  : t('pages.keyArea.target.alarm.notTriggered')
              }
            />
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              {alarm.receiver ?? '—'}
            </div>
          </div>
        ),
      },
      {
        title: t('pages.keyArea.target.columns.channels'),
        dataIndex: ['alarm', 'channels'],
        width: 200,
        render: (value: string[] | undefined) =>
          value
            ? value.map((channel) => <Tag key={channel}>{channel}</Tag>)
            : '—',
      },
      {
        title: t('pages.keyArea.target.columns.device'),
        dataIndex: 'deviceId',
        width: 160,
      },
    ],
    [t],
  );

  return (
    <PageContainer header={{ title: t('pages.keyArea.target.pageTitle') }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.keyArea.target.stats.watchlist')}
              value={metrics.watchlistCount}
              suffix={watchlistUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.keyArea.target.stats.hitsToday')}
              value={metrics.hitsToday}
              suffix={hitUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.keyArea.target.stats.activeAlarms')}
              value={metrics.activeAlarms}
              suffix={recordUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.keyArea.target.stats.lastPush')}
              value={metrics.lastPush}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.keyArea.target.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
      >
        <Table<TargetRecord>
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

export default TargetMonitoring;
