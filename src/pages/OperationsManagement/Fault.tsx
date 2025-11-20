import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { FaultOrderItem, FaultResponse } from '@/services/operations';
import { getFaultOverview } from '@/services/operations';

const levelColor: Record<FaultOrderItem['level'], string> = {
  '紧急（1 小时）': 'red',
  '重要（4 小时）': 'orange',
  '一般（24 小时）': 'blue',
};

const statusMap: Record<
  FaultOrderItem['status'],
  { status: 'processing' | 'warning' | 'success' | 'default' | 'error'; text: string }
> = {
  待派单: { status: 'default', text: '待派单' },
  待处理: { status: 'warning', text: '待处理' },
  处理中: { status: 'processing', text: '处理中' },
  已解决: { status: 'success', text: '已解决' },
  '无法解决（需升级）': { status: 'error', text: '需升级' },
};

const Fault: React.FC = () => {
  const { data, loading } = useRequest(getFaultOverview, {
    formatResult: (res: FaultResponse | { data: FaultResponse }) =>
      (res as { data?: FaultResponse })?.data ?? (res as FaultResponse),
  });

  const stats = data?.stats ?? {
    todayFaults: 0,
    inProgress: 0,
    waiting: 0,
  };
  const orders = data?.orders ?? [];

  const columns: ColumnsType<FaultOrderItem> = useMemo(
    () => [
      { title: '工单 ID', dataIndex: 'id', width: 180 },
      {
        title: '关联设备',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>ID：{record.deviceId}</div>
          </div>
        ),
      },
      { title: '故障类型', dataIndex: 'faultType', width: 160 },
      { title: '故障描述', dataIndex: 'description', width: 260 },
      {
        title: '等级',
        dataIndex: 'level',
        width: 160,
        render: (value: FaultOrderItem['level']) => <Tag color={levelColor[value]}>{value}</Tag>,
      },
      {
        title: '处理状态',
        dataIndex: 'status',
        width: 140,
        render: (value: FaultOrderItem['status']) => {
          const map = statusMap[value];
          return map ? <Badge status={map.status} text={map.text} /> : value;
        },
      },
      { title: '派单时间', dataIndex: 'dispatchTime', width: 180 },
      { title: '运维负责人', dataIndex: 'owner', width: 140 },
      { title: '处理方案', dataIndex: 'solution', width: 260 },
      { title: '完成时间', dataIndex: 'finishTime', width: 180 },
      { title: '处理结果', dataIndex: 'result', width: 160 },
      { title: '备注', dataIndex: 'remark' },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '故障管理（故障工单）' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="今日故障" value={stats.todayFaults} suffix="起" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="处理中工单" value={stats.inProgress} suffix="单" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="待派单/待处理" value={stats.waiting} suffix="单" />
          </Card>
        </Col>
      </Row>

      <Card title="故障工单列表" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<FaultOrderItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={orders}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1500 }}
        />
      </Card>
    </PageContainer>
  );
};

export default Fault;
