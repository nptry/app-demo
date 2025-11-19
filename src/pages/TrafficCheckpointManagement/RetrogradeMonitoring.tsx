import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { ViolationRecordItem, ViolationResponse } from '@/services/traffic';
import { getRetrogradeViolations } from '@/services/traffic';

const statusColor: Record<ViolationRecordItem['status'], string> = {
  待处置: 'default',
  处理中: 'orange',
  已完成: 'green',
};

const RetrogradeMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getRetrogradeViolations, {
    formatResult: (res: ViolationResponse | { data: ViolationResponse }) =>
      (res as { data?: ViolationResponse })?.data ?? (res as ViolationResponse),
  });

  const metrics = data?.metrics ?? {
    today: 0,
    handled: 0,
    pending: 0,
    avgHandleMins: 0,
  };
  const records = data?.records ?? [];

  const columns: ColumnsType<ViolationRecordItem> = useMemo(
    () => [
      { title: '时间', dataIndex: 'violationTime', width: 160 },
      { title: '卡口', dataIndex: 'checkpoint', width: 200 },
      { title: '车牌', dataIndex: 'plate', width: 140, render: (value: string) => <strong>{value}</strong> },
      { title: '情况说明', dataIndex: 'description', width: 260 },
      { title: '证据', dataIndex: 'evidence', width: 160, render: (value: string) => <a>{value ? '查看' : '无'}</a> },
      { title: '等级', dataIndex: 'level', width: 120, render: (value: ViolationRecordItem['level']) => <Tag color={value === '严重' ? 'red' : 'orange'}>{value}</Tag> },
      { title: '负责人', dataIndex: 'handler', width: 120 },
      { title: '状态', dataIndex: 'status', width: 140, render: (value: ViolationRecordItem['status']) => <Tag color={statusColor[value]}>{value}</Tag> },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '逆行监控' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="逆行事件" value={metrics.today} suffix="起" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="已处置" value={metrics.handled} suffix="起" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="待处理" value={metrics.pending} suffix="起" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="平均处理时长" value={metrics.avgHandleMins} suffix="分钟" />
          </Card>
        </Col>
      </Row>

      <Card title="事件列表" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<ViolationRecordItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </PageContainer>
  );
};

export default RetrogradeMonitoring;
