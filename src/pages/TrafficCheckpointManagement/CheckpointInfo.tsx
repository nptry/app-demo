import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { CheckpointInfoItem, TrafficCheckpointResponse } from '@/services/traffic';
import { getTrafficCheckpoints } from '@/services/traffic';

const statusColor: Record<CheckpointInfoItem['status'], 'success' | 'default'> = {
  启用: 'success',
  禁用: 'default',
};

const CheckpointInfo: React.FC = () => {
  const { data, loading } = useRequest(getTrafficCheckpoints, {
    formatResult: (res: TrafficCheckpointResponse | { data: TrafficCheckpointResponse }) =>
      (res as { data?: TrafficCheckpointResponse })?.data ?? (res as TrafficCheckpointResponse),
  });

  const summary = data?.summary ?? {
    total: 0,
    enabled: 0,
    laneCount: 0,
  };
  const checkpoints = data?.checkpoints ?? [];

  const columns: ColumnsType<CheckpointInfoItem> = useMemo(
    () => [
      { title: '卡口 ID', dataIndex: 'id', width: 140 },
      {
        title: '卡口名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.address}</div>
          </div>
        ),
      },
      {
        title: '卡口类型',
        dataIndex: 'checkpointTypes',
        width: 240,
        render: (types: string[]) => types.map((type) => (
            <Tag key={type} color="blue" style={{ marginBottom: 4 }}>
              {type}
            </Tag>
          )),
      },
      { title: '所属区域', dataIndex: 'region', width: 200 },
      { title: '经纬度', dataIndex: 'coordinates', width: 180 },
      {
        title: '车道数量 / 描述',
        dataIndex: 'laneCount',
        width: 220,
        render: (value: number, record) => (
          <div>
            <div>车道：{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.laneDescription}</div>
          </div>
        ),
      },
      { title: '限速（km/h）', dataIndex: 'speedLimit', width: 140 },
      {
        title: '负责人',
        dataIndex: 'manager',
        width: 160,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.phone}</div>
          </div>
        ),
      },
      { title: '卡口状态', dataIndex: 'status', width: 140, render: (value: CheckpointInfoItem['status']) => <Badge status={statusColor[value]} text={value} /> },
      { title: '电子地图/平面图', dataIndex: 'mapFile', width: 200 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '卡口基础信息' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="纳管卡口" value={summary.total} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="已启用" value={summary.enabled} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="覆盖车道" value={summary.laneCount} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card title="卡口清单" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<CheckpointInfoItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={checkpoints}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>
    </PageContainer>
  );
};

export default CheckpointInfo;
