import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { AccountItem, AccountResponse } from '@/services/userManagement';
import { getAccounts } from '@/services/userManagement';

const statusColor: Record<AccountItem['status'], 'success' | 'error'> = {
  启用: 'success',
  禁用: 'error',
};

const Account: React.FC = () => {
  const { data, loading } = useRequest(getAccounts, {
    formatResult: (res: AccountResponse | { data: AccountResponse }) =>
      (res as { data?: AccountResponse })?.data ?? (res as AccountResponse),
  });

  const summary = data?.summary ?? {
    total: 0,
    enabled: 0,
    disabled: 0,
    pendingReset: 0,
  };
  const accounts = data?.accounts ?? [];

  const columns: ColumnsType<AccountItem> = useMemo(
    () => [
      { title: '账号 ID', dataIndex: 'id', width: 140 },
      {
        title: '登录账号',
        dataIndex: 'username',
        width: 160,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '用户实名 / 岗位',
        dataIndex: 'realName',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.position}</div>
          </div>
        ),
      },
      { title: '所属部门', dataIndex: 'department', width: 220 },
      {
        title: '关联角色',
        dataIndex: 'role',
        width: 180,
        render: (value: string) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '联系方式',
        dataIndex: 'phone',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.email}</div>
          </div>
        ),
      },
      {
        title: '账号状态',
        dataIndex: 'status',
        width: 140,
        render: (value: AccountItem['status']) => <Badge status={statusColor[value]} text={value} />,
      },
      { title: '最后登录时间', dataIndex: 'lastLogin', width: 180 },
      { title: '密码更新时间', dataIndex: 'passwordUpdatedAt', width: 180 },
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
            <Statistic title="启用账号" value={summary.enabled} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="禁用账号" value={summary.disabled} suffix="个" valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="待密码重置" value={summary.pendingReset} suffix="个" />
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
          scroll={{ x: 1400 }}
        />
      </Card>
    </PageContainer>
  );
};

export default Account;
