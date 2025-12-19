// API响应格式
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

// 分页响应格式
export interface PaginatedResponse<T> {
  total: number;
  current_page: number;
  total_pages: number;
  per_page: number;
  records: T[];
}

// 导出相关类型定义
export interface ExportParams {
  format: 'csv' | 'excel';
  start_date?: string;
  end_date?: string;
  [key: string]: any; // 允许模型特定的参数
}

export interface ExportResponse {
  type: 'sync' | 'async';
  job_id?: string;
  estimated_count?: number;
  message?: string;
  download_url?: string;
  filename?: string;
}

export interface ExportHistoryItem {
  id: string;
  model_name: string;
  format: string;
  status: string;
  filename: string;
  file_size: string;
  record_count: number;
  created_at: string;
  expires_at: string;
  can_download: boolean;
  download_url?: string;
  error_message?: string;
}

export interface DownloadResponse {
  download_url: string;
  filename: string;
  file_size: string;
  expires_in: number;
}
