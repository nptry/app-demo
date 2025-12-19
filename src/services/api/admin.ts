import { request } from '@umijs/max';
import type { ApiResponse, PaginatedResponse } from './types';

export interface AdminItem {
  id: number;
  username: string;
  mobile: string;
  role_id: number;
  role_name: string;
  is_super_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminParams {
  username?: string;
  mobile?: string;
  password?: string;
  password_confirmation?: string;
  role_id?: number;
}

export interface AdminQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  role_id?: number;
}

/** 获取管理员列表 */
export async function getAdmins(params?: AdminQueryParams) {
  return request<ApiResponse<PaginatedResponse<AdminItem>>>(
    '/api/v1/admin/admins',
    {
      method: 'GET',
      params,
    },
  ).then((response) => response.data);
}

/** 获取单个管理员 */
export async function getAdmin(id: number) {
  return request<ApiResponse<{ admin: AdminItem }>>(
    `/api/v1/admin/admins/${id}`,
    {
      method: 'GET',
    },
  ).then((response) => response.data);
}

/** 创建管理员 */
export async function createAdmin(params: AdminParams) {
  return request<ApiResponse<{ admin: AdminItem }>>('/api/v1/admin/admins', {
    method: 'POST',
    data: { admin: params },
  }).then((response) => response.data);
}

/** 更新管理员 */
export async function updateAdmin(id: number, params: AdminParams) {
  return request<ApiResponse<{ admin: AdminItem }>>(
    `/api/v1/admin/admins/${id}`,
    {
      method: 'PATCH',
      data: { admin: params },
    },
  ).then((response) => response.data);
}

/** 删除管理员 */
export async function deleteAdmin(id: number) {
  return request<ApiResponse<{ message: string }>>(
    `/api/v1/admin/admins/${id}`,
    {
      method: 'DELETE',
    },
  ).then((response) => response.data);
}

export interface ResetPasswordParams {
  id?: number;
  username?: string;
  old_password?: string;
  new_password: string;
  new_password_confirmation: string;
}

/** 重置管理员密码 */
export async function resetAdminPassword(params: ResetPasswordParams) {
  return request<ApiResponse<Record<string, any>>>(
    '/api/v1/admin/auth/reset_password',
    {
      method: 'PATCH',
      data: params,
    },
  ).then((response) => response.data);
}
