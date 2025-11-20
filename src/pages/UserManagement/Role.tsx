import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { RoleItem, RoleResponse } from '@/services/userManagement';
import { getRoles } from '@/services/userManagement';

const statusColor: Record<RoleItem['status'], string> = {
  启用: 'green',
  禁用: 'red',
};

const Role: React.FC = () => {
  const { data, loading } = useRequest(getRoles, {
    formatResult: (res: RoleResponse | { data: RoleResponse }) =>
      (res as { data?: RoleResponse })?.data ?? (res as RoleResponse),
  });

  const summary = data?.summary ?? {
    total: 0,
    enabled: 0,
    disabled: 0,
    departments: 0,
  };
  const roles = data?.roles ?? [];

  const columns: ColumnsType<RoleItem> = useMemo(
    () => [
      { title: '角色 ID', dataIndex: 'id', width: 140 },
      {
        title: '角色名称',
        dataIndex: 'name',
        width: 200,
        render: (value: string) => <strong>{value}</strong>,
      },
      { title: '所属部门', dataIndex: 'department', width: 200 },
      {
        title: '关联权限列表',
        dataIndex: 'permissions',
        render: (permissions: string[]) =>
          permissions.map((item) => (
            <Tag key={item} color="purple" style={{ marginBottom: 4 }}>
              {item}
            </Tag>
          )),
      },
      {
        title: '角色状态',
        dataIndex: 'status',
        width: 120,
        render: (value: RoleItem['status']) => <Tag color={statusColor[value]}>{value}</Tag>,
      },
      { title: '创建时间', dataIndex: 'createdAt', width: 180 },
      { title: '角色描述', dataIndex: 'description' },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '角色管理' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="角色总数" value={summary.total} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="启用角色" value={summary.enabled} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="禁用角色" value={summary.disabled} suffix="个" valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="覆盖部门" value={summary.departments} suffix="个" />
          </Card>
        </Col>
      </Row>

      <Card title="角色列表" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<RoleItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={roles}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </PageContainer>
  );
};

export default Role;
