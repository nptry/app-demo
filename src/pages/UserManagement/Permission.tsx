import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, List, Row, Statistic, Table, Tag } from 'antd';
import type { PermissionItem, PermissionResponse } from '@/services/userManagement';
import { getPermissions } from '@/services/userManagement';

const Permission: React.FC = () => {
  const { data, loading } = useRequest(getPermissions, {
    formatResult: (res: PermissionResponse | { data: PermissionResponse }) =>
      (res as { data?: PermissionResponse })?.data ?? (res as PermissionResponse),
  });

  const summary = data?.summary ?? {
    totalPermissions: 0,
    modules: 0,
    sensitive: 0,
  };
  const permissions = data?.permissions ?? [];

  const columns: ColumnsType<PermissionItem> = useMemo(
    () => [
      { title: '模块', dataIndex: 'module', width: 200 },
      { title: '权限说明', dataIndex: 'description', width: 260 },
      {
        title: '操作范围',
        dataIndex: 'scope',
        render: (scope: string[]) => (
          <span>
            {scope.map((item) => (
              <Tag key={item} color="blue">
                {item}
              </Tag>
            ))}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '权限配置' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="权限总数" value={summary.totalPermissions} suffix="项" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="业务模块" value={summary.modules} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="敏感操作" value={summary.sensitive} suffix="项" />
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
        />
      </Card>

      <Card title="角色覆盖情况" style={{ marginTop: 24 }}>
        <List
          dataSource={permissions}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={item.module}
                description={item.description}
              />
              <div>
                {item.assignedRoles.map((role) => (
                  <Tag key={role} color="purple">
                    {role}
                  </Tag>
                ))}
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
