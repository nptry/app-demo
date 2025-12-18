import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import { Badge, Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useMemo } from 'react';
import type { AccessRecord, AccessResponse } from '@/services/pedestrian';
import { getAccessRecords } from '@/services/pedestrian';

const AccessRecords: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getAccessRecords, {
    formatResult: (res: AccessResponse | { data: AccessResponse }) =>
      (res as { data?: AccessResponse })?.data ?? (res as AccessResponse),
  });

  const records = data?.records ?? [];
  const abnormalCount = records.filter((record) => record.abnormal).length;

  const recordUnit = t('pages.common.unit.records');
  const columns: ColumnsType<AccessRecord> = useMemo(
    () => [
      {
        title: t('pages.pedestrian.access.columns.channel'),
        dataIndex: 'channelName',
        width: 200,
      },
      {
        title: t('pages.pedestrian.access.columns.time'),
        dataIndex: 'time',
        width: 200,
      },
      {
        title: t('pages.pedestrian.access.columns.anonymousId'),
        dataIndex: 'anonymousId',
        width: 200,
      },
      {
        title: t('pages.pedestrian.access.columns.genderAge'),
        dataIndex: 'gender',
        width: 160,
        render: (value: string, record) =>
          `${value ?? t('pages.common.text.unknown')} / ${
            record.ageRange ?? t('pages.common.text.unknown')
          }`,
      },
      {
        title: t('pages.pedestrian.access.columns.direction'),
        dataIndex: 'direction',
        width: 120,
      },
      {
        title: t('pages.pedestrian.access.columns.belongings'),
        dataIndex: 'belongings',
        width: 180,
      },
      {
        title: t('pages.pedestrian.access.columns.photo'),
        dataIndex: 'photo',
        width: 140,
        render: (value: string) =>
          value ? <a>{t('pages.pedestrian.access.actions.viewPhoto')}</a> : '—',
      },
      {
        title: t('pages.pedestrian.access.columns.abnormal'),
        dataIndex: 'abnormal',
        width: 160,
        render: (value: boolean, record) =>
          value ? (
            <Tag color="orange">
              {record.abnormalReason ??
                t('pages.pedestrian.access.text.abnormal')}
            </Tag>
          ) : (
            <Tag color="green">{t('pages.pedestrian.access.text.normal')}</Tag>
          ),
      },
      {
        title: t('pages.pedestrian.access.columns.alarmStatus'),
        dataIndex: 'alarmStatus',
        width: 180,
        render: (value: string) => {
          if (!value) {
            return <Badge status="default" text="—" />;
          }
          const isProcessing = value.includes('处理中');
          const text = isProcessing
            ? t('pages.pedestrian.access.alarm.processing')
            : value;
          return (
            <Badge
              status={isProcessing ? 'processing' : 'default'}
              text={text}
            />
          );
        },
      },
      {
        title: t('pages.pedestrian.access.columns.remark'),
        dataIndex: 'remark',
        width: 200,
      },
      {
        title: t('pages.pedestrian.access.columns.device'),
        dataIndex: 'deviceId',
        width: 160,
      },
    ],
    [t],
  );

  return (
    <PageContainer header={{ title: t('pages.pedestrian.access.pageTitle') }}>
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 32 }}>
          <Tag color="blue">
            {t('pages.pedestrian.access.summary.total', {
              count: records.length,
              unit: recordUnit,
            })}
          </Tag>
          <Tag color="orange">
            {t('pages.pedestrian.access.summary.abnormal', {
              count: abnormalCount,
              unit: recordUnit,
            })}
          </Tag>
        </div>
      </Card>

      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<AccessRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1700 }}
        />
      </Card>
    </PageContainer>
  );
};

export default AccessRecords;
