// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  if (typeof localStorage === 'undefined') {
    throw new Error('No localStorage');
  }

  const adminStr = localStorage.getItem('current_admin');
  if (!adminStr) {
    throw new Error('No current admin');
  }

  const admin = JSON.parse(adminStr);
  return {
    data: {
      name: admin.username,
      userid: String(admin.id),
      access: 'admin',
      phone: admin.mobile,
    } as API.CurrentUser,
  };
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  if (typeof localStorage === 'undefined') {
    return { success: true };
  }
  try {
    await request<Record<string, any>>('/api/v1/admin/auth/logout', {
      method: 'DELETE',
      ...(options || {}),
    });
  } finally {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('current_admin');
  }
  return { success: true };
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  try {
    const res = await request<{
      success: boolean;
      data: { token: string; admin: any };
    }>('/api/v1/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        username: body.username,
        password: body.password,
      },
      ...(options || {}),
    });

    if (typeof localStorage !== 'undefined') {
      const { token, admin } = res.data || {};
      if (token) {
        localStorage.setItem('admin_token', token);
      }
      if (admin) {
        localStorage.setItem('current_admin', JSON.stringify(admin));
      }
    }

    return {
      status: 'ok',
      type: body.type,
      currentAuthority: 'admin',
    } as API.LoginResult;
  } catch (_e) {
    return {
      status: 'error',
      type: body.type,
      currentAuthority: 'guest',
    } as API.LoginResult;
  }
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}
