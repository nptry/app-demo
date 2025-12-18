import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import { Badge, Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useMemo } from 'react';
import type {
  ActionLogItem,
  ActionLogResponse,
} from '@/services/userManagement';
import { getActionLogs } from '@/services/userManagement';

const ActionLog: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getActionLogs, {
    formatResult: (res: ActionLogResponse | { data: ActionLogResponse }) =>
      (res as { data?: ActionLogResponse })?.data ?? (res as ActionLogResponse),
  });

  const logs = data?.logs ?? [];
  const resultLabelMap = useMemo(
    () => ({
      成功: t('pages.userManagement.actionLog.result.success'),
      失败: t('pages.userManagement.actionLog.result.failed'),
    }),
    [t],
  );

  const columns: ColumnsType<ActionLogItem> = useMemo(
    () => [
      {
        title: t('pages.userManagement.actionLog.columns.id'),
        dataIndex: 'id',
        width: 160,
      },
      {
        title: t('pages.userManagement.actionLog.columns.time'),
        dataIndex: 'time',
        width: 180,
      },
      {
        title: t('pages.userManagement.actionLog.columns.account'),
        dataIndex: 'account',
        width: 200,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.realName ?? t('pages.common.text.none')}
            </div>
          </div>
        ),
      },
      {
        title: t('pages.userManagement.actionLog.columns.module'),
        dataIndex: 'module',
        width: 200,
        render: (value: string) => (
          <Tag color="blue">{value ?? t('pages.common.text.none')}</Tag>
        ),
      },
      {
        title: t('pages.userManagement.actionLog.columns.actionType'),
        dataIndex: 'actionType',
        width: 140,
        render: (value: string | undefined) =>
          value ?? t('pages.common.text.none'),
      },
      {
        title: t('pages.userManagement.actionLog.columns.content'),
        dataIndex: 'content',
        width: 260,
        render: (value: string | undefined) =>
          value ?? t('pages.common.text.none'),
      },
      {
        title: t('pages.userManagement.actionLog.columns.ip'),
        dataIndex: 'ip',
        width: 160,
        render: (value: string | undefined) =>
          value ?? t('pages.common.text.none'),
      },
      {
        title: t('pages.userManagement.actionLog.columns.result'),
        dataIndex: 'result',
        width: 140,
        render: (value: ActionLogItem['result']) => (
          <Badge
            status={value === '成功' ? 'success' : 'error'}
            text={resultLabelMap[value] ?? value}
          />
        ),
      },
      {
        title: t('pages.userManagement.actionLog.columns.failReason'),
        dataIndex: 'failReason',
        width: 200,
        render: (value: string | undefined, record) =>
          record.result === '失败'
            ? (value ?? t('pages.common.text.none'))
            : t('pages.common.text.none'),
      },
    ],
    [resultLabelMap, t],
  );

  return (
    <PageContainer
      header={{ title: t('pages.userManagement.actionLog.pageTitle') }}
    >
      <Card
        title={t('pages.userManagement.actionLog.card.title')}
        bodyStyle={{ paddingTop: 8 }}
      >
        <Table<ActionLogItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={logs}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1400 }}
        />
        {!logs.length && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            {t('pages.userManagement.actionLog.empty')}
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default ActionLog;
