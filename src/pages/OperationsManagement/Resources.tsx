import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { ResourceItem, ResourceResponse } from '@/services/operations';
import { getResourceOverview } from '@/services/operations';

const statusTagColor = (status: string) => {
  if (status.includes('任务中') || status.includes('执行')) return 'red';
  if (status.includes('待命')) return 'blue';
  if (status.includes('可用') || status.includes('充足')) return 'green';
  if (status.includes('不足') || status.includes('休假') || status.includes('停用')) return 'orange';
  return 'default';
};

const Resources: React.FC = () => {
  const { data, loading } = useRequest(getResourceOverview, {
    formatResult: (res: ResourceResponse | { data: ResourceResponse }) =>
      (res as { data?: ResourceResponse })?.data ?? (res as ResourceResponse),
  });

  const summary = data?.summary ?? {
    vehicles: 0,
    engineers: 0,
    spareParts: 0,
  };
  const resources = data?.resources ?? [];

  const columns: ColumnsType<ResourceItem> = useMemo(
    () => [
      {
        title: '资源编号',
        dataIndex: 'id',
        width: 140,
      },
      {
        title: '资源类型',
        dataIndex: 'resourceType',
        width: 160,
        render: (value: ResourceItem['resourceType']) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '资源名称',
        dataIndex: 'name',
        width: 200,
        render: (value: string) => <strong>{value}</strong>,
      },
      { title: '所属部门', dataIndex: 'department', width: 200 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 140,
        render: (value: string) => <Tag color={statusTagColor(value)}>{value}</Tag>,
      },
      {
        title: '联系人 / 电话',
        dataIndex: 'contact',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.phone}</div>
          </div>
        ),
      },
      { title: '资源详情', dataIndex: 'detail', width: 240 },
      { title: '最后调度时间', dataIndex: 'lastDispatch', width: 180 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '运维资源管理' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="运维车辆" value={summary.vehicles} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="在册工程师" value={summary.engineers} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="核心备件" value={summary.spareParts} suffix="件" />
          </Card>
        </Col>
      </Row>

      <Card title="资源清单" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<ResourceItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={resources}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </PageContainer>
  );
};

export default Resources;
