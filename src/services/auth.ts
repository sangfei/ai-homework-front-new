import { tokenRefreshManager } from './tokenRefresh';
import type { UserProfile } from './user';
import { storage } from '../utils/storage';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
// 认证服务
interface TenantResponse {
  code: number;
  data: string;
  msg: string;
}

interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface LoginResponse {
  code: number;
  data: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    expiresTime: number;
  };
  msg: string;
}

// 全局变量存储访问令牌
let globalTenantId: string | null = null;
let globalUserId: string | null = null;
let globalAccessToken: string | null = null;
let globalRefreshToken: string | null = null;
let globalUserProfile: UserProfile | null = null;

// 将全局变量暴露到window对象，方便调试和其他模块访问
(window as any).globalAuth = {
  getTenantId: () => globalTenantId,
  getUserId: () => globalUserId,
  getAccessToken: () => globalAccessToken,
  getRefreshToken: () => globalRefreshToken,
  getUserProfile: () => globalUserProfile
};

export const getAccessToken = (): string | null => globalAccessToken;
export const getTenantId = (): string | null => globalTenantId;
const getUserId = (): string | null => globalUserId;
const getRefreshToken = (): string | null => globalRefreshToken;
export const getUserProfile = (): UserProfile | null => globalUserProfile;

// 设置认证数据（同时保存到全局变量和存储）
const setAuthData = (data: {
  tenantId?: string;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
}): void => {
  if (data.tenantId) {
    globalTenantId = data.tenantId;
    storage.setAuthData('tenantId', data.tenantId);
  }
  
  if (data.userId) {
    globalUserId = data.userId;
    storage.setAuthData('userId', data.userId);
  }
  
  if (data.accessToken) {
    globalAccessToken = data.accessToken;
    storage.setAuthData('accessToken', data.accessToken);
  }
  
  if (data.refreshToken) {
    globalRefreshToken = data.refreshToken;
    storage.setAuthData('refreshToken', data.refreshToken);
  }
  
  console.log('🔐 认证数据已保存到全局变量和存储');
};

// 设置用户信息
export const setUserProfile = (profile: UserProfile): void => {
  globalUserProfile = profile;
  storage.setAuthData('userProfile', JSON.stringify(profile));
  console.log('👤 用户信息已保存到全局变量和存储');
};

// 兼容旧的方法
const setAccessToken = (token: string): void => {
  globalAccessToken = token;
  storage.setAuthData('accessToken', token);
};

const setTenantId = (tenantId: string): void => {
  globalTenantId = tenantId;
  storage.setAuthData('tenantId', tenantId);
};

// 清除所有认证数据
export const clearAccessToken = (): void => {
  globalTenantId = null;
  globalUserId = null;
  globalAccessToken = null;
  globalRefreshToken = null;
  globalUserProfile = null;
  
  storage.clearAllAuthData();
  
  // 停止Token自动刷新
  tokenRefreshManager.stopAutoRefresh();
  
  console.log('🔐 所有认证数据已清除');
};

// 初始化时从存储恢复认证数据
export const initializeAuth = (): void => {
  const savedTenantId = storage.getAuthData('tenantId');
  const savedUserId = storage.getAuthData('userId');
  const savedAccessToken = storage.getAuthData('accessToken');
  const savedRefreshToken = storage.getAuthData('refreshToken');
  const savedUserProfile = storage.getAuthData('userProfile');
  
  if (savedTenantId) {
    globalTenantId = savedTenantId;
  }
  
  if (savedUserId) {
    globalUserId = savedUserId;
  }
  
  if (savedAccessToken) {
    globalAccessToken = savedAccessToken;
  }
  
  if (savedRefreshToken) {
    globalRefreshToken = savedRefreshToken;
  }
  
  if (savedUserProfile) {
    try {
      globalUserProfile = JSON.parse(savedUserProfile);
    } catch (error) {
      console.error('解析用户信息失败:', error);
      storage.removeAuthData('userProfile');
    }
  }
  
  // 如果有有效的Token，启动自动刷新
  if (savedAccessToken && savedRefreshToken) {
    console.log('🔐 认证数据已恢复，将在30秒后启动自动刷新Token');
    tokenRefreshManager.startAutoRefresh();
  } else {
    console.log('🔐 未找到有效的认证数据');
  }
};

/**
 * 第一步：根据手机号获取租户ID
 */
const getTenantIdByMobile = async (mobile: string): Promise<string> => {
  try {
    const response = await fetch(
      `${buildApiUrl(API_ENDPOINTS.GET_TENANT_BY_MOBILE)}?mobile=${encodeURIComponent(mobile)}`,
      {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'no-cache'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }

    const result: TenantResponse = await response.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || '获取租户ID失败');
    }

    if (!result.data) {
      throw new Error('未找到对应的租户信息');
    }

    return result.data;
  } catch (error) {
    console.error('获取租户ID失败:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络请求失败，请检查网络连接');
  }
};

/**
 * 第二步：执行登录
 */
const performLogin = async (
  username: string, 
  password: string, 
  tenantId: string
): Promise<LoginResponse['data']> => {
  try {
    const loginData: LoginRequest = {
      username,
      password,
      rememberMe: true
    };

    const response = await fetch(
      buildApiUrl(API_ENDPOINTS.LOGIN),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'tenant-id': tenantId,
          'Accept': '*/*',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(loginData)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }

    const result: LoginResponse = await response.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || '登录失败');
    }

    if (!result.data || !result.data.accessToken) {
      throw new Error('登录响应数据异常');
    }

    // 保存访问令牌到全局变量
    setAuthData({
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      userId: result.data.userId
    });

    return result.data;
  } catch (error) {
    console.error('登录失败:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络请求失败，请检查网络连接');
  }
};

/**
 * 完整的登录流程
 */
export const loginWithMobile = async (
  mobile: string, 
  password: string
): Promise<LoginResponse['data']> => {
  try {
    // 第一步：获取租户ID
    const tenantId = await getTenantIdByMobile(mobile);
    
    // 保存租户ID
    setAuthData({ tenantId });
    
    // 第二步：执行登录
    const loginResult = await performLogin(mobile, password, tenantId);
    
    // 启动自动刷新Token
    tokenRefreshManager.startAutoRefresh();
    
    return loginResult;
  } catch (error) {
    console.error('完整登录流程失败:', error);
    throw error;
  }
};