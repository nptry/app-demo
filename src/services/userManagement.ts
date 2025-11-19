import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type PermissionItem = {
  id: string;
  module: string;
  description: string;
  scope: string[];
  assignedRoles: string[];
};

export type PermissionSummary = {
  totalPermissions: number;
  modules: number;
  sensitive: number;
};

export type PermissionResponse = {
  summary: PermissionSummary;
  permissions: PermissionItem[];
};

export async function getPermissions(options?: Record<string, any>) {
  return request<ApiResponse<PermissionResponse>>('/api/user/permissions', {
    method: 'GET',
    ...(options || {}),
  });
}

export type RoleItem = {
  id: string;
  name: string;
  type: '管理' | '运维' | '业务';
  description: string;
  scope: string[];
  members: number;
  updatedAt: string;
};

export type RoleResponse = {
  total: number;
  roles: RoleItem[];
};

export async function getRoles(options?: Record<string, any>) {
  return request<ApiResponse<RoleResponse>>('/api/user/roles', {
    method: 'GET',
    ...(options || {}),
  });
}

export type AccountSummary = {
  total: number;
  active: number;
  pending: number;
  locked: number;
};

export type AccountItem = {
  id: string;
  username: string;
  realName: string;
  org: string;
  dept: string;
  position: string;
  phone: string;
  email: string;
  role: string;
  status: '启用' | '待激活' | '禁用';
  lastLogin: string;
};

export type AccountResponse = {
  summary: AccountSummary;
  accounts: AccountItem[];
};

export async function getAccounts(options?: Record<string, any>) {
  return request<ApiResponse<AccountResponse>>('/api/user/accounts', {
    method: 'GET',
    ...(options || {}),
  });
}

export type OperationLogItem = {
  id: string;
  operator: string;
  account: string;
  action: string;
  target: string;
  ip: string;
  result: '成功' | '失败';
  timestamp: string;
};

export type OperationLogResponse = {
  logs: OperationLogItem[];
};

export async function getOperationLogs(options?: Record<string, any>) {
  return request<ApiResponse<OperationLogResponse>>('/api/user/operation-logs', {
    method: 'GET',
    ...(options || {}),
  });
}

export type KeyPersonItem = {
  id: string;
  name: string;
  role: string;
  region: string;
  phone: string;
  email: string;
  permissions: string[];
  status: '在岗' | '请假' | '停用';
};

export type KeyPersonResponse = {
  total: number;
  onDuty: number;
  backup: number;
  persons: KeyPersonItem[];
};

export async function getKeyPersons(options?: Record<string, any>) {
  return request<ApiResponse<KeyPersonResponse>>('/api/user/key-persons', {
    method: 'GET',
    ...(options || {}),
  });
}
