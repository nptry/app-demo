import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, List, Row, Statistic, Table, Tag } from 'antd';
import type { PermissionItem, PermissionResponse } from '@/services/userManagement';
import { getPermissions } from '@/services/userManagement';

const typeColor: Record<PermissionItem['type'], string> = {
  管理权限: 'orange',
  使用权限: 'blue',
};

const statusColor: Record<PermissionItem['status'], string> = {
  启用: 'green',
  禁用: 'red',
};

const Permission: React.FC = () => {
  const { data, loading } = useRequest(getPermissions, {
    formatResult: (res: PermissionResponse | { data: PermissionResponse }) =>
      (res as { data?: PermissionResponse })?.data ?? (res as PermissionResponse),
  });

  const summary = data?.summary ?? {
    total: 0,
    management: 0,
    usage: 0,
    disabled: 0,
  };
  const permissions = data?.permissions ?? [];

  const columns: ColumnsType<PermissionItem> = useMemo(
    () => [
      { title: '权限 ID', dataIndex: 'id', width: 140 },
      {
        title: '权限名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '权限类型',
        dataIndex: 'type',
        width: 140,
        render: (value: PermissionItem['type']) => (
          <Tag color={typeColor[value]}>{value}</Tag>
        ),
      },
      {
        title: '关联功能模块',
        dataIndex: 'modules',
        render: (modules: string[]) =>
          modules.map((module) => (
            <Tag color="purple" key={module} style={{ marginBottom: 4 }}>
              {module}
            </Tag>
          )),
      },
      {
        title: '权限状态',
        dataIndex: 'status',
        width: 120,
        render: (value: PermissionItem['status']) => (
          <Tag color={statusColor[value]}>{value}</Tag>
        ),
      },
      { title: '创建时间', dataIndex: 'createdAt', width: 180 },
      { title: '最后修改人', dataIndex: 'updatedBy', width: 160 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '权限配置' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="权限总数" value={summary.total} suffix="项" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="管理权限" value={summary.management} suffix="项" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="使用权限" value={summary.usage} suffix="项" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="禁用权限" value={summary.disabled} suffix="项" valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
      </Row>

      <Card title="权限列表" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<PermissionItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={permissions}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Card title="权限快照" style={{ marginTop: 24 }}>
        <List
          loading={loading}
          dataSource={permissions}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={
                  <span>
                    {item.name}
                    <Tag color={typeColor[item.type]} style={{ marginLeft: 8 }}>
                      {item.type}
                    </Tag>
                  </span>
                }
                description={
                  <span>
                    权限 ID：{item.id} · 创建时间：{item.createdAt}
                  </span>
                }
              />
              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: 8 }}>
                  {item.modules.map((module) => (
                    <Tag key={module} color="purple">
                      {module}
                    </Tag>
                  ))}
                </div>
                <Tag color={statusColor[item.status]}>{item.status}</Tag>
                <span style={{ marginLeft: 12, color: 'rgba(0,0,0,0.45)' }}>负责人：{item.updatedBy}</span>
              </div>
            </List.Item>
          )}
        />
        {!permissions.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无权限数据</div>}
      </Card>
    </PageContainer>
  );
};

export default Permission;
