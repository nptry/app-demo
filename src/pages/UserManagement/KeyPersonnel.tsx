import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { KeyPersonItem, KeyPersonResponse } from '@/services/userManagement';
import { getKeyPersons } from '@/services/userManagement';

const statusColor: Record<KeyPersonItem['status'], string> = {
  在岗: 'green',
  请假: 'orange',
  停用: 'red',
};

const KeyPersonnel: React.FC = () => {
  const { data, loading } = useRequest(getKeyPersons, {
    formatResult: (res: KeyPersonResponse | { data: KeyPersonResponse }) =>
      (res as { data?: KeyPersonResponse })?.data ?? (res as KeyPersonResponse),
  });

  const summary = {
    total: data?.total ?? 0,
    onDuty: data?.onDuty ?? 0,
    backup: data?.backup ?? 0,
  };
  const persons = data?.persons ?? [];

  const columns: ColumnsType<KeyPersonItem> = useMemo(
    () => [
      { title: '姓名', dataIndex: 'name', width: 160, render: (value: string) => <strong>{value}</strong> },
      { title: '角色', dataIndex: 'role', width: 180, render: (value: string) => <Tag color="blue">{value}</Tag> },
      { title: '负责区域', dataIndex: 'region', width: 220 },
      { title: '联系方式', dataIndex: 'phone', width: 200, render: (value: string, record) => (
        <div>
          <div>{value}</div>
          <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.email}</div>
        </div>
      ) },
      { title: '权限', dataIndex: 'permissions', render: (permissions: string[]) => (
        <span>
          {permissions.map((permission) => (
            <Tag color="purple" key={permission}>
              {permission}
            </Tag>
          ))}
        </span>
      ) },
      { title: '状态', dataIndex: 'status', width: 120, render: (value: KeyPersonItem['status']) => <Tag color={statusColor[value]}>{value}</Tag> },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '重点人员管理' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="重点岗位" value={summary.total} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="在岗" value={summary.onDuty} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="备份/外协" value={summary.backup} suffix="人" />
          </Card>
        </Col>
      </Row>

      <Card title="重点岗位人员" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<KeyPersonItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={persons}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1300 }}
        />
      </Card>
    </PageContainer>
  );
};

export default KeyPersonnel;
