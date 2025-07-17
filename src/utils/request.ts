import { getAccessToken, getTenantId, clearAccessToken } from '../services/auth';
import { tokenEvents } from '../services/tokenRefresh';

// 请求拦截器 - 自动添加认证头
const createAuthenticatedRequest = (url: string, options: RequestInit = {}): RequestInit => {
  // 每次请求时动态获取最新token
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

// 请求队列，用于存储401时的请求
let pendingRequests: Array<() => Promise<Response>> = [];
let isRefreshing = false;

// 监听token刷新事件
window.addEventListener('tokenRefreshed', () => {
  console.log('🔄 检测到token已刷新，重试所有等待的请求');
  // 重试所有等待的请求
  const requests = [...pendingRequests];
  pendingRequests = [];
  requests.forEach(callback => callback());
});

// 通用的fetch包装器，自动处理认证
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // 创建请求函数
  const executeRequest = async (): Promise<Response> => {
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
      
      // 如果返回401，说明token可能过期
      if (response.status === 401) {
        console.warn('🔒 认证失败 (401)，尝试刷新token');
        
        // 如果已经在刷新token，将请求加入等待队列
        if (isRefreshing) {
          console.log('🔄 Token刷新已在进行中，将请求加入等待队列');
          return new Promise<Response>((resolve) => {
            pendingRequests.push(() => {
              console.log('🔁 重试请求:', url);
              executeRequest().then(resolve);
            });
          });
        }
        
        // 标记正在刷新
        isRefreshing = true;
        
        try {
          // 导入tokenRefreshManager (使用动态导入避免循环依赖)
          const { tokenRefreshManager } = await import('../services/tokenRefresh');
          
          // 尝试刷新token
          const refreshed = await tokenRefreshManager.manualRefresh();
          
          if (refreshed) {
            console.log('✅ Token刷新成功，重试原始请求');
            isRefreshing = false;
            // 重试当前请求
            return executeRequest();
          } else {
            console.error('❌ Token刷新失败，清除token并跳转登录页');
            clearAccessToken();
            window.location.href = '/login';
            throw new Error('认证失败，请重新登录');
          }
        } catch (refreshError) {
          console.error('❌ Token刷新过程出错:', refreshError);
          isRefreshing = false;
          clearAccessToken();
          window.location.href = '/login';
          throw new Error('认证失败，请重新登录');
        }
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
  
  return executeRequest();
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
  
  // 检查后端返回的认证错误
  if (result.msg === '账号未登录') {
    console.warn(`${logPrefix} 🔒 检测到后端认证失败，清除token并跳转登录页`);
    clearAccessToken();
    window.location.href = '/login';
    throw new Error('账号未登录，请重新登录');
  }
  
  if (result.code !== 0) {
    console.error(`${logPrefix} ❌ 业务逻辑错误:`, result);
    throw new Error(result.msg || '请求失败');
  }
  
  console.log(`${logPrefix} ✅ API响应处理成功`);
  return result.data;
};