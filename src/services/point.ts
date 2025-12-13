import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type CheckpointPoint = {
  id: string;
  name: string;
  checkpointTypes: string[];
  region?: string;
  regionId?: string;
  address?: string;
  coordinates?: string;
  laneCount?: number;
  laneDescription?: string;
  laneName?: string;
  positionDescription?: string;
  speedLimit?: number;
  manager?: string;
  phone?: string;
  mapFile?: string;
  status: '启用' | '禁用';
  deviceId?: string;
  deviceName?: string;
  devices?: { id: string; name: string }[];
  deploymentDeviceType?: string;
  lensFocal?: string;
  installDate?: string;
  owner?: string;
  deploymentStatus?: string;
  deploymentResult?: string;
  remark?: string;
};

export type CheckpointPointResponse = {
  summary: {
    total: number;
    enabled: number;
    laneCount: number;
  };
  checkpoints: CheckpointPoint[];
};

export async function getCheckpointPoints(options?: Record<string, any>) {
  return request<ApiResponse<CheckpointPointResponse>>(
    '/api/v1/admin/points/checkpoints',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

export async function createCheckpointPoint(
  body: Partial<CheckpointPoint>,
  options?: Record<string, any>,
) {
  return request<ApiResponse<CheckpointPoint>>(
    '/api/v1/admin/points/checkpoints',
    {
      method: 'POST',
      data: body,
      ...(options || {}),
    },
  );
}

export async function updateCheckpointPoint(
  id: string,
  body: Partial<CheckpointPoint>,
  options?: Record<string, any>,
) {
  return request<ApiResponse<CheckpointPoint>>(
    `/api/v1/admin/points/checkpoints/${id}`,
    {
      method: 'PATCH',
      data: body,
      ...(options || {}),
    },
  );
}

export async function deleteCheckpointPoint(
  id: string,
  options?: Record<string, any>,
) {
  return request<ApiResponse<Record<string, never>>>(
    `/api/v1/admin/points/checkpoints/${id}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}

export type SitePoint = {
  id: string;
  name: string;
  siteType: string;
  region?: string;
  regionId?: string;
  address?: string;
  coordinates?: string;
  areaSize?: number;
  manager?: string;
  phone?: string;
  plan?: string;
  description?: string;
  positionDescription?: string;
  installDate?: string;
  installHeight?: number;
  zoneCode?: string;
  zoneArea?: number;
  status: '启用' | '禁用';
  deviceId?: string;
  deviceName?: string;
  devices?: { id: string; name: string }[];
  deploymentStatus?: string;
  deploymentResult?: string;
  deploymentDeviceType?: string;
  remark?: string;
};

export type SitePointResponse = {
  summary: {
    totalSites: number;
    enabledSites: number;
    totalAreaSqm: number;
  };
  sites: SitePoint[];
};

export async function getSitePoints(options?: Record<string, any>) {
  return request<ApiResponse<SitePointResponse>>('/api/v1/admin/points/sites', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createSitePoint(
  body: Partial<SitePoint>,
  options?: Record<string, any>,
) {
  return request<ApiResponse<SitePoint>>('/api/v1/admin/points/sites', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function updateSitePoint(
  id: string,
  body: Partial<SitePoint>,
  options?: Record<string, any>,
) {
  return request<ApiResponse<SitePoint>>(`/api/v1/admin/points/sites/${id}`, {
    method: 'PATCH',
    data: body,
    ...(options || {}),
  });
}

export async function deleteSitePoint(
  id: string,
  options?: Record<string, any>,
) {
  return request<ApiResponse<Record<string, never>>>(
    `/api/v1/admin/points/sites/${id}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}

export type PointOption = {
  id: number;
  name: string;
  pointType: 'checkpoint' | 'site';
  code?: string;
  deviceId?: number;
  deviceName?: string;
};

export async function getPointOptions(options?: Record<string, any>) {
  return request<ApiResponse<PointOption[]>>('/api/v1/admin/points/options', {
    method: 'GET',
    ...(options || {}),
  });
}
