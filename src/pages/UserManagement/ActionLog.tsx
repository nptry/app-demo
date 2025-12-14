import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Badge, Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import type {
  ActionLogItem,
  ActionLogResponse,
} from '@/services/userManagement';
import { getActionLogs } from '@/services/userManagement';

const ActionLog: React.FC = () => {
  const { data, loading } = useRequest(getActionLogs, {
    formatResult: (res: ActionLogResponse | { data: ActionLogResponse }) =>
      (res as { data?: ActionLogResponse })?.data ?? (res as ActionLogResponse),
  });

  const logs = data?.logs ?? [];

  const columns: ColumnsType<ActionLogItem> = [
    { title: '日志 ID', dataIndex: 'id', width: 160 },
    { title: '操作时间', dataIndex: 'time', width: 180 },
    {
      title: '操作账号 / 实名',
      dataIndex: 'account',
      width: 200,
      render: (value: string, record) => (
        <div>
          <div>{value}</div>
          <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
            {record.realName}
          </div>
        </div>
      ),
    },
    {
      title: '操作模块',
      dataIndex: 'module',
      width: 200,
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    { title: '操作类型', dataIndex: 'actionType', width: 140 },
    { title: '操作内容', dataIndex: 'content', width: 260 },
    { title: '来源 IP', dataIndex: 'ip', width: 160 },
    {
      title: '操作结果',
      dataIndex: 'result',
      width: 140,
      render: (value: ActionLogItem['result']) => (
        <Badge status={value === '成功' ? 'success' : 'error'} text={value} />
      ),
    },
    {
      title: '失败原因',
      dataIndex: 'failReason',
      width: 200,
      render: (value: string | undefined, record) =>
        record.result === '失败' ? (value ?? '—') : '—',
    },
  ];

  return (
    <PageContainer header={{ title: '行为日志' }}>
      <Card title="行为日志记录" bodyStyle={{ paddingTop: 8 }}>
        <Table<ActionLogItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={logs}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1400 }}
        />
        {!logs.length && (
          <div style={{ textAlign: 'center', padding: 16 }}>暂无日志</div>
        )}
      </Card>
    </PageContainer>
  );
};

export default ActionLog;
