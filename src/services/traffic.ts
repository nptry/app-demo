import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type CheckpointInfoItem = {
  id: string;
  name: string;
  checkpointTypes: string[];
  region: string;
  address: string;
  coordinates: string;
  laneCount: number;
  laneDescription: string;
  speedLimit: number;
  manager: string;
  phone: string;
  mapFile: string;
  status: '启用' | '禁用';
};

export type TrafficCheckpointResponse = {
  summary: {
    total: number;
    enabled: number;
    laneCount: number;
  };
  checkpoints: CheckpointInfoItem[];
};

export async function getTrafficCheckpoints(options?: Record<string, any>) {
  return request<ApiResponse<TrafficCheckpointResponse>>(
    '/api/v1/admin/traffic/checkpoints',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

export async function createTrafficCheckpoint(
  body: Partial<CheckpointInfoItem>,
  options?: Record<string, any>,
) {
  return request<ApiResponse<CheckpointInfoItem>>(
    '/api/v1/admin/traffic/checkpoints',
    {
      method: 'POST',
      data: body,
      ...(options || {}),
    },
  );
}

export async function updateTrafficCheckpoint(
  id: string,
  body: Partial<CheckpointInfoItem>,
  options?: Record<string, any>,
) {
  return request<ApiResponse<CheckpointInfoItem>>(
    `/api/v1/admin/traffic/checkpoints/${id}`,
    {
      method: 'PATCH',
      data: body,
      ...(options || {}),
    },
  );
}

export async function deleteTrafficCheckpoint(
  id: string,
  options?: Record<string, any>,
) {
  return request<ApiResponse<Record<string, never>>>(
    `/api/v1/admin/traffic/checkpoints/${id}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}

export type TrafficDeploymentItem = {
  id: string;
  checkpointId: string;
  checkpointName: string;
  deviceType: '智能盒子';
  deviceId: string;
  deviceName: string;
  lane: string;
  position: string;
  lensFocal?: string;
  installDate: string;
  owner: string;
  status: '正常运行' | '待调试' | '已拆除';
  result?: string;
};

export type TrafficDeploymentResponse = {
  deployments: TrafficDeploymentItem[];
};

export async function getTrafficDeployments(options?: Record<string, any>) {
  return request<ApiResponse<TrafficDeploymentResponse>>(
    '/api/v1/admin/traffic/deployments',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

export async function createTrafficDeployment(
  body: Partial<TrafficDeploymentItem>,
  options?: Record<string, any>,
) {
  return request<ApiResponse<TrafficDeploymentItem>>(
    '/api/v1/admin/traffic/deployments',
    {
      method: 'POST',
      data: body,
      ...(options || {}),
    },
  );
}

export async function updateTrafficDeployment(
  id: string,
  body: Partial<TrafficDeploymentItem>,
  options?: Record<string, any>,
) {
  return request<ApiResponse<TrafficDeploymentItem>>(
    `/api/v1/admin/traffic/deployments/${id}`,
    {
      method: 'PATCH',
      data: body,
      ...(options || {}),
    },
  );
}

export async function deleteTrafficDeployment(
  id: string,
  options?: Record<string, any>,
) {
  return request<ApiResponse<Record<string, never>>>(
    `/api/v1/admin/traffic/deployments/${id}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}

type BoxAlarmEventRecord = {
  id: string;
  major_type?: string;
  minor_type?: string;
  timestamp?: string;
  plate_number?: string;
  vehicle_class?: string;
  vehicle_color?: string;
  vehicle_brand?: string;
  vehicle_sub_brand?: string;
  capture_image_urls?: string[];
  person_identifiers?: string[];
  plate_recognition?: boolean;
  raw_person_id_list?: string;
  capture_image_count?: number;
};

type BackendLicenseRecordResponse = {
  total: number;
  current_page: number;
  total_pages: number;
  per_page: number;
  records: BoxAlarmEventRecord[];
};

export type BoxAlarmEventItem = {
  id: string;
  majorType?: string;
  minorType?: string;
  timestamp?: string;
  plateNumber?: string;
  vehicleClass?: string;
  vehicleColor?: string;
  vehicleBrand?: string;
  vehicleSubBrand?: string;
  captureImageUrls: string[];
  personIdentifiers: string[];
  plateRecognition: boolean;
  rawPersonIdList?: string;
  captureImageCount?: number;
};

export type BoxAlarmEventResponse = {
  total: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  records: BoxAlarmEventItem[];
};

export type BoxAlarmEventParams = {
  page?: number;
  per_page?: number;
  start_time?: string;
  end_time?: string;
  plate_number?: string;
  vehicle_class?: string;
  vehicle_color?: string;
  major_type?: string;
  minor_type?: string;
};

const transformBoxAlarmRecord = (
  record: BoxAlarmEventRecord,
): BoxAlarmEventItem => ({
  id: record.id,
  majorType: record.major_type,
  minorType: record.minor_type,
  timestamp: record.timestamp,
  plateNumber: record.plate_number,
  vehicleClass: record.vehicle_class,
  vehicleColor: record.vehicle_color,
  vehicleBrand: record.vehicle_brand,
  vehicleSubBrand: record.vehicle_sub_brand,
  captureImageUrls: record.capture_image_urls ?? [],
  personIdentifiers: record.person_identifiers ?? [],
  plateRecognition: Boolean(record.plate_recognition),
  rawPersonIdList: record.raw_person_id_list,
  captureImageCount: record.capture_image_count,
});

async function fetchBoxAlarmEvents(
  params?: BoxAlarmEventParams,
  options?: Record<string, any>,
) {
  const resp = await request<ApiResponse<BackendLicenseRecordResponse>>(
    '/api/v1/admin/box_alarm_events',
    {
      method: 'GET',
      params,
      ...(options || {}),
    },
  );

  const payload = resp.data;

  if (!payload) {
    return resp as ApiResponse<BoxAlarmEventResponse>;
  }

  return {
    ...resp,
    data: {
      total: payload.total,
      currentPage: payload.current_page,
      totalPages: payload.total_pages,
      perPage: payload.per_page,
      records: (payload.records || []).map(transformBoxAlarmRecord),
    },
  };
}

async function fetchBoxAlarmEventDetail(
  id: string,
  options?: Record<string, any>,
) {
  const resp = await request<ApiResponse<BoxAlarmEventRecord>>(
    `/api/v1/admin/box_alarm_events/${id}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );

  if (!resp.data) {
    return resp as ApiResponse<BoxAlarmEventItem>;
  }

  return {
    ...resp,
    data: transformBoxAlarmRecord(resp.data),
  };
}

export type LicenseRecordItem = BoxAlarmEventItem;
export type LicenseRecordResponse = BoxAlarmEventResponse;
export type LicenseRecordParams = BoxAlarmEventParams;
export type LicenseRecordDetail = LicenseRecordItem;

export async function getLicenseRecords(
  params?: LicenseRecordParams,
  options?: Record<string, any>,
) {
  return fetchBoxAlarmEvents(params, options);
}

export async function getLicenseRecordDetail(
  id: string,
  options?: Record<string, any>,
) {
  return fetchBoxAlarmEventDetail(id, options);
}

export type RetrogradeViolationItem = BoxAlarmEventItem;
export type RetrogradeViolationResponse = BoxAlarmEventResponse;
export type RetrogradeViolationDetail = BoxAlarmEventItem;

export async function getRetrogradeViolations(
  params?: BoxAlarmEventParams,
  options?: Record<string, any>,
) {
  return fetchBoxAlarmEvents(params, options);
}

export async function getRetrogradeViolationDetail(
  id: string,
  options?: Record<string, any>,
) {
  return fetchBoxAlarmEventDetail(id, options);
}

export type ParkingViolationItem = BoxAlarmEventItem;
export type ParkingViolationResponse = BoxAlarmEventResponse;
export type ParkingViolationDetail = BoxAlarmEventItem;

export async function getParkingViolations(
  params?: BoxAlarmEventParams,
  options?: Record<string, any>,
) {
  return fetchBoxAlarmEvents(params, options);
}

export async function getParkingViolationDetail(
  id: string,
  options?: Record<string, any>,
) {
  return fetchBoxAlarmEventDetail(id, options);
}

export type TrafficMonitoringRecord = {
  id: string;
  checkpointName: string;
  lane: string;
  period: string;
  range: string;
  totalVehicles: number;
  threshold: number;
  congestion: boolean;
  duration?: string;
  suggestion?: string;
  avgSpeed: number;
  maxSpeed: number;
  deviceId: string;
  accuracy: number;
};

export type TrafficMonitoringResponse = {
  records: TrafficMonitoringRecord[];
};

export async function getTrafficMonitoring(options?: Record<string, any>) {
  return request<ApiResponse<TrafficMonitoringResponse>>(
    '/api/traffic/monitoring',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

export type RedLightRecord = {
  id: string;
  checkpointName: string;
  lane: string;
  violationTime: string;
  lightOnTime: string;
  plateNumber: string;
  vehicleType: string;
  photos: string[];
  video: string;
  position: string;
  speed: number;
  alarm: {
    triggered: boolean;
    receiver?: string;
    status?:
      | '未处理'
      | '处理中（录入执法系统）'
      | '已处理（生成罚单）'
      | '误报';
    remark?: string;
  };
  deviceId: string;
  accuracy: number;
};

export async function getRedLightViolations(options?: Record<string, any>) {
  return request<ApiResponse<RedLightRecord[]>>('/api/traffic/red-light', {
    method: 'GET',
    ...(options || {}),
  });
}
