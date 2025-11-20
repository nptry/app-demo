import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  message,
} from 'antd';
import type { AccountItem, AccountResponse } from '@/services/userManagement';
import { getAccounts } from '@/services/userManagement';

const statusColor: Record<AccountItem['status'], 'success' | 'error'> = {
  启用: 'success',
  禁用: 'error',
};

type FilterState = {
  keyword: string;
  status: AccountItem['status'] | 'all';
  department: string | 'all';
};

const statusOptions: AccountItem['status'][] = ['启用', '禁用'];

const Account: React.FC = () => {
  const { data, loading } = useRequest(getAccounts, {
    formatResult: (res: AccountResponse | { data: AccountResponse }) =>
      (res as { data?: AccountResponse })?.data ?? (res as AccountResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', status: 'all', department: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AccountItem | null>(null);
  const [form] = Form.useForm<AccountItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.accounts && !initialized) {
      setAccounts(data.accounts);
      setInitialized(true);
    }
  }, [data?.accounts, initialized]);

  const summary = useMemo(() => {
    if (accounts.length) {
      return {
        total: accounts.length,
        enabled: accounts.filter((item) => item.status === '启用').length,
        disabled: accounts.filter((item) => item.status === '禁用').length,
        pendingReset: accounts.filter((item) => item.passwordUpdatedAt === '').length,
      };
    }
    return (
      data?.summary ?? {
        total: 0,
        enabled: 0,
        disabled: 0,
        pendingReset: 0,
      }
    );
  }, [accounts, data?.summary]);

  const departmentOptions = useMemo(() => {
    const source = accounts.length ? accounts : data?.accounts ?? [];
    return Array.from(new Set(source.map((item) => item.department)));
  }, [accounts, data?.accounts]);

  const filteredAccounts = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return accounts.filter((item) => {
      const matchKeyword = keyword
        ? [item.username, item.realName, item.department, item.role]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      const matchDept = filters.department === 'all' || item.department === filters.department;
      return matchKeyword && matchStatus && matchDept;
    });
  }, [accounts, filters.department, filters.keyword, filters.status]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        status: (values.status ?? 'all') as FilterState['status'],
        department: (values.department ?? 'all') as FilterState['department'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', status: 'all', department: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: '启用',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: AccountItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setAccounts((prev) => prev.map((item) => (item.id === editingRecord.id ? values : item)));
      message.success('账号已更新');
    } else {
      const newItem: AccountItem = {
        ...values,
        id: values.id?.trim() ? values.id : `ACC-${Date.now()}`,
      };
      setAccounts((prev) => [newItem, ...prev]);
      message.success('新建账号成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => setModalVisible(false), []);

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
      {
        title: '操作',
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该账号？" okText="确认" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete, handleEdit],
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

      <Card
        title="账号列表"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建账号
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', status: 'all', department: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input allowClear placeholder="搜索账号 / 姓名 / 角色" style={{ width: 260 }} />
          </Form.Item>
          <Form.Item name="department">
            <Select
              style={{ width: 200 }}
              options={[{ value: 'all', label: '全部部门' }, ...departmentOptions.map((dept) => ({ label: dept, value: dept }))]}
              placeholder="请选择部门"
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 160 }}
              options={[{ value: 'all', label: '全部状态' }, ...statusOptions.map((status) => ({ label: status, value: status }))]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<AccountItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredAccounts}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑账号' : '新建账号'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={760}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item label="账号 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item label="账号 ID" name="id">
              <Input placeholder="不填写自动生成" />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="登录账号" name="username" rules={[{ required: true, message: '请输入登录账号' }]}>
                <Input placeholder="请输入登录账号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="真实姓名" name="realName" rules={[{ required: true, message: '请输入真实姓名' }]}>
                <Input placeholder="请输入真实姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="所属部门" name="department" rules={[{ required: true, message: '请输入部门' }]}>
                <Input placeholder="请输入所属部门" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="岗位" name="position" rules={[{ required: true, message: '请输入岗位' }]}>
                <Input placeholder="请输入岗位" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="关联角色" name="role" rules={[{ required: true, message: '请输入关联角色' }]}>
                <Input placeholder="请输入关联角色" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="账号状态" name="status" rules={[{ required: true, message: '请选择账号状态' }]}>
                <Select options={statusOptions.map((status) => ({ label: status, value: status }))} placeholder="请选择状态" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="联系电话" name="phone" rules={[{ required: true, message: '请输入联系电话' }]}>
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="最后登录时间" name="lastLogin">
                <Input placeholder="示例：2024-08-01 09:30" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="密码更新时间" name="passwordUpdatedAt">
                <Input placeholder="示例：2024-07-01 10:00" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Account;
