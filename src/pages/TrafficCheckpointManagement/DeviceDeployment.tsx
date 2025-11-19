import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, List, Row, Statistic, Table, Tag } from 'antd';
import type {
  TrafficDeploymentItem,
  TrafficDeploymentResponse,
  TrafficMaintenanceItem,
} from '@/services/traffic';
import { getTrafficDeployments } from '@/services/traffic';

const statusColor: Record<TrafficDeploymentItem['status'], 'success' | 'processing' | 'error'> = {
  在线: 'success',
  维护: 'processing',
  离线: 'error',
};

const DeviceDeployment: React.FC = () => {
  const { data, loading } = useRequest(getTrafficDeployments, {
    formatResult: (res: TrafficDeploymentResponse | { data: TrafficDeploymentResponse }) =>
      (res as { data?: TrafficDeploymentResponse })?.data ?? (res as TrafficDeploymentResponse),
  });

  const summary = data?.summary ?? [];
  const deployments = data?.deployments ?? [];
  const maintenance = data?.maintenance ?? [];

  const columns: ColumnsType<TrafficDeploymentItem> = useMemo(
    () => [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 240,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '所属卡口',
        dataIndex: 'checkpoint',
        width: 200,
      },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: 160,
        render: (value: string) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '灯杆/编号',
        dataIndex: 'poleCode',
        width: 140,
      },
      {
        title: '安装位置',
        dataIndex: 'installation',
        width: 220,
      },
      {
        title: '网络/供电',
        dataIndex: 'network',
        width: 180,
      },
      {
        title: '算法/服务',
        dataIndex: 'aiModels',
        render: (models: string[]) => (
          <span>
            {models.map((model) => (
              <Tag color="purple" key={model}>
                {model}
              </Tag>
            ))}
          </span>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        render: (value: TrafficDeploymentItem['status']) => (
          <Badge status={statusColor[value]} text={value} />
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '卡口设备部署' }}>
      <Row gutter={[16, 16]}>
        {summary.map((item) => (
          <Col xs={24} sm={12} md={8} key={item.type}>
            <Card bordered={false}>
              <Statistic title={`${item.type}摄像机`} value={item.cameras} suffix="台" />
              <div style={{ marginTop: 8, color: 'rgba(0,0,0,0.65)' }}>AI 节点 {item.aiNodes} 台</div>
              <div style={{ color: 'rgba(0,0,0,0.65)' }}>4G 网关 {item.gateways} 台</div>
            </Card>
          </Col>
        ))}
        {!summary.length && (
          <Col span={24}>
            <Card bordered={false}>暂无部署统计</Card>
          </Col>
        )}
      </Row>

      <Card title="部署列表" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<TrafficDeploymentItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={deployments}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Card title="维保计划" style={{ marginTop: 24 }}>
        <List
          dataSource={maintenance}
          renderItem={(item: TrafficMaintenanceItem) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={`${item.checkpoint} · ${item.action}`}
                description={`计划：${item.schedule} · 负责人：${item.owner}`}
              />
              <Tag
                color={item.status === '完成' ? 'green' : item.status === '执行中' ? 'orange' : 'default'}
              >
                {item.status}
              </Tag>
            </List.Item>
          )}
        />
        {!maintenance.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无维保计划</div>}
      </Card>
    </PageContainer>
  );
};

export default DeviceDeployment;
