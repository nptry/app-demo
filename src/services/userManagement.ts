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
  facePhotoUrl?: string;
  facePhoto?: string | null;
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

type BackendKeyPerson = {
  id: number | string;
  name: string;
  gender?: string;
  birthDate?: string;
  idNumber?: string;
  personType: KeyPersonItem['personType'];
  reason?: string;
  controlAreas?: string[];
  startTime?: string;
  endTime?: string;
  facePhotoUrl?: string;
  contactName?: string;
  contactPhone?: string;
  status: KeyPersonItem['status'];
  statusUpdatedAt?: string;
  operator?: string;
  remark?: string;
};

const transformKeyPerson = (person: BackendKeyPerson): KeyPersonItem => ({
  id: person.id.toString(),
  name: person.name,
  gender: (person.gender as KeyPersonItem['gender']) || '未知',
  birthDate: person.birthDate || '',
  idNumber: person.idNumber || '',
  personType: person.personType,
  reason: person.reason || '',
  controlAreas: person.controlAreas || [],
  startTime: person.startTime || '',
  endTime: person.endTime || '',
  facePhotoUrl: person.facePhotoUrl,
  contactName: person.contactName,
  contactPhone: person.contactPhone,
  status: person.status,
  statusUpdatedAt: person.statusUpdatedAt || '',
  operator: person.operator || '',
  remark: person.remark,
});

const buildKeyPersonPayload = (person: Partial<KeyPersonItem>) => ({
  key_person: {
    name: person.name,
    gender: person.gender,
    id_number: person.idNumber,
    reason: person.reason,
    contact_name: person.contactName,
    contact_phone: person.contactPhone,
    remark: person.remark,
    face_photo: person.facePhoto,
  },
});

export async function getKeyPersons(options?: Record<string, any>) {
  const resp = await request<ApiResponse<KeyPersonResponse>>(
    '/api/v1/admin/key_people',
    {
      method: 'GET',
      ...(options || {}),
    },
  );

  const payload = resp.data;
  if (!payload) {
    return resp as ApiResponse<KeyPersonResponse>;
  }

  const summary = payload.summary || {
    total: 0,
    in_control: 0,
    expired: 0,
  };

  return {
    ...resp,
    data: {
      summary: {
        total: summary.total,
        inControl: summary.in_control,
        expired: summary.expired,
      },
      persons: (payload.persons || []).map(transformKeyPerson),
    },
  };
}

export async function createKeyPerson(
  body: Partial<KeyPersonItem>,
  options?: Record<string, any>,
) {
  const resp = await request<ApiResponse<BackendKeyPerson>>(
    '/api/v1/admin/key_people',
    {
      method: 'POST',
      data: buildKeyPersonPayload(body),
      ...(options || {}),
    },
  );
  return transformKeyPerson(resp.data as BackendKeyPerson);
}

export async function updateKeyPerson(
  id: string,
  body: Partial<KeyPersonItem>,
  options?: Record<string, any>,
) {
  const resp = await request<ApiResponse<BackendKeyPerson>>(
    `/api/v1/admin/key_people/${id}`,
    {
      method: 'PATCH',
      data: buildKeyPersonPayload(body),
      ...(options || {}),
    },
  );
  return transformKeyPerson(resp.data as BackendKeyPerson);
}

export async function deleteKeyPerson(
  id: string,
  options?: Record<string, any>,
) {
  return request<ApiResponse<Record<string, never>>>(
    `/api/v1/admin/key_people/${id}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}
