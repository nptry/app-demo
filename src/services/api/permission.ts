import { request } from '@umijs/max';
import type { PermissionItem } from './role';
import type { ApiResponse, PaginatedResponse } from './types';

export interface PermissionParams {
  name?: string;
  code?: string;
  module?: string;
  description?: string;
}

export interface PermissionQueryParams {
  page?: number;
  per_page?: number;
  module?: string;
  search?: string;
}

export interface ModulesResult {
  modules: string[];
}

/** 获取权限列表 */
export async function getPermissions(params?: PermissionQueryParams) {
  return request<ApiResponse<PaginatedResponse<PermissionItem>>>(
    '/api/v1/admin/permissions',
    {
      method: 'GET',
      params,
    },
  ).then((response) => response.data);
}

/** 获取权限模块 */
export async function getPermissionModules() {
  return request<ApiResponse<ModulesResult>>(
    '/api/v1/admin/permissions/modules',
    {
      method: 'GET',
    },
  ).then((response) => response.data);
}

/** 获取单个权限 */
export async function getPermission(id: number) {
  return request<ApiResponse<PermissionItem>>(
    `/api/v1/admin/permissions/${id}`,
    {
      method: 'GET',
    },
  ).then((response) => response.data);
}

/** 创建权限 */
export async function createPermission(params: PermissionParams) {
  return request<ApiResponse<PermissionItem>>('/api/v1/admin/permissions', {
    method: 'POST',
    data: { permission: params },
  }).then((response) => response.data);
}

/** 更新权限 */
export async function updatePermission(id: number, params: PermissionParams) {
  return request<ApiResponse<PermissionItem>>(
    `/api/v1/admin/permissions/${id}`,
    {
      method: 'PATCH',
      data: { permission: params },
    },
  ).then((response) => response.data);
}

/** 删除权限 */
export async function deletePermission(id: number) {
  return request<ApiResponse<void>>(`/api/v1/admin/permissions/${id}`, {
    method: 'DELETE',
  }).then((response) => response.data);
}
