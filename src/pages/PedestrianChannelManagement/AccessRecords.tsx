import React from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Statistic, Table } from 'antd';
import type { AccessRecord, AccessResponse } from '@/services/pedestrian';
import { getAccessRecords } from '@/services/pedestrian';

const AccessRecords: React.FC = () => {
  const { data, loading } = useRequest(getAccessRecords, {
    formatResult: (res: AccessResponse | { data: AccessResponse }) =>
      (res as { data?: AccessResponse })?.data ?? (res as AccessResponse),
  });

  const total = data?.total ?? 0;
  const records = data?.records ?? [];

  const columns: ColumnsType<AccessRecord> = [
    { title: '时间', dataIndex: 'time', width: 180 },
    { title: '通道', dataIndex: 'channelName', width: 220 },
    { title: '人员', dataIndex: 'personName', width: 200 },
    { title: '凭证', dataIndex: 'credential', width: 160 },
    { title: '方向', dataIndex: 'direction', width: 120 },
  ];

  return (
    <PageContainer header={{ title: '通行记录' }}>
      <Card bordered={false}>
        <Statistic title="今日累计通行" value={total} suffix="人次" />
      </Card>

      <Card title="记录明细" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<AccessRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 900 }}
        />
        {!records.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无记录</div>}
      </Card>
    </PageContainer>
  );
};

export default AccessRecords;
