import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Modal,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  PermissionItem,
  PermissionResponse,
} from '@/services/userManagement';
import { getPermissions } from '@/services/userManagement';

const typeColor: Record<PermissionItem['type'], string> = {
  管理权限: 'orange',
  使用权限: 'blue',
};

type FilterState = {
  keyword: string;
  type: PermissionItem['type'] | 'all';
};

const typeOptions: PermissionItem['type'][] = ['管理权限', '使用权限'];

const Permission: React.FC = () => {
  const { data, loading } = useRequest(getPermissions, {
    formatResult: (res: PermissionResponse | { data: PermissionResponse }) =>
      (res as { data?: PermissionResponse })?.data ??
      (res as PermissionResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    type: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PermissionItem | null>(
    null,
  );
  const [form] = Form.useForm<PermissionItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.permissions && !initialized) {
      setPermissions(data.permissions);
      setInitialized(true);
    }
  }, [data?.permissions, initialized]);

  const filteredPermissions = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return permissions.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, ...(item.modules ?? [])]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchType = filters.type === 'all' || item.type === filters.type;
      return matchKeyword && matchType;
    });
  }, [filters.keyword, filters.type, permissions]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        type: (values.type ?? 'all') as FilterState['type'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', type: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      type: '管理权限',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: PermissionItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback((id: string) => {
    setPermissions((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    const modules = values.modules?.length ? values.modules : [];
    if (editingRecord) {
      setPermissions((prev) =>
        prev.map((item) =>
          item.id === editingRecord.id ? { ...values, modules } : item,
        ),
      );
      message.success('权限已更新');
    } else {
      const newItem: PermissionItem = {
        ...values,
        modules,
        id: values.id?.trim() ? values.id : `PERM-${Date.now()}`,
      };
      setPermissions((prev) => [newItem, ...prev]);
      message.success('新增权限成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => setModalVisible(false), []);

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
              title="确认删除该权限？"
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
    <PageContainer header={{ title: '权限配置' }}>
      <Card
        title="权限列表"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建权限
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', type: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder="搜索名称 / 模块 / 负责人"
              style={{ width: 260 }}
            />
          </Form.Item>
          <Form.Item name="type">
            <Select
              style={{ width: 180 }}
              options={[
                { value: 'all', label: '全部类型' },
                ...typeOptions.map((type) => ({ label: type, value: type })),
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<PermissionItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredPermissions}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑权限' : '新建权限'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={720}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="权限名称"
            name="name"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="权限类型"
                name="type"
                rules={[{ required: true, message: '请选择权限类型' }]}
              >
                <Select
                  options={typeOptions.map((type) => ({
                    label: type,
                    value: type,
                  }))}
                  placeholder="请选择类型"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="关联功能模块"
            name="modules"
            rules={[{ required: true, message: '请选择关联模块' }]}
          >
            <Select
              mode="tags"
              placeholder="输入或选择功能模块"
              options={Array.from(
                new Set(permissions.flatMap((item) => item.modules)),
              ).map((module) => ({
                label: module,
                value: module,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Permission;
