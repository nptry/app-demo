import { request } from '@umijs/max';
import type { ApiResponse, PaginatedResponse } from './types';

export interface DepartmentItem {
  id: number;
  name: string;
  description?: string;
  campus_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CampusItem {
  id: number;
  name: string;
  address?: string;
  description?: string;
  departments?: DepartmentItem[];
  created_at?: string;
  updated_at?: string;
  longitude?: number;
  latitude?: number;
}

export interface CampusQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  name?: string;
}

/** 获取院区列表 */
export async function getCampuses(params?: CampusQueryParams) {
  return request<ApiResponse<PaginatedResponse<CampusItem>>>(
    '/api/v1/admin/campuses',
    {
      method: 'GET',
      params,
    },
  ).then((response) => response.data);
}
