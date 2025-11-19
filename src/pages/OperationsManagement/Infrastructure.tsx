import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, List, Row, Statistic, Table, Tag } from 'antd';
import type { InfrastructureItem, InfrastructureResponse, NetworkLinkItem } from '@/services/operations';
import { getInfrastructureOverview } from '@/services/operations';

const networkStatusColor: Record<InfrastructureItem['networkStatus'], 'success' | 'warning' | 'error'> = {
  正常: 'success',
  关注: 'warning',
  中断: 'error',
};

const linkStatusColor: Record<NetworkLinkItem['status'], 'success' | 'warning' | 'error'> = {
  正常: 'success',
  预警: 'warning',
  中断: 'error',
};

const Infrastructure: React.FC = () => {
  const { data, loading } = useRequest(getInfrastructureOverview, {
    formatResult: (res: InfrastructureResponse | { data: InfrastructureResponse }) =>
      (res as { data?: InfrastructureResponse })?.data ?? (res as InfrastructureResponse),
  });

  const summary = data?.summary ?? {
    regions: 0,
    checkpoints: 0,
    pedestrianZones: 0,
    lampPoles: 0,
    aiNodes: 0,
    gateways: 0,
  };

  const infrastructures = data?.infrastructures ?? [];
  const networkLinks = data?.networkLinks ?? [];

  const columns: ColumnsType<InfrastructureItem> = useMemo(
    () => [
      {
        title: '区域/卡口',
        dataIndex: 'area',
        width: 200,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '类型',
        dataIndex: 'type',
        width: 140,
        render: (value: InfrastructureItem['type']) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '位置',
        dataIndex: 'location',
        width: 240,
      },
      {
        title: '设施配置',
        dataIndex: 'facilities',
        width: 260,
        render: (facilities: InfrastructureItem['facilities']) => (
          <div>
            <div>灯杆 {facilities.lampPoles} · 摄像机 {facilities.cameras}</div>
            <div>AI 节点 {facilities.aiNodes} · 4G 网关 {facilities.gateways}</div>
          </div>
        ),
      },
      {
        title: '网络状态',
        dataIndex: 'networkStatus',
        width: 140,
        render: (value: InfrastructureItem['networkStatus']) => (
          <Badge status={networkStatusColor[value]} text={value} />
        ),
      },
      {
        title: '最近巡检',
        dataIndex: 'lastInspection',
        width: 200,
      },
      {
        title: '责任人',
        dataIndex: 'responsible',
        width: 120,
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '基础设施管理' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="重点区域" value={summary.regions} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="交通卡口" value={summary.checkpoints} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="行人通道" value={summary.pedestrianZones} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="部署灯杆" value={summary.lampPoles} suffix="根" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="AI 节点" value={summary.aiNodes} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="4G 无线网关" value={summary.gateways} suffix="台" />
          </Card>
        </Col>
      </Row>

      <Card title="基础设施清单" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<InfrastructureItem>
          rowKey="id"
          columns={columns}
          dataSource={infrastructures}
          loading={loading}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Card title="骨干链路/网络状态" style={{ marginTop: 24 }}>
        <List
          dataSource={networkLinks}
          renderItem={(link) => (
            <List.Item key={link.id}>
              <List.Item.Meta
                title={link.name}
                description={`时延：${link.latency} · 可用性：${link.availability}`}
              />
              <Badge status={linkStatusColor[link.status]} text={link.status} />
            </List.Item>
          )}
        />
        {!networkLinks.length && <div style={{ textAlign: 'center', padding: 24 }}>暂无网络数据</div>}
      </Card>
    </PageContainer>
  );
};

export default Infrastructure;
