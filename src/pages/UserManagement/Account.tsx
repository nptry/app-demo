import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import {
  Button,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tooltip,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  type AdminItem,
  type AdminParams,
  type AdminQueryParams,
  createAdmin,
  deleteAdmin,
  getAdmins,
  resetAdminPassword,
  updateAdmin,
} from '@/services/api/admin';
import { getRoles, type RoleItem } from '@/services/api/role';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 15,
  total: 0,
};

const AccountPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [modalVisible, setModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增管理员');
  const [editingAdmin, setEditingAdmin] = useState<AdminItem | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminItem | null>(null);
  const formRef = useRef<FormInstance<AdminParams>>(null);
  const resetFormRef = useRef<FormInstance>(null);

  const currentAdmin = useMemo(() => {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem('current_admin');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  const isSuperAdmin = !!currentAdmin?.is_super_admin;

  const fetchAdmins = async (params: AdminQueryParams = {}) => {
    setLoading(true);
    try {
      const response = await getAdmins({
        page: params.page ?? pagination.current,
        per_page: params.per_page ?? pagination.pageSize,
        ...params,
      });

      if (response?.records) {
        setAdmins(response.records);
        setPagination((prev) => ({
          ...prev,
          current: params.page ?? prev.current,
          pageSize: params.per_page ?? prev.pageSize,
          total: response.total ?? prev.total,
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getRoles({ per_page: 100 });
      setRoles(response?.records ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const handleTableChange = (pageInfo: TablePaginationConfig) => {
    fetchAdmins({
      page: pageInfo.current ?? 1,
      per_page: pageInfo.pageSize ?? DEFAULT_PAGINATION.pageSize,
    });
  };

  const handleAdd = () => {
    setEditingAdmin(null);
    setModalTitle('新增管理员');
    setModalVisible(true);
    formRef.current?.resetFields();
  };

  const handleEdit = (record: AdminItem) => {
    setEditingAdmin(record);
    setModalTitle('编辑管理员');
    setModalVisible(true);

    setTimeout(() => {
      formRef.current?.setFieldsValue({
        username: record.username,
        mobile: record.mobile,
        role_id: roles.find((role) => role.name === record.role_name)?.id,
      });
    }, 0);
  };

  const openResetPassword = (record: AdminItem) => {
    setResetTarget(record);
    setResetModalVisible(true);
    setTimeout(() => resetFormRef.current?.resetFields(), 0);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAdmin(id);
      message.success('删除成功');
      fetchAdmins({
        page: pagination.current,
        per_page: pagination.pageSize,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await formRef.current?.validateFields();
      if (!values) return;

      if (editingAdmin) {
        const payload = { ...values };
        if (editingAdmin.is_super_admin) {
          delete payload.role_id;
        }
        await updateAdmin(editingAdmin.id, payload);
        message.success('管理员已更新');
      } else {
        await createAdmin(values);
        message.success('管理员已创建');
      }

      setModalVisible(false);
      fetchAdmins({
        page: pagination.current,
        per_page: pagination.pageSize,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleResetPassword = async () => {
    try {
      const values = await resetFormRef.current?.validateFields();
      if (!resetTarget || !values) return;

      const payload: any = {
        id: resetTarget.id,
        new_password: values.new_password,
        new_password_confirmation: values.new_password_confirmation,
      };

      if (values.old_password) {
        payload.old_password = values.old_password;
      }

      await resetAdminPassword(payload);
      message.success('密码重置成功');
      setResetModalVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getNonSuperAdminRoles = () =>
    roles.filter((role) => !role.is_super_admin);

  const columns: ColumnsType<AdminItem> = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
    },
    {
      title: '角色',
      dataIndex: 'role_name',
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="编辑">
            <a onClick={() => handleEdit(record)}>
              <EditOutlined />
            </a>
          </Tooltip>
          {isSuperAdmin && (
            <Tooltip title="重置密码">
              <a onClick={() => openResetPassword(record)}>
                <KeyOutlined />
              </a>
            </Tooltip>
          )}
          {!record.is_super_admin && (
            <Tooltip title="删除">
              <Popconfirm
                title="确定删除此管理员吗？"
                okText="确定"
                cancelText="取消"
                onConfirm={() => handleDelete(record.id)}
              >
                <a>
                  <DeleteOutlined style={{ color: '#ff4d4f' }} />
                </a>
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '管理员账号管理' }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增管理员
        </Button>
      </div>
      <Table<AdminItem>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={admins}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '15', '20', '50', '100'],
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        destroyOnClose
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form layout="vertical" ref={formRef}>
          {!editingAdmin?.is_super_admin && (
            <Form.Item
              name="role_id"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select
                placeholder="请选择角色"
                options={getNonSuperAdminRoles().map((role) => ({
                  label: role.name,
                  value: role.id,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="mobile"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^\d{11}$/, message: '请输入11位手机号码' },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          {!editingAdmin && (
            <>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Form.Item
                name="password_confirmation"
                label="确认密码"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请确认密码" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <Modal
        title={resetTarget ? `重置密码：${resetTarget.username}` : '重置密码'}
        open={resetModalVisible}
        destroyOnClose
        onOk={handleResetPassword}
        onCancel={() => setResetModalVisible(false)}
      >
        <Form layout="vertical" ref={resetFormRef}>
          <Form.Item label="用户名">
            <Input value={resetTarget?.username} disabled />
          </Form.Item>
          {!isSuperAdmin && (
            <Form.Item
              name="old_password"
              label="旧密码"
              rules={[{ required: true, message: '请输入旧密码' }]}
            >
              <Input.Password placeholder="请输入旧密码" />
            </Form.Item>
          )}
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '新密码长度不能少于6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="new_password_confirmation"
            label="确认新密码"
            dependencies={['new_password']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的新密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AccountPage;
