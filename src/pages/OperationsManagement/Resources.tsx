import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, List, Row, Statistic, Table, Tag } from 'antd';
import type { DispatchPlanItem, EngineerItem, ResourceAssetItem, ResourceResponse, ResourceSummary } from '@/services/operations';
import { getResourceOverview } from '@/services/operations';

const engineerStatus: Record<EngineerItem['status'], { color: string; text: string }> = {
  执行任务: { color: 'red', text: '执行任务' },
  待命: { color: 'green', text: '待命' },
  休整: { color: 'default', text: '休整' },
};

const dispatchStatus: Record<DispatchPlanItem['status'], 'processing' | 'success' | 'default'> = {
  待命: 'default',
  执行中: 'processing',
  已完成: 'success',
};

const Resources: React.FC = () => {
  const { data, loading } = useRequest(getResourceOverview, {
    formatResult: (res: ResourceResponse | { data: ResourceResponse }) =>
      (res as { data?: ResourceResponse })?.data ?? (res as ResourceResponse),
  });

  const summary: ResourceSummary =
    data?.summary ?? ({ teams: 0, engineers: 0, vehicles: 0, spareParts: 0 } as ResourceSummary);

  const engineers = data?.engineers ?? [];
  const assets = data?.assets ?? [];
  const dispatchPlans = data?.dispatchPlans ?? [];

  const engineerColumns: ColumnsType<EngineerItem> = useMemo(
    () => [
      {
        title: '姓名',
        dataIndex: 'name',
        width: 120,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '所属班组',
        dataIndex: 'team',
        width: 200,
      },
      {
        title: '专长',
        dataIndex: 'specialty',
        width: 220,
      },
      {
        title: '班次',
        dataIndex: 'shift',
        width: 100,
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
        width: 160,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        render: (value: EngineerItem['status']) => (
          <Tag color={engineerStatus[value].color}>{engineerStatus[value].text}</Tag>
        ),
      },
    ],
    [],
  );

  const assetColumns: ColumnsType<ResourceAssetItem> = useMemo(
    () => [
      {
        title: '类别',
        dataIndex: 'type',
        width: 120,
        render: (value: ResourceAssetItem['type']) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '名称',
        dataIndex: 'name',
        width: 180,
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        width: 80,
        align: 'center',
      },
      {
        title: '所在位置',
        dataIndex: 'location',
        width: 200,
      },
      {
        title: '可用情况',
        dataIndex: 'availability',
        render: (value: string) => value,
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '运维资源管理' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="运维班组" value={summary.teams} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="在册工程师" value={summary.engineers} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="运维车辆" value={summary.vehicles} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="备件合计" value={summary.spareParts} suffix="件" />
          </Card>
        </Col>
      </Row>

      <Card title="工程师排布" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<EngineerItem>
          rowKey="id"
          loading={loading}
          columns={engineerColumns}
          dataSource={engineers}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={14}>
          <Card title="资产/备件池" bodyStyle={{ paddingTop: 8 }}>
            <Table<ResourceAssetItem>
              rowKey="id"
              size="small"
              columns={assetColumns}
              dataSource={assets}
              pagination={false}
              scroll={{ x: 900 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card title="出动计划">
            <List
              dataSource={dispatchPlans}
              renderItem={(plan) => (
                <List.Item key={plan.id}>
                  <List.Item.Meta
                    title={plan.target}
                    description={
                      <div>
                        <div>时间窗口：{plan.window}</div>
                        <div>作业范围：{plan.scope}</div>
                        <div>负责人：{plan.leader}</div>
                      </div>
                    }
                  />
                  <Badge status={dispatchStatus[plan.status]} text={plan.status} />
                </List.Item>
              )}
            />
            {!dispatchPlans.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无出动计划</div>}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Resources;
