import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Progress, Row, Statistic, Table, Tag, Timeline } from 'antd';
import type {
  FaultDistributionItem,
  FaultOrderItem,
  FaultResponse,
  RemoteActionItem,
} from '@/services/operations';
import { getFaultOverview } from '@/services/operations';

const orderStatus: Record<FaultOrderItem['status'], { status: 'processing' | 'warning' | 'success'; text: string }> = {
  待处理: { status: 'warning', text: '待处理' },
  处理中: { status: 'processing', text: '处理中' },
  已恢复: { status: 'success', text: '已恢复' },
};

const levelColor: Record<FaultOrderItem['level'], string> = {
  高: 'red',
  中: 'orange',
  低: 'blue',
};

const channelColor: Record<FaultOrderItem['channel'], string> = {
  远程: 'purple',
  现场: 'green',
};

const Fault: React.FC = () => {
  const { data, loading } = useRequest(getFaultOverview, {
    formatResult: (res: FaultResponse | { data: FaultResponse }) =>
      (res as { data?: FaultResponse })?.data ?? (res as FaultResponse),
  });

  const overview = data?.overview ?? {
    todayAlarms: 0,
    openOrders: 0,
    avgResponseMins: 0,
    avgRecoveryHours: 0,
  };

  const orders = data?.orders ?? [];
  const remoteActions = data?.remoteActions ?? [];
  const distribution = data?.distribution ?? [];

  const columns: ColumnsType<FaultOrderItem> = useMemo(
    () => [
      {
        title: '工单编号',
        dataIndex: 'id',
        width: 200,
      },
      {
        title: '故障标题',
        dataIndex: 'title',
        width: 200,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '涉及设备',
        dataIndex: 'device',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.location}</div>
          </div>
        ),
      },
      {
        title: '故障类型',
        dataIndex: 'faultType',
        width: 140,
      },
      {
        title: '等级',
        dataIndex: 'level',
        width: 100,
        render: (value: FaultOrderItem['level']) => <Tag color={levelColor[value]}>{value}</Tag>,
      },
      {
        title: '处置通道',
        dataIndex: 'channel',
        width: 100,
        render: (value: FaultOrderItem['channel']) => <Tag color={channelColor[value]}>{value}</Tag>,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        render: (value: FaultOrderItem['status']) => (
          <Badge status={orderStatus[value].status} text={orderStatus[value].text} />
        ),
      },
      {
        title: '负责人',
        dataIndex: 'assignedTo',
        width: 120,
      },
      {
        title: '上报时间',
        dataIndex: 'reportedAt',
        width: 160,
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '故障管理（故障工单）' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="今日告警" value={overview.todayAlarms} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="待处理工单" value={overview.openOrders} suffix="单" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="平均响应时长" value={overview.avgResponseMins} suffix="分钟" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="平均恢复时长" value={overview.avgRecoveryHours} suffix="小时" precision={1} />
          </Card>
        </Col>
      </Row>

      <Card title="故障工单列表" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<FaultOrderItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={orders}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="故障类型分布">
            {distribution.map((item: FaultDistributionItem) => (
              <div key={item.category} style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 8 }}>{item.category} · {item.count} 起</div>
                <Progress percent={item.proportion} strokeColor="#faad14" />
              </div>
            ))}
            {!distribution.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无统计数据</div>}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="远程运维记录" bodyStyle={{ paddingTop: 16 }}>
            <Timeline
              items={remoteActions.map((action: RemoteActionItem) => ({
                color: action.action === '远程检测' ? 'blue' : action.action === '远程维护' ? 'green' : 'purple',
                children: (
                  <div>
                    <div style={{ fontWeight: 600 }}>{action.device}</div>
                    <div style={{ color: 'rgba(0,0,0,0.65)' }}>{action.action} · {action.time}</div>
                    <div style={{ marginTop: 4 }}>{action.detail}</div>
                    <div style={{ fontSize: 12, marginTop: 4, color: 'rgba(0,0,0,0.65)' }}>
                      结果：{action.result}
                    </div>
                  </div>
                ),
              }))}
            />
            {!remoteActions.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无远程记录</div>}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Fault;
