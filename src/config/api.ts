// API配置文件
export interface ApiConfig {
  protocol: string;
  host: string;
  port: number;
}

// 默认API配置
export const DEFAULT_API_CONFIG: ApiConfig = {
  protocol: 'https',
  host: 'www.zhifei.site',
  port: 48080
};

// 构建完整的API基础URL
export const buildApiBaseUrl = (config: ApiConfig = DEFAULT_API_CONFIG): string => {
  return `${config.protocol}://${config.host}:${config.port}`;
};

// 构建完整的API URL
export const buildApiUrl = (path: string, config: ApiConfig = DEFAULT_API_CONFIG): string => {
  const baseUrl = buildApiBaseUrl(config);
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

// 导出默认的API基础URL
export const API_BASE_URL = buildApiBaseUrl();

// 常用的API端点
export const API_ENDPOINTS = {
  // 认证相关
  GET_TENANT_BY_MOBILE: '/admin-api/system/tenant/get-id-by-mobile',
  LOGIN: '/admin-api/system/auth/login',
  REFRESH_TOKEN: '/admin-api/system/auth/refresh-token',
  USER_PROFILE: '/admin-api/system/user/profile/get',
  
  // 班级相关
  DEPT_LIST: '/admin-api/system/dept/list',
  
  // 作业相关
  HOMEWORK_PAGE: '/admin-api/homework/homework-tasks/page',
  HOMEWORK_CREATE: '/admin-api/homework/homework-tasks/create',
  HOMEWORK_GET: '/admin-api/homework/homework-tasks/get',
  HOMEWORK_UPDATE: '/admin-api/homework/homework-tasks/update',
  HOMEWORK_UPLOAD_ATTACHMENT: '/admin-api/homework/homework-tasks/upload-independent-attachment'
} as const;