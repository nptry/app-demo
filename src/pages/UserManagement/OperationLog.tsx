import React from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Table } from 'antd';
import type { OperationLogItem, OperationLogResponse } from '@/services/userManagement';
import { getOperationLogs } from '@/services/userManagement';

const OperationLog: React.FC = () => {
  const { data, loading } = useRequest(getOperationLogs, {
    formatResult: (res: OperationLogResponse | { data: OperationLogResponse }) =>
      (res as { data?: OperationLogResponse })?.data ?? (res as OperationLogResponse),
  });

  const logs = data?.logs ?? [];

  const columns: ColumnsType<OperationLogItem> = [
    { title: '时间', dataIndex: 'timestamp', width: 180 },
    { title: '操作人', dataIndex: 'operator', width: 160 },
    { title: '账号', dataIndex: 'account', width: 140 },
    { title: '操作内容', dataIndex: 'action', width: 160 },
    { title: '对象', dataIndex: 'target', width: 160 },
    { title: '来源 IP', dataIndex: 'ip', width: 140 },
    { title: '结果', dataIndex: 'result', width: 120, render: (value: OperationLogItem['result']) => (
      <Badge status={value === '成功' ? 'success' : 'error'} text={value} />
    ) },
  ];

  return (
    <PageContainer header={{ title: '操作日志' }}>
      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<OperationLogItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={logs}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1000 }}
        />
        {!logs.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无日志</div>}
      </Card>
    </PageContainer>
  );
};

export default OperationLog;
