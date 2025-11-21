import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { KeyPersonRecord, KeyPersonResponse } from '@/services/pedestrian';
import { getChannelWatch } from '@/services/pedestrian';

const KeyPersonnelMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getChannelWatch, {
    formatResult: (res: KeyPersonResponse | { data: KeyPersonResponse }) =>
      (res as { data?: KeyPersonResponse })?.data ?? (res as KeyPersonResponse),
  });

  const records = data?.records ?? [];
  const alarmCount = records.filter((record) => record.alarmStatus.includes('处理中')).length;

  const columns: ColumnsType<KeyPersonRecord> = useMemo(
    () => [
      { title: '通道', dataIndex: 'channelName', width: 200 },
      {
        title: '重点人员',
        dataIndex: 'personName',
        width: 200,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.personType}</div>
          </div>
        ),
      },
      { title: '捕获时间', dataIndex: 'captureTime', width: 200 },
      { title: '行为描述', dataIndex: 'behavior', width: 220 },
      {
        title: '是否有同行人员',
        dataIndex: 'withCompanion',
        width: 160,
        render: (value: boolean, record) =>
          value ? <Tag color="orange">是 · {record.companionCount ?? 0} 人</Tag> : <Tag>否</Tag>,
      },
      {
        title: '告警状态',
        dataIndex: 'alarmStatus',
        width: 200,
        render: (value: string) => <Badge status={value.includes('处理中') ? 'processing' : value.includes('已处理') ? 'success' : 'default'} text={value} />,
      },
      {
        title: '推送渠道',
        dataIndex: 'alarmChannels',
        width: 200,
        render: (value: string[]) => value.map((channel) => (
            <Tag key={channel} color="blue" style={{ marginBottom: 4 }}>
              {channel}
            </Tag>
          )),
      },
      { title: '告警接收人', dataIndex: 'receiver', width: 160 },
      { title: '识别设备', dataIndex: 'deviceId', width: 160 },
      { title: '识别准确率', dataIndex: 'accuracy', width: 140, render: (value: number) => `${(value * 100).toFixed(0)}%` },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '重点人员监控' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="记录条数" value={records.length} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="告警处理中" value={alarmCount} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card title="重点人员记录" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<KeyPersonRecord>
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

export default KeyPersonnelMonitoring;
