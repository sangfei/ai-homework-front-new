import { getAccessToken, getTenantId, clearAccessToken } from '../services/auth';

// 请求拦截器 - 自动添加认证头
const createAuthenticatedRequest = (url: string, options: RequestInit = {}): RequestInit => {
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
  
  // 调试信息
  console.log('🌐 发送认证请求:', {
    url,
    method: options.method || 'GET',
    headers: requestOptions.headers,
    hasBody: !!options.body
  });
  
  try {
    const response = await fetch(url, requestOptions);
    
    console.log('📡 收到响应:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    // 如果返回401，说明token过期，清除token
    if (response.status === 401) {
      console.warn('🔒 认证失败，清除token并跳转登录页');
      clearAccessToken();
      // 可以在这里触发重新登录逻辑
      window.location.href = '/login';
    }
    
    return response;
  } catch (error) {
    console.error('🚨 请求失败:', {
      url,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
};

// 通用的API响应处理
export const handleApiResponse = async <T>(response: Response, context?: string): Promise<T> => {
  const logPrefix = context ? `[${context}]` : '';
  
  console.log(`${logPrefix} 📡 处理API响应:`, {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });
  
  if (!response.ok) {
    console.error(`${logPrefix} ❌ HTTP错误:`, response.status, response.statusText);
    throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
  }
  
  let result;
  try {
    result = await response.json();
    console.log(`${logPrefix} 📋 响应数据:`, result);
  } catch (error) {
    console.error(`${logPrefix} ❌ 解析JSON失败:`, error);
    throw new Error('服务器响应格式错误');
  }
  
  if (result.code !== 0) {
    console.error(`${logPrefix} ❌ 业务逻辑错误:`, result);
    throw new Error(result.msg || '请求失败');
  }
  
  console.log(`${logPrefix} ✅ API响应处理成功`);
  return result.data;
};