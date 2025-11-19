import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, List, Row, Statistic, Table } from 'antd';
import type { ChannelInfoItem, ChannelInfoResponse, ChannelMeasureItem } from '@/services/pedestrian';
import { getChannelInfo } from '@/services/pedestrian';

const statusColor: Record<ChannelInfoItem['status'], 'success' | 'warning' | 'processing'> = {
  正常: 'success',
  关注: 'warning',
  维护: 'processing',
};

const ChannelInfo: React.FC = () => {
  const { data, loading } = useRequest(getChannelInfo, {
    formatResult: (res: ChannelInfoResponse | { data: ChannelInfoResponse }) =>
      (res as { data?: ChannelInfoResponse })?.data ?? (res as ChannelInfoResponse),
  });

  const summary = data?.summary ?? {
    totalChannels: 0,
    coveredDistricts: 0,
    aiNodes: 0,
    warningsToday: 0,
  };
  const channels = data?.channels ?? [];
  const measures = data?.measures ?? [];

  const columns: ColumnsType<ChannelInfoItem> = useMemo(
    () => [
      {
        title: '通道名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.location}</div>
          </div>
        ),
      },
      {
        title: '区域',
        dataIndex: 'district',
        width: 160,
      },
      {
        title: '类型',
        dataIndex: 'type',
        width: 140,
      },
      {
        title: '负责人',
        dataIndex: 'manager',
        width: 160,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.contact}</div>
          </div>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        render: (value: ChannelInfoItem['status']) => (
          <Badge status={statusColor[value]} text={value} />
        ),
      },
      {
        title: '描述',
        dataIndex: 'description',
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '通道定位基础信息' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="纳管理通道" value={summary.totalChannels} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="覆盖区县" value={summary.coveredDistricts} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="AI 节点" value={summary.aiNodes} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="今日告警" value={summary.warningsToday} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card title="通道清单" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<ChannelInfoItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={channels}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Card title="管控措施" style={{ marginTop: 24 }}>
        <List
          dataSource={measures}
          renderItem={(item: ChannelMeasureItem) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={item.title}
                description={`负责人：${item.owner} · 时段：${item.window}`}
              />
              <div>{item.detail}</div>
            </List.Item>
          )}
        />
        {!measures.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无管控措施</div>}
      </Card>
    </PageContainer>
  );
};

export default ChannelInfo;
