import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [modalVisible, setModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
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
    setModalVisible(true);
    formRef.current?.resetFields();
  };

  const handleEdit = (record: AdminItem) => {
    setEditingAdmin(record);
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
      message.success(t('pages.common.messages.deleteSuccess'));
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
        message.success(
          t('pages.userManagement.account.messages.updateSuccess'),
        );
      } else {
        await createAdmin(values);
        message.success(
          t('pages.userManagement.account.messages.createSuccess'),
        );
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
      message.success(t('pages.userManagement.account.messages.resetSuccess'));
      setResetModalVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getNonSuperAdminRoles = () =>
    roles.filter((role) => !role.is_super_admin);

  const columns: ColumnsType<AdminItem> = [
    {
      title: t('pages.userManagement.account.columns.username'),
      dataIndex: 'username',
    },
    {
      title: t('pages.userManagement.account.columns.mobile'),
      dataIndex: 'mobile',
    },
    {
      title: t('pages.userManagement.account.columns.role'),
      dataIndex: 'role_name',
    },
    {
      title: t('pages.userManagement.account.columns.action'),
      dataIndex: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t('pages.common.actions.edit')}>
            <a onClick={() => handleEdit(record)}>
              <EditOutlined />
            </a>
          </Tooltip>
          {isSuperAdmin && (
            <Tooltip title={t('pages.userManagement.account.actions.reset')}>
              <a onClick={() => openResetPassword(record)}>
                <KeyOutlined />
              </a>
            </Tooltip>
          )}
          {!record.is_super_admin && (
            <Tooltip title={t('pages.common.actions.delete')}>
              <Popconfirm
                title={t('pages.userManagement.account.popconfirm.delete')}
                okText={t('pages.common.actions.confirm')}
                cancelText={t('pages.common.actions.cancel')}
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

  const modalTitleText = editingAdmin
    ? t('pages.userManagement.account.modal.editTitle')
    : t('pages.userManagement.account.modal.createTitle');

  return (
    <PageContainer
      header={{ title: t('pages.userManagement.account.pageTitle') }}
    >
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t('pages.userManagement.account.button.add')}
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
            t('pages.userManagement.account.pagination.total', {
              from: range[0],
              to: range[1],
              total,
            }),
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={modalTitleText}
        open={modalVisible}
        destroyOnClose
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form layout="vertical" ref={formRef}>
          {!editingAdmin?.is_super_admin && (
            <Form.Item
              name="role_id"
              label={t('pages.userManagement.account.form.labels.role')}
              rules={[
                {
                  required: true,
                  message: t(
                    'pages.userManagement.account.form.validations.role',
                  ),
                },
              ]}
            >
              <Select
                placeholder={t(
                  'pages.userManagement.account.form.placeholders.role',
                )}
                options={getNonSuperAdminRoles().map((role) => ({
                  label: role.name,
                  value: role.id,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item
            name="username"
            label={t('pages.userManagement.account.form.labels.username')}
            rules={[
              {
                required: true,
                message: t(
                  'pages.userManagement.account.form.validations.username',
                ),
              },
              {
                min: 3,
                message: t(
                  'pages.userManagement.account.form.validations.usernameMin',
                ),
              },
            ]}
          >
            <Input
              placeholder={t(
                'pages.userManagement.account.form.placeholders.username',
              )}
            />
          </Form.Item>
          <Form.Item
            name="mobile"
            label={t('pages.userManagement.account.form.labels.mobile')}
            rules={[
              {
                required: true,
                message: t(
                  'pages.userManagement.account.form.validations.mobile',
                ),
              },
              {
                pattern: /^\d{11}$/,
                message: t(
                  'pages.userManagement.account.form.validations.mobilePattern',
                ),
              },
            ]}
          >
            <Input
              placeholder={t(
                'pages.userManagement.account.form.placeholders.mobile',
              )}
            />
          </Form.Item>
          {!editingAdmin && (
            <>
              <Form.Item
                name="password"
                label={t('pages.userManagement.account.form.labels.password')}
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.account.form.validations.password',
                    ),
                  },
                  {
                    min: 6,
                    message: t(
                      'pages.userManagement.account.form.validations.passwordMin',
                    ),
                  },
                ]}
              >
                <Input.Password
                  placeholder={t(
                    'pages.userManagement.account.form.placeholders.password',
                  )}
                />
              </Form.Item>
              <Form.Item
                name="password_confirmation"
                label={t(
                  'pages.userManagement.account.form.labels.passwordConfirm',
                )}
                dependencies={['password']}
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.account.form.validations.passwordConfirm',
                    ),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          t(
                            'pages.userManagement.account.form.errors.passwordMismatch',
                          ),
                        ),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder={t(
                    'pages.userManagement.account.form.placeholders.passwordConfirm',
                  )}
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <Modal
        title={
          resetTarget
            ? t('pages.userManagement.account.reset.titleWithName', {
                name: resetTarget.username,
              })
            : t('pages.userManagement.account.reset.title')
        }
        open={resetModalVisible}
        destroyOnClose
        onOk={handleResetPassword}
        onCancel={() => setResetModalVisible(false)}
      >
        <Form layout="vertical" ref={resetFormRef}>
          <Form.Item
            label={t('pages.userManagement.account.form.labels.username')}
          >
            <Input value={resetTarget?.username} disabled />
          </Form.Item>
          {!isSuperAdmin && (
            <Form.Item
              name="old_password"
              label={t('pages.userManagement.account.reset.oldPassword')}
              rules={[
                {
                  required: true,
                  message: t(
                    'pages.userManagement.account.reset.validations.oldPassword',
                  ),
                },
              ]}
            >
              <Input.Password
                placeholder={t(
                  'pages.userManagement.account.reset.placeholders.oldPassword',
                )}
              />
            </Form.Item>
          )}
          <Form.Item
            name="new_password"
            label={t('pages.userManagement.account.reset.newPassword')}
            rules={[
              {
                required: true,
                message: t(
                  'pages.userManagement.account.reset.validations.newPassword',
                ),
              },
              {
                min: 6,
                message: t(
                  'pages.userManagement.account.reset.validations.newPasswordMin',
                ),
              },
            ]}
          >
            <Input.Password
              placeholder={t(
                'pages.userManagement.account.reset.placeholders.newPassword',
              )}
            />
          </Form.Item>
          <Form.Item
            name="new_password_confirmation"
            label={t('pages.userManagement.account.reset.confirmPassword')}
            dependencies={['new_password']}
            rules={[
              {
                required: true,
                message: t(
                  'pages.userManagement.account.reset.validations.confirmPassword',
                ),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      t(
                        'pages.userManagement.account.form.errors.passwordMismatch',
                      ),
                    ),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder={t(
                'pages.userManagement.account.reset.placeholders.confirmPassword',
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AccountPage;
