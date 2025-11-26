import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Table, Tag } from 'antd';
import type { RetrogradeRecord } from '@/services/traffic';
import { getRetrogradeViolations } from '@/services/traffic';

const RetrogradeMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getRetrogradeViolations, {
    formatResult: (res: RetrogradeRecord[] | { data: RetrogradeRecord[] }) =>
      (res as { data?: RetrogradeRecord[] })?.data ?? (res as RetrogradeRecord[]),
  });

  const records = data ?? [];

  const columns: ColumnsType<RetrogradeRecord> = useMemo(
    () => [
      { title: '车道', dataIndex: 'lane', width: 180 },
      { title: '逆行时间', dataIndex: 'violationTime', width: 200 },
      {
        title: '告警状态',
        dataIndex: 'alarmStatus',
        width: 200,
        render: (value: string) => <Tag color={value.includes('拦截') ? 'orange' : 'blue'}>{value}</Tag>,
      },
      { title: '处置说明', dataIndex: 'remark', width: 220 },
      { title: '证据', dataIndex: 'photos', width: 200, render: (value: string[]) => (value.length ? <a>照片({value.length})/视频</a> : '—') },
      { title: '识别设备', dataIndex: 'deviceId', width: 160 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '逆行监控' }}>
      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<RetrogradeRecord>
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

export default RetrogradeMonitoring;
