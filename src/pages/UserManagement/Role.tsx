import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
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
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [modalTitle, setModalTitle] = useState('新增角色');
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const formRef = useRef<FormInstance<RoleItem>>(null);

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
    setModalTitle('新增角色');
    setModalVisible(true);
    formRef.current?.resetFields();
  };

  const handleEdit = (record: RoleItem) => {
    if (record.is_super_admin) {
      message.warning('超级管理员角色不允许编辑');
      return;
    }
    setEditingRole(record);
    setModalTitle('编辑角色');
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
      message.warning('超级管理员角色权限不允许修改');
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
      message.success('权限已更新');
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
      message.warning('超级管理员角色不可删除');
      return;
    }
    try {
      await deleteRole(id);
      message.success('删除成功');
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
        message.success('角色已更新');
      } else {
        await createRole(values);
        message.success('角色已创建');
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

  const permissionTypes = {
    view: '查看',
    create: '创建',
    edit: '修改',
    delete: '删除',
  };

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
      title: '权限组',
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
      title: '模块',
      dataIndex: 'module',
      width: 150,
      render: (text: string) => getModuleName(text),
    },
    {
      title: '权限',
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
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_, record) => (
        <Space size="middle">
          {!record.is_super_admin && (
            <>
              <Tooltip title="编辑">
                <a onClick={() => handleEdit(record)}>
                  <EditOutlined />
                </a>
              </Tooltip>
              <Tooltip title="管理权限">
                <a onClick={() => handleManagePermissions(record)}>
                  <SettingOutlined />
                </a>
              </Tooltip>
              <Tooltip title="删除">
                <Popconfirm
                  title="确定删除此角色吗？"
                  okText="确定"
                  cancelText="取消"
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
            <span style={{ color: '#999' }}>超级管理员角色不可操作</span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '角色与权限管理' }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增角色
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
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item name="description" label="角色描述">
            <Input.TextArea rows={4} placeholder="请输入角色描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`管理权限：${editingRole?.name ?? ''}`}
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
