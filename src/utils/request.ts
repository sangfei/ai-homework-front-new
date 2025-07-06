import { getAccessToken, getTenantId, clearAccessToken } from '../services/auth';

// 请求拦截器 - 自动添加认证头
export const createAuthenticatedRequest = (url: string, options: RequestInit = {}): RequestInit => {
  const token = getAccessToken();
  const tenantId = getTenantId();
  
  // 创建新的headers对象，避免修改原始options
  const headers: Record<string, string> = {
    'Accept': '*/*',
  };

  // 复制现有的headers，但要小心处理Content-Type
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.keys(existingHeaders).forEach(key => {
      // 跳过Content-Type，我们会统一处理
      if (key.toLowerCase() !== 'content-type') {
        headers[key] = existingHeaders[key];
      }
    });
  }

  // 只有在需要发送JSON数据的请求中才设置Content-Type
  if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase()) && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  // 如果有token，添加Authorization头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 如果有租户ID，添加tenant-id头
  if (tenantId) {
    headers['tenant-id'] = tenantId;
  }

  return {
    ...options,
    headers,
  };
};

// 通用的fetch包装器，自动处理认证
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const requestOptions = createAuthenticatedRequest(url, options);
  
  try {
    const response = await fetch(url, requestOptions);
    
    // 如果返回401，说明token过期，清除token
    if (response.status === 401) {
      clearAccessToken();
      // 可以在这里触发重新登录逻辑
      window.location.href = '/login';
    }
    
    return response;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
};

// 通用的API响应处理
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  
  if (result.code !== 0) {
    throw new Error(result.msg || '请求失败');
  }
  
  return result.data;
};