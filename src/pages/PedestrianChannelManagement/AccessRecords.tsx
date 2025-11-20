import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Table, Tag } from 'antd';
import type { AccessRecord, AccessResponse } from '@/services/pedestrian';
import { getAccessRecords } from '@/services/pedestrian';

const AccessRecords: React.FC = () => {
  const { data, loading } = useRequest(getAccessRecords, {
    formatResult: (res: AccessResponse | { data: AccessResponse }) =>
      (res as { data?: AccessResponse })?.data ?? (res as AccessResponse),
  });

  const records = data?.records ?? [];
  const abnormalCount = records.filter((record) => record.abnormal).length;

  const columns: ColumnsType<AccessRecord> = useMemo(
    () => [
      { title: '通道', dataIndex: 'channelName', width: 200 },
      { title: '通行时间', dataIndex: 'time', width: 200 },
      { title: '匿名编号', dataIndex: 'anonymousId', width: 200 },
      { title: '性别/年龄', dataIndex: 'gender', width: 160, render: (value: string, record) => `${value} / ${record.ageRange}` },
      { title: '方向', dataIndex: 'direction', width: 120 },
      { title: '携带物品', dataIndex: 'belongings', width: 180 },
      { title: '照片', dataIndex: 'photo', width: 140, render: (value: string) => <a>{value ? '查看' : '—'}</a> },
      {
        title: '异常通行',
        dataIndex: 'abnormal',
        width: 160,
        render: (value: boolean, record) =>
          value ? <Tag color="orange">{record.abnormalReason ?? '异常'}</Tag> : <Tag color="green">正常</Tag>,
      },
      { title: '告警状态', dataIndex: 'alarmStatus', width: 180, render: (value: string) => <Badge status={value.includes('处理中') ? 'processing' : 'default'} text={value} /> },
      { title: '备注', dataIndex: 'remark', width: 200 },
      { title: '识别设备', dataIndex: 'deviceId', width: 160 },
      { title: '识别准确率', dataIndex: 'accuracy', width: 140, render: (value: number) => `${(value * 100).toFixed(0)}%` },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '通行记录' }}>
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 32 }}>
          <Tag color="blue">总记录 {records.length} 条</Tag>
          <Tag color="orange">异常 {abnormalCount} 条</Tag>
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
