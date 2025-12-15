import { request } from '@umijs/max';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type PersonEventRecord = {
  id: string;
  campusName?: string;
  personId?: string;
  name?: string;
  personType?: string;
  personTag?: string;
  location?: string;
  timestamp?: string;
  personImageUrl?: string;
  captureImageUrl?: string;
  frameImageUrl?: string;
};

export type PersonEventResponse = {
  total: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  records: PersonEventRecord[];
};

export type PersonEventParams = {
  page?: number;
  per_page?: number;
  person_tag?: string;
  person_type?: string;
  start_date?: string;
  end_date?: string;
  campus_id?: string;
  name?: string;
};

const transformRecord = (record: any): PersonEventRecord => ({
  id: record.id,
  campusName: record.campus_name,
  personId: record.person_id,
  name: record.name,
  personType: record.person_type,
  personTag: record.person_tag,
  location: record.location,
  timestamp: record.timestamp,
  personImageUrl: record.person_image_url,
  captureImageUrl: record.capture_image_url,
  frameImageUrl: record.frame_image_url,
});

export async function getPersonEventLogs(
  params?: PersonEventParams,
  options?: Record<string, any>,
) {
  const resp = await request<ApiResponse<PersonEventResponse>>(
    '/api/v1/admin/person_event_logs',
    {
      method: 'GET',
      params,
      ...(options || {}),
    },
  );

  const payload = resp.data;
  if (!payload) {
    return resp as ApiResponse<PersonEventResponse>;
  }

  return {
    ...resp,
    data: {
      total: payload.total,
      currentPage: payload.current_page,
      totalPages: payload.total_pages,
      perPage: payload.per_page,
      records: (payload.records || []).map(transformRecord),
    },
  };
}

export async function getPersonEventLogDetail(
  id: string,
  options?: Record<string, any>,
) {
  const resp = await request<ApiResponse<any>>(
    `/api/v1/admin/person_event_logs/${id}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );

  const payload = resp.data;
  return transformRecord(payload);
}
