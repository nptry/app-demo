import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Table, Tag } from 'antd';
import type { CompanionRecord, CompanionResponse } from '@/services/pedestrian';
import { getStrangerRecords } from '@/services/pedestrian';

const CompanionMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getStrangerRecords, {
    formatResult: (res: CompanionResponse | { data: CompanionResponse }) =>
      (res as { data?: CompanionResponse })?.data ?? (res as CompanionResponse),
  });

  const records = data?.records ?? [];

  const columns: ColumnsType<CompanionRecord> = useMemo(
    () => [
      { title: '重点人员', dataIndex: 'keyPersonName', width: 180 },
      { title: '捕获通道', dataIndex: 'captureChannelName', width: 220 },
      { title: '捕获时间', dataIndex: 'captureTime', width: 200 },
      {
        title: '同行人员数量',
        dataIndex: 'companionCount',
        width: 160,
        render: (value: number) => <Tag color="blue">{value} 人</Tag>,
      },
      {
        title: '随行明细',
        dataIndex: 'list',
        width: 300,
        render: (list: CompanionRecord['list']) =>
          list.map((item) => `${item.id}:${item.gender}/${item.ageRange}/${item.appearance}`).join('；'),
      },
      { title: '行为描述', dataIndex: 'behavior', width: 220 },
      {
        title: '是否重点关注',
        dataIndex: 'focus',
        width: 160,
        render: (value: boolean, record) =>
          value ? <Tag color="orange">{record.reason ?? '关注'}</Tag> : <Tag>否</Tag>,
      },
      { title: '轨迹关联结果', dataIndex: 'linkResult', width: 240 },
      { title: '处置备注', dataIndex: 'remark', width: 200 },
      { title: '识别设备', dataIndex: 'deviceId', width: 160 },
      { title: '识别准确率', dataIndex: 'accuracy', width: 160, render: (value: number) => `${(value * 100).toFixed(0)}%` },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '同行人员监测' }}>
      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<CompanionRecord>
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

export default CompanionMonitoring;
