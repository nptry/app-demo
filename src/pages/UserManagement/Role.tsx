import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Statistic, Table, Tag } from 'antd';
import type { RoleItem, RoleResponse } from '@/services/userManagement';
import { getRoles } from '@/services/userManagement';

const typeColor: Record<RoleItem['type'], string> = {
  管理: 'blue',
  运维: 'orange',
  业务: 'green',
};

const Role: React.FC = () => {
  const { data, loading } = useRequest(getRoles, {
    formatResult: (res: RoleResponse | { data: RoleResponse }) =>
      (res as { data?: RoleResponse })?.data ?? (res as RoleResponse),
  });

  const total = data?.total ?? 0;
  const roles = data?.roles ?? [];

  const columns: ColumnsType<RoleItem> = useMemo(
    () => [
      { title: '角色名称', dataIndex: 'name', width: 200, render: (value: string) => <strong>{value}</strong> },
      { title: '类型', dataIndex: 'type', width: 120, render: (value: RoleItem['type']) => <Tag color={typeColor[value]}>{value}</Tag> },
      { title: '权限范围', dataIndex: 'scope', width: 260, render: (scope: string[]) => (
        <span>
          {scope.map((item) => (
            <Tag color="purple" key={item}>
              {item}
            </Tag>
          ))}
        </span>
      ) },
      { title: '成员数', dataIndex: 'members', width: 120 },
      { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
      { title: '描述', dataIndex: 'description' },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '角色管理' }}>
      <Card bordered={false}>
        <Statistic title="预置角色" value={total} suffix="个" />
      </Card>

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
