import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type PermissionSummary = {
  total: number;
  management: number;
  usage: number;
  disabled: number;
};

export type PermissionItem = {
  id: string;
  name: string;
  type: '管理权限' | '使用权限';
  modules: string[];
  status: '启用' | '禁用';
  createdAt: string;
  updatedBy: string;
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

export type RoleSummary = {
  total: number;
  enabled: number;
  disabled: number;
  departments: number;
};

export type RoleItem = {
  id: string;
  name: string;
  department: string;
  permissions: string[];
  description?: string;
  status: '启用' | '禁用';
  createdAt: string;
};

export type RoleResponse = {
  summary: RoleSummary;
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
  enabled: number;
  disabled: number;
  pendingReset: number;
};

export type AccountItem = {
  id: string;
  username: string;
  realName: string;
  department: string;
  role: string;
  position: string;
  phone: string;
  email: string;
  status: '启用' | '禁用';
  lastLogin?: string;
  passwordUpdatedAt?: string;
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

export type ActionLogItem = {
  id: string;
  account: string;
  realName: string;
  module: string;
  actionType: string;
  content: string;
  ip: string;
  time: string;
  result: '成功' | '失败';
  failReason?: string;
};

export type ActionLogResponse = {
  logs: ActionLogItem[];
};

export async function getActionLogs(options?: Record<string, any>) {
  return request<ApiResponse<ActionLogResponse>>('/api/user/action-logs', {
    method: 'GET',
    ...(options || {}),
  });
}

export type KeyPersonSummary = {
  total: number;
  inControl: number;
  expired: number;
  highRisk: number;
};

export type KeyPersonItem = {
  id: string;
  name: string;
  gender: '男' | '女' | '未知';
  birthDate: string;
  idNumber: string;
  personType: '黑名单人员' | '重点关注人员' | '限制进入人员';
  reason: string;
  controlAreas: string[];
  startTime: string;
  endTime: string;
  faceLibrary: string;
  contactName?: string;
  contactPhone?: string;
  status: '在控' | '失控' | '已解除';
  statusUpdatedAt: string;
  operator: string;
  remark?: string;
};

export type KeyPersonResponse = {
  summary: KeyPersonSummary;
  persons: KeyPersonItem[];
};

export async function getKeyPersons(options?: Record<string, any>) {
  return request<ApiResponse<KeyPersonResponse>>('/api/user/key-persons', {
    method: 'GET',
    ...(options || {}),
  });
}
