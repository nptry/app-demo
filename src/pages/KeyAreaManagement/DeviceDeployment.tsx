import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, List, Row, Statistic, Table, Tag } from 'antd';
import type {
  DeploymentDeviceItem,
  KeyAreaDeploymentResponse,
  MaintenancePlanItem,
} from '@/services/keyArea';
import { getKeyAreaDeployments } from '@/services/keyArea';

const statusColor: Record<DeploymentDeviceItem['status'], 'success' | 'processing' | 'error'> = {
  在线: 'success',
  维护: 'processing',
  离线: 'error',
};

const DeviceDeployment: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaDeployments, {
    formatResult: (res: KeyAreaDeploymentResponse | { data: KeyAreaDeploymentResponse }) =>
      (res as { data?: KeyAreaDeploymentResponse })?.data ?? (res as KeyAreaDeploymentResponse),
  });

  const summary = data?.summary ?? [];
  const deployments = data?.deployments ?? [];
  const maintenancePlans = data?.maintenancePlans ?? [];

  const columns: ColumnsType<DeploymentDeviceItem> = useMemo(
    () => [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '所属场所',
        dataIndex: 'areaName',
        width: 200,
      },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: 150,
        render: (value: string) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '灯杆/节点',
        dataIndex: 'poleCode',
        width: 140,
      },
      {
        title: '安装位置',
        dataIndex: 'location',
        width: 240,
      },
      {
        title: '坐标',
        dataIndex: 'coordinates',
        width: 160,
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
        render: (value: DeploymentDeviceItem['status']) => (
          <Badge status={statusColor[value]} text={value} />
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '设备部署管理' }}>
      <Row gutter={[16, 16]}>
        {summary.map((item) => (
          <Col xs={24} sm={12} md={8} key={item.type}>
            <Card bordered={false}>
              <Statistic title={`${item.type}摄像机`} value={item.cameras} suffix="台" />
              <div style={{ marginTop: 8, color: 'rgba(0,0,0,0.65)' }}>AI 节点 {item.aiNodes} 台</div>
              <div style={{ color: 'rgba(0,0,0,0.65)' }}>4G 网关 {item.gateways} 台</div>
              <div style={{ marginTop: 8 }}>覆盖：{item.coverage}</div>
            </Card>
          </Col>
        ))}
        {!summary.length && (
          <Col span={24}>
            <Card bordered={false}>暂无部署统计数据</Card>
          </Col>
        )}
      </Row>

      <Card title="设备部署列表" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<DeploymentDeviceItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={deployments}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Card title="维保/升级计划" style={{ marginTop: 24 }}>
        <List
          dataSource={maintenancePlans}
          renderItem={(plan: MaintenancePlanItem) => (
            <List.Item key={plan.id}>
              <List.Item.Meta
                title={`${plan.areaName} · ${plan.action}`}
                description={
                  <div>
                    <div>计划窗口：{plan.window}</div>
                    <div>负责人：{plan.owner}</div>
                  </div>
                }
              />
              <Tag
                color={plan.status === '完成' ? 'green' : plan.status === '执行中' ? 'orange' : 'default'}
              >
                {plan.status}
              </Tag>
            </List.Item>
          )}
        />
        {!maintenancePlans.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无计划</div>}
      </Card>
    </PageContainer>
  );
};

export default DeviceDeployment;
