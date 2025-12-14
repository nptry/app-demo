import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { RoleItem, RoleResponse } from '@/services/userManagement';
import { getRoles } from '@/services/userManagement';

const statusColor: Record<RoleItem['status'], string> = {
  启用: 'green',
  禁用: 'red',
};

type FilterState = {
  keyword: string;
  status: RoleItem['status'] | 'all';
};

const statusOptions: RoleItem['status'][] = ['启用', '禁用'];

const Role: React.FC = () => {
  const { data, loading } = useRequest(getRoles, {
    formatResult: (res: RoleResponse | { data: RoleResponse }) =>
      (res as { data?: RoleResponse })?.data ?? (res as RoleResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    status: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RoleItem | null>(null);
  const [form] = Form.useForm<RoleItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.roles && !initialized) {
      setRoles(data.roles);
      setInitialized(true);
    }
  }, [data?.roles, initialized]);

  const summary = useMemo(() => {
    if (roles.length) {
      const departmentSet = new Set(roles.map((item) => item.department));
      return {
        total: roles.length,
        enabled: roles.filter((item) => item.status === '启用').length,
        disabled: roles.filter((item) => item.status === '禁用').length,
        departments: departmentSet.size,
      };
    }
    return (
      data?.summary ?? {
        total: 0,
        enabled: 0,
        disabled: 0,
        departments: 0,
      }
    );
  }, [data?.summary, roles]);

  const filteredRoles = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return roles.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.department, item.description]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchStatus =
        filters.status === 'all' || item.status === filters.status;
      return matchKeyword && matchStatus;
    });
  }, [filters.keyword, filters.status, roles]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        status: (values.status ?? 'all') as FilterState['status'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', status: 'all' });
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
    (record: RoleItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback((id: string) => {
    setRoles((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    const permissions = values.permissions ?? [];
    if (editingRecord) {
      setRoles((prev) =>
        prev.map((item) =>
          item.id === editingRecord.id ? { ...values, permissions } : item,
        ),
      );
      message.success('角色已更新');
    } else {
      const newItem: RoleItem = {
        ...values,
        permissions,
        id: values.id?.trim() ? values.id : `ROLE-${Date.now()}`,
      };
      setRoles((prev) => [newItem, ...prev]);
      message.success('新建角色成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => setModalVisible(false), []);

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
        render: (value: RoleItem['status']) => (
          <Tag color={statusColor[value]}>{value}</Tag>
        ),
      },
      { title: '创建时间', dataIndex: 'createdAt', width: 180 },
      { title: '角色描述', dataIndex: 'description' },
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
            <Popconfirm
              title="确认删除该角色？"
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(record.id)}
            >
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
    <PageContainer header={{ title: '角色管理' }}>
      <Card
        title="角色列表"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建角色
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', status: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder="搜索角色 / 部门 / 描述"
              style={{ width: 260 }}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 160 }}
              options={[
                { value: 'all', label: '全部状态' },
                ...statusOptions.map((status) => ({
                  label: status,
                  value: status,
                })),
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<RoleItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredRoles}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑角色' : '新建角色'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={760}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item label="角色 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item label="角色 ID" name="id">
              <Input placeholder="不填写自动生成" />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="角色名称"
                name="name"
                rules={[{ required: true, message: '请输入角色名称' }]}
              >
                <Input placeholder="请输入角色名称" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="关联权限列表"
            name="permissions"
            rules={[{ required: true, message: '请输入关联权限' }]}
          >
            <Select
              mode="tags"
              placeholder="输入或选择关联权限"
              options={Array.from(
                new Set(roles.flatMap((item) => item.permissions)),
              ).map((perm) => ({
                label: perm,
                value: perm,
              }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="角色状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select
                  options={statusOptions.map((status) => ({
                    label: status,
                    value: status,
                  }))}
                  placeholder="请选择状态"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="角色描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入角色描述或职责范围" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Role;
