import React from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { StrangerRecord, StrangerResponse } from '@/services/pedestrian';
import { getStrangerRecords } from '@/services/pedestrian';

const statusColor: Record<StrangerRecord['status'], string> = {
  已通知: 'orange',
  已确认: 'green',
  待处理: 'default',
};

const StrangerMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getStrangerRecords, {
    formatResult: (res: StrangerResponse | { data: StrangerResponse }) =>
      (res as { data?: StrangerResponse })?.data ?? (res as StrangerResponse),
  });

  const metrics = data?.metrics ?? {
    today: 0,
    highRisk: 0,
    followUp: 0,
  };
  const records = data?.records ?? [];

  const columns: ColumnsType<StrangerRecord> = [
    { title: '时间', dataIndex: 'captureTime', width: 180 },
    { title: '通道', dataIndex: 'channelName', width: 220 },
    { title: '情况描述', dataIndex: 'description' },
    { title: '证据', dataIndex: 'evidence', width: 160, render: (value: string) => <a>{value ? '查看' : '无'}</a> },
    { title: '状态', dataIndex: 'status', width: 140, render: (value: StrangerRecord['status']) => <Tag color={statusColor[value]}>{value}</Tag> },
  ];

  return (
    <PageContainer header={{ title: '陌生人监控' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="陌生人告警" value={metrics.today} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="高风险" value={metrics.highRisk} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="跟进中" value={metrics.followUp} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card title="记录清单" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<StrangerRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1000 }}
        />
        {!records.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无记录</div>}
      </Card>
    </PageContainer>
  );
};

export default StrangerMonitoring;
