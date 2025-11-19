import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, List, Row, Statistic, Table, Tag } from 'antd';
import type {
  CheckpointInfoItem,
  CheckpointTaskItem,
  TrafficCheckpointResponse,
} from '@/services/traffic';
import { getTrafficCheckpoints } from '@/services/traffic';

const statusColor: Record<CheckpointInfoItem['status'], 'success' | 'warning' | 'error'> = {
  正常: 'success',
  关注: 'warning',
  中断: 'error',
};

const CheckpointInfo: React.FC = () => {
  const { data, loading } = useRequest(getTrafficCheckpoints, {
    formatResult: (res: TrafficCheckpointResponse | { data: TrafficCheckpointResponse }) =>
      (res as { data?: TrafficCheckpointResponse })?.data ?? (res as TrafficCheckpointResponse),
  });

  const summary = data?.summary ?? {
    total: 0,
    monitored: 0,
    aiNodes: 0,
    warnings24h: 0,
  };

  const checkpoints = data?.checkpoints ?? [];
  const tasks = data?.tasks ?? [];

  const columns: ColumnsType<CheckpointInfoItem> = useMemo(
    () => [
      {
        title: '卡口名称',
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
        title: '所属区域',
        dataIndex: 'district',
        width: 140,
      },
      {
        title: '覆盖道路',
        dataIndex: 'coverageRoads',
        width: 220,
      },
      {
        title: '类型',
        dataIndex: 'types',
        width: 220,
        render: (types: string[]) => (
          <span>
            {types.map((type) => (
              <Tag color="blue" key={type}>
                {type}
              </Tag>
            ))}
          </span>
        ),
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
        render: (value: CheckpointInfoItem['status']) => (
          <Badge status={statusColor[value]} text={value} />
        ),
      },
      {
        title: '说明',
        dataIndex: 'description',
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '卡口基础信息' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="纳管卡口" value={summary.total} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="实时在线" value={summary.monitored} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="AI 边缘节点" value={summary.aiNodes} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="24h 告警" value={summary.warnings24h} suffix="条" />
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
          scroll={{ x: 1300 }}
        />
      </Card>

      <Card title="重点保障任务" style={{ marginTop: 24 }}>
        <List
          dataSource={tasks}
          renderItem={(task: CheckpointTaskItem) => (
            <List.Item key={task.id}>
              <List.Item.Meta
                title={task.title}
                description={
                  <div>
                    <div>{task.detail}</div>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                      时间：{task.window} · 负责人：{task.owner}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        {!tasks.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无保障任务</div>}
      </Card>
    </PageContainer>
  );
};

export default CheckpointInfo;
