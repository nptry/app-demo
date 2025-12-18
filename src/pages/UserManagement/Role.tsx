import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import type { FormInstance } from 'antd';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Space,
  Table,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getGroupName, getModuleName } from '@/constants/translations';
import { getPermissions } from '@/services/api/permission';
import {
  createRole,
  deleteRole,
  getRoles,
  type PermissionItem,
  type RoleItem,
  type RoleQueryParams,
  updateRole,
  updateRolePermissions,
} from '@/services/api/role';

type PermissionTableRow = {
  key: string;
  group: string;
  module: string;
  permissions: PermissionItem[];
  isFirstRowOfGroup: boolean;
};

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 15,
  total: 0,
};

const RolePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const formRef = useRef<FormInstance<RoleItem>>(null);
  const intlT = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intlT.formatMessage({ id }, values),
    [intlT],
  );

  const fetchRoles = async (params: RoleQueryParams = {}) => {
    setLoading(true);
    try {
      const response = await getRoles({
        page: params.page ?? pagination.current,
        per_page: params.per_page ?? pagination.pageSize,
        ...params,
      });
      if (response?.records) {
        setRoles(response.records);
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

  const fetchPermissions = async () => {
    try {
      const response = await getPermissions({ per_page: 1000 });
      const permissionRecords = response?.records ?? [];
      setPermissions(permissionRecords);
      const uniqueGroups = Array.from(
        new Set(permissionRecords.map((item) => item.group).filter(Boolean)),
      ) as string[];
      setGroups(uniqueGroups);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleTableChange = (pageInfo: any) => {
    fetchRoles({
      page: pageInfo.current ?? 1,
      per_page: pageInfo.pageSize ?? DEFAULT_PAGINATION.pageSize,
    });
  };

  const handleAdd = () => {
    setEditingRole(null);
    setModalVisible(true);
    formRef.current?.resetFields();
  };

  const handleEdit = (record: RoleItem) => {
    if (record.is_super_admin) {
      message.warning(
        t('pages.userManagement.role.messages.superAdminEditForbidden'),
      );
      return;
    }
    setEditingRole(record);
    setModalVisible(true);

    setTimeout(() => {
      formRef.current?.setFieldsValue({
        name: record.name,
        description: record.description,
      });
    }, 0);
  };

  const handleManagePermissions = (record: RoleItem) => {
    if (record.is_super_admin) {
      message.warning(
        t('pages.userManagement.role.messages.superAdminPermissionForbidden'),
      );
      return;
    }
    setEditingRole(record);
    setPermissionModalVisible(true);
    setSelectedPermissions(record.permissions?.map((item) => item.id) ?? []);
  };

  const handlePermissionSubmit = async () => {
    if (!editingRole) return;
    try {
      await updateRolePermissions(editingRole.id, selectedPermissions);
      message.success(
        t('pages.userManagement.role.messages.permissionUpdated'),
      );
      setPermissionModalVisible(false);
      fetchRoles({
        page: pagination.current,
        per_page: pagination.pageSize,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number, role: RoleItem) => {
    if (role.is_super_admin) {
      message.warning(
        t('pages.userManagement.role.messages.superAdminDeleteForbidden'),
      );
      return;
    }
    try {
      await deleteRole(id);
      message.success(t('pages.common.messages.deleteSuccess'));
      fetchRoles({
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

      if (editingRole) {
        await updateRole(editingRole.id, values);
        message.success(t('pages.userManagement.role.messages.updateSuccess'));
      } else {
        await createRole(values);
        message.success(t('pages.userManagement.role.messages.createSuccess'));
      }
      setModalVisible(false);
      fetchRoles({
        page: pagination.current,
        per_page: pagination.pageSize,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getModulesByGroup = (groupName: string) => {
    const groupPermissions = permissions.filter(
      (permission) => permission.group === groupName,
    );
    return Array.from(
      new Set(groupPermissions.map((permission) => permission.module)),
    ).filter(Boolean) as string[];
  };

  const getPermissionsByGroupAndModule = (group: string, moduleName: string) =>
    permissions.filter(
      (permission) =>
        permission.group === group && permission.module === moduleName,
    );

  const permissionTypes = useMemo(
    () => ({
      view: t('pages.userManagement.role.permissionTypes.view'),
      create: t('pages.userManagement.role.permissionTypes.create'),
      edit: t('pages.userManagement.role.permissionTypes.edit'),
      delete: t('pages.userManagement.role.permissionTypes.delete'),
    }),
    [t],
  );

  const getPermissionType = (code: string) => {
    if (code.includes('view')) return 'view';
    if (code.includes('create')) return 'create';
    if (code.includes('edit') || code.includes('update')) return 'edit';
    if (code.includes('delete')) return 'delete';
    return '';
  };

  const permissionTableData: PermissionTableRow[] = useMemo(() => {
    const data: PermissionTableRow[] = [];
    groups.forEach((group) => {
      const groupModules = getModulesByGroup(group);
      groupModules.forEach((module, index) => {
        data.push({
          key: `${group}-${module}`,
          group,
          module,
          permissions: getPermissionsByGroupAndModule(group, module),
          isFirstRowOfGroup: index === 0,
        });
      });
    });
    return data;
  }, [groups, permissions]);

  const permissionColumns: ColumnsType<PermissionTableRow> = [
    {
      title: t('pages.userManagement.role.permissionTable.group'),
      dataIndex: 'group',
      width: 120,
      render: (text: string) => getGroupName(text),
      onCell: (record) => ({
        rowSpan: record.isFirstRowOfGroup
          ? getModulesByGroup(record.group).length
          : 0,
      }),
    },
    {
      title: t('pages.userManagement.role.permissionTable.module'),
      dataIndex: 'module',
      width: 150,
      render: (text: string) => getModuleName(text),
    },
    {
      title: t('pages.userManagement.role.permissionTable.permissions'),
      dataIndex: 'permissions',
      render: (permissionItems: PermissionItem[]) => {
        const permissionsByType: Record<string, PermissionItem[]> = {
          view: permissionItems.filter(
            (item) => getPermissionType(item.code) === 'view',
          ),
          create: permissionItems.filter(
            (item) => getPermissionType(item.code) === 'create',
          ),
          edit: permissionItems.filter(
            (item) => getPermissionType(item.code) === 'edit',
          ),
          delete: permissionItems.filter(
            (item) => getPermissionType(item.code) === 'delete',
          ),
        };

        return (
          <div style={{ display: 'flex', gap: 16 }}>
            {Object.entries(permissionTypes).map(([type, label]) => {
              const typePermissions = permissionsByType[type];
              if (!typePermissions?.length) {
                return null;
              }
              const isChecked = typePermissions.some((item) =>
                selectedPermissions.includes(item.id),
              );

              const handleTypeChange = (checked: boolean) => {
                if (checked) {
                  const newIds = typePermissions
                    .map((item) => item.id)
                    .filter((id) => !selectedPermissions.includes(id));
                  setSelectedPermissions((prev) => [...prev, ...newIds]);
                } else {
                  const typeIds = typePermissions.map((item) => item.id);
                  setSelectedPermissions((prev) =>
                    prev.filter((id) => !typeIds.includes(id)),
                  );
                }
              };

              return (
                <label
                  key={type}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(event) => handleTypeChange(event.target.checked)}
                    style={{ marginRight: 4 }}
                  />
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleTypeChange(!isChecked)}
                  >
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        );
      },
    },
  ];

  const roleColumns: ColumnsType<RoleItem> = [
    {
      title: t('pages.userManagement.role.columns.name'),
      dataIndex: 'name',
    },
    {
      title: t('pages.userManagement.role.columns.description'),
      dataIndex: 'description',
    },
    {
      title: t('pages.userManagement.role.columns.action'),
      dataIndex: 'action',
      render: (_, record) => (
        <Space size="middle">
          {!record.is_super_admin && (
            <>
              <Tooltip title={t('pages.common.actions.edit')}>
                <a onClick={() => handleEdit(record)}>
                  <EditOutlined />
                </a>
              </Tooltip>
              <Tooltip title={t('pages.userManagement.role.actions.manage')}>
                <a onClick={() => handleManagePermissions(record)}>
                  <SettingOutlined />
                </a>
              </Tooltip>
              <Tooltip title={t('pages.common.actions.delete')}>
                <Popconfirm
                  title={t('pages.userManagement.role.popconfirm.delete')}
                  okText={t('pages.common.actions.confirm')}
                  cancelText={t('pages.common.actions.cancel')}
                  onConfirm={() => handleDelete(record.id, record)}
                >
                  <a>
                    <DeleteOutlined style={{ color: '#ff4d4f' }} />
                  </a>
                </Popconfirm>
              </Tooltip>
            </>
          )}
          {record.is_super_admin && (
            <span style={{ color: '#999' }}>
              {t('pages.userManagement.role.text.superAdminReadonly')}
            </span>
          )}
        </Space>
      ),
    },
  ];

  const roleModalTitle = editingRole
    ? t('pages.userManagement.role.modal.editTitle')
    : t('pages.userManagement.role.modal.createTitle');
  const permissionModalTitle = t(
    'pages.userManagement.role.permissionModal.title',
    { name: editingRole?.name ?? '' },
  );

  return (
    <PageContainer header={{ title: t('pages.userManagement.role.pageTitle') }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t('pages.userManagement.role.button.add')}
        </Button>
      </div>
      <Table<RoleItem>
        rowKey="id"
        loading={loading}
        columns={roleColumns}
        dataSource={roles}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '15', '20', '50', '100'],
          showTotal: (total, range) =>
            t('pages.userManagement.role.pagination.total', {
              from: range[0],
              to: range[1],
              total,
            }),
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={roleModalTitle}
        open={modalVisible}
        destroyOnClose
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form layout="vertical" ref={formRef}>
          <Form.Item
            name="name"
            label={t('pages.userManagement.role.form.labels.name')}
            rules={[
              {
                required: true,
                message: t('pages.userManagement.role.form.validations.name'),
              },
            ]}
          >
            <Input
              placeholder={t(
                'pages.userManagement.role.form.placeholders.name',
              )}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('pages.userManagement.role.form.labels.description')}
          >
            <Input.TextArea
              rows={4}
              placeholder={t(
                'pages.userManagement.role.form.placeholders.description',
              )}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={permissionModalTitle}
        open={permissionModalVisible}
        width={860}
        destroyOnClose
        onOk={handlePermissionSubmit}
        onCancel={() => setPermissionModalVisible(false)}
      >
        <Card>
          <Table<PermissionTableRow>
            rowKey="key"
            bordered
            pagination={false}
            columns={permissionColumns}
            dataSource={permissionTableData}
          />
        </Card>
      </Modal>
    </PageContainer>
  );
};

export default RolePage;
