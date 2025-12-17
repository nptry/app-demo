import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import { Badge, Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useMemo } from 'react';
import type { RedLightRecord } from '@/services/traffic';
import { getRedLightViolations } from '@/services/traffic';

const RedLightMonitoring: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getRedLightViolations, {
    formatResult: (res: RedLightRecord[] | { data: RedLightRecord[] }) =>
      (res as { data?: RedLightRecord[] })?.data ?? (res as RedLightRecord[]),
  });

  const records = data ?? [];

  const columns: ColumnsType<RedLightRecord> = useMemo(
    () => [
      {
        title: t('pages.redLightMonitoring.columns.lane'),
        dataIndex: 'lane',
        width: 180,
      },
      {
        title: t('pages.redLightMonitoring.columns.violationTime'),
        dataIndex: 'violationTime',
        width: 200,
      },
      {
        title: t('pages.redLightMonitoring.columns.alarmStatus'),
        dataIndex: 'alarm',
        width: 200,
        render: (alarm: RedLightRecord['alarm']) => (
          <div>
            <Badge
              status={alarm.triggered ? 'error' : 'default'}
              text={
                alarm.status ??
                t('pages.redLightMonitoring.text.alarmUntriggered')
              }
            />
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              {alarm.receiver ?? '—'}
            </div>
          </div>
        ),
      },
      {
        title: t('pages.redLightMonitoring.columns.evidence'),
        dataIndex: 'photos',
        width: 200,
        render: (_: string[], record) => (
          <div>
            <a style={{ marginRight: 8 }}>
              {t('pages.redLightMonitoring.text.photoWithCount', {
                count: record.photos.length,
              })}
            </a>
            <a>{t('pages.redLightMonitoring.text.video')}</a>
          </div>
        ),
      },
      {
        title: t('pages.redLightMonitoring.columns.device'),
        dataIndex: 'deviceId',
        width: 160,
      },
    ],
    [t],
  );

  return (
    <PageContainer header={{ title: t('pages.redLightMonitoring.pageTitle') }}>
      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<RedLightRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>
    </PageContainer>
  );
};

export default RedLightMonitoring;
