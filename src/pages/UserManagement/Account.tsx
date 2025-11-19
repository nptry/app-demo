import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { AccountItem, AccountResponse } from '@/services/userManagement';
import { getAccounts } from '@/services/userManagement';

const statusColor: Record<AccountItem['status'], 'success' | 'warning' | 'error'> = {
  启用: 'success',
  待激活: 'warning',
  禁用: 'error',
};

const Account: React.FC = () => {
  const { data, loading } = useRequest(getAccounts, {
    formatResult: (res: AccountResponse | { data: AccountResponse }) =>
      (res as { data?: AccountResponse })?.data ?? (res as AccountResponse),
  });

  const summary = data?.summary ?? {
    total: 0,
    active: 0,
    pending: 0,
    locked: 0,
  };
  const accounts = data?.accounts ?? [];

  const columns: ColumnsType<AccountItem> = useMemo(
    () => [
      {
        title: '账号',
        dataIndex: 'username',
        width: 160,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '姓名/岗位',
        dataIndex: 'realName',
        width: 200,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.position}</div>
          </div>
        ),
      },
      {
        title: '所属部门',
        dataIndex: 'dept',
        width: 200,
      },
      {
        title: '角色',
        dataIndex: 'role',
        width: 160,
        render: (value: string) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '联系方式',
        dataIndex: 'phone',
        width: 200,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.email}</div>
          </div>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        render: (value: AccountItem['status']) => (
          <Badge status={statusColor[value]} text={value} />
        ),
      },
      {
        title: '最近登录',
        dataIndex: 'lastLogin',
        width: 180,
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '账号管理' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="账号总数" value={summary.total} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="启用" value={summary.active} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="待激活" value={summary.pending} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="已禁用" value={summary.locked} suffix="个" />
          </Card>
        </Col>
      </Row>

      <Card title="账号列表" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<AccountItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={accounts}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1300 }}
        />
      </Card>
    </PageContainer>
  );
};

export default Account;
