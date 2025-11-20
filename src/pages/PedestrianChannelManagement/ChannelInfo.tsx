import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table } from 'antd';
import type { ChannelInfoItem, ChannelInfoResponse } from '@/services/pedestrian';
import { getChannelInfo } from '@/services/pedestrian';

const statusColor: Record<ChannelInfoItem['status'], 'success' | 'default'> = {
  启用: 'success',
  禁用: 'default',
};

const ChannelInfo: React.FC = () => {
  const { data, loading } = useRequest(getChannelInfo, {
    formatResult: (res: ChannelInfoResponse | { data: ChannelInfoResponse }) =>
      (res as { data?: ChannelInfoResponse })?.data ?? (res as ChannelInfoResponse),
  });

  const summary = data?.summary ?? {
    total: 0,
    enabled: 0,
    widthMeters: 0,
  };
  const channels = data?.channels ?? [];

  const columns: ColumnsType<ChannelInfoItem> = useMemo(
    () => [
      { title: '通道 ID', dataIndex: 'id', width: 140 },
      {
        title: '通道名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.address}</div>
          </div>
        ),
      },
      { title: '通道类型', dataIndex: 'channelType', width: 160 },
      { title: '所属区域', dataIndex: 'region', width: 200 },
      { title: '宽度 (m)', dataIndex: 'width', width: 120 },
      { title: '经纬度', dataIndex: 'coordinates', width: 200 },
      {
        title: '负责人',
        dataIndex: 'manager',
        width: 180,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.phone}</div>
          </div>
        ),
      },
      { title: '通道状态', dataIndex: 'status', width: 140, render: (value: ChannelInfoItem['status']) => <Badge status={statusColor[value]} text={value} /> },
      { title: '电子地图', dataIndex: 'mapFile', width: 200 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '通道定位基础信息' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="纳管理通道" value={summary.total} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="启用通道" value={summary.enabled} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="通道宽度合计" value={summary.widthMeters} suffix="m" />
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
          scroll={{ x: 1500 }}
        />
      </Card>
    </PageContainer>
  );
};

export default ChannelInfo;
