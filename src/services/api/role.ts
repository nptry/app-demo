import { request } from '@umijs/max';
import type { ApiResponse, PaginatedResponse } from './types';

export interface PermissionItem {
  id: number;
  name: string;
  code: string;
  module: string;
  group: string;
  description?: string;
}

export interface RoleItem {
  id: number;
  name: string;
  description?: string;
  permissions?: PermissionItem[];
  is_super_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoleParams {
  name?: string;
  description?: string;
}

export interface RoleQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
}

/** 获取角色列表 */
export async function getRoles(params?: RoleQueryParams) {
  return request<ApiResponse<PaginatedResponse<RoleItem>>>(
    '/api/v1/admin/roles',
    {
      method: 'GET',
      params,
    },
  ).then((response) => response.data);
}

/** 获取单个角色 */
export async function getRole(id: number) {
  return request<ApiResponse<{ role: RoleItem }>>(`/api/v1/admin/roles/${id}`, {
    method: 'GET',
  }).then((response) => response.data?.role);
}

/** 创建角色 */
export async function createRole(params: RoleParams) {
  return request<ApiResponse<{ role: RoleItem; message: string }>>(
    '/api/v1/admin/roles',
    {
      method: 'POST',
      data: { role: params },
    },
  ).then((response) => response.data?.role);
}

/** 更新角色 */
export async function updateRole(id: number, params: RoleParams) {
  return request<ApiResponse<{ role: RoleItem; message: string }>>(
    `/api/v1/admin/roles/${id}`,
    {
      method: 'PATCH',
      data: { role: params },
    },
  ).then((response) => response.data?.role);
}

/** 删除角色 */
export async function deleteRole(id: number) {
  return request<ApiResponse<void>>(`/api/v1/admin/roles/${id}`, {
    method: 'DELETE',
  }).then((response) => response.data);
}

/** 更新角色权限 */
export async function updateRolePermissions(
  id: number,
  permissionIds: number[],
) {
  return request<ApiResponse<RoleItem>>(
    `/api/v1/admin/roles/${id}/permissions`,
    {
      method: 'PUT',
      data: { permission_ids: permissionIds },
    },
  ).then((response) => response.data);
}
