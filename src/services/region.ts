import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type Region = {
  id: string;
  name: string;
  region_type: 'checkpoint' | 'site';
  description?: string;
  point_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type RegionListResponse = {
  regions: Region[];
  total: number;
  page: number;
  per_page: number;
};

export async function getRegions(options?: Record<string, any>) {
  return request<ApiResponse<RegionListResponse>>('/api/v1/admin/regions', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createRegion(
  body: Partial<Region>,
  options?: Record<string, any>,
) {
  return request<ApiResponse<Region>>('/api/v1/admin/regions', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function updateRegion(
  id: string,
  body: Partial<Region>,
  options?: Record<string, any>,
) {
  return request<ApiResponse<Region>>(`/api/v1/admin/regions/${id}`, {
    method: 'PATCH',
    data: body,
    ...(options || {}),
  });
}

export async function deleteRegion(id: string, options?: Record<string, any>) {
  return request<ApiResponse<Record<string, never>>>(
    `/api/v1/admin/regions/${id}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}
