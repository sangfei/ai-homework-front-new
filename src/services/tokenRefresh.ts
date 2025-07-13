import { storage } from '../utils/storage';
import { authenticatedFetch } from '../utils/request';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// Token刷新响应接口
interface RefreshTokenResponse {
  code: number;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresTime: number;
  };
  msg: string;
}

// Token刷新管理器
export class TokenRefreshManager {
  private static instance: TokenRefreshManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshInterval = 10 * 60 * 1000; // 10分钟（600000毫秒）
  private maxRetries = 3;
  private retryDelay = 5000; // 5秒
  private lastRefreshTime = 0; // 记录上次刷新时间
  private minRefreshInterval = 60000; // 最小刷新间隔1分钟，防止频繁刷新

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager();
    }
    return TokenRefreshManager.instance;
  }

  /**
   * 启动自动刷新Token定时任务
   */
  startAutoRefresh(): void {
    this.stopAutoRefresh(); // 先停止现有的定时器
    
    console.log('🔄 启动自动刷新Token定时任务，间隔:', this.refreshInterval / 60000, '分钟');
    
    this.refreshTimer = setInterval(async () => {
      await this.performTokenRefresh();
    }, this.refreshInterval);

    // 延迟30秒后执行第一次检查，避免页面加载时立即刷新
    setTimeout(() => {
      this.performTokenRefresh();
    }, 30000);
  }

  /**
   * 停止自动刷新
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log('⏹️ 停止自动刷新Token定时任务');
    }
  }

  /**
   * 执行Token刷新
   */
  private async performTokenRefresh(retryCount = 0): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('🔄 Token刷新正在进行中，跳过本次刷新');
      return false;
    }

    // 检查是否距离上次刷新时间太短
    const now = Date.now();
    if (this.lastRefreshTime > 0 && (now - this.lastRefreshTime) < this.minRefreshInterval) {
      console.log('🔄 距离上次刷新时间太短，跳过本次刷新');
      return false;
    }

    const refreshToken = storage.getAuthData('refreshToken');
    const accessToken = storage.getAuthData('accessToken');
    const tenantId = storage.getAuthData('tenantId');

    if (!refreshToken || !accessToken || !tenantId) {
      console.warn('⚠️ 缺少必要的认证信息，但不强制登出');
      return false;
    }

    this.isRefreshing = true;

    try {
      console.log('🔄 开始刷新Token...');
      
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.REFRESH_TOKEN),
        {
          method: 'POST',
          headers: {
            'tenant-id': tenantId,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
            'Cache-Control': 'no-cache'
          },
          body: new URLSearchParams({ refreshToken }).toString()
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
      }

      const result: RefreshTokenResponse = await response.json();

      if (result.code !== 0) {
        throw new Error(result.msg || 'Token刷新失败');
      }

      if (!result.data || !result.data.accessToken || !result.data.refreshToken) {
        throw new Error('Token刷新响应数据异常');
      }

      // 更新Token
      this.updateTokens(result.data.accessToken, result.data.refreshToken);
      
      // 更新最后刷新时间
      this.lastRefreshTime = Date.now();
      
      console.log('✅ Token刷新成功');
      return true;

    } catch (error) {
      console.error('❌ Token刷新失败:', error);
      
      // 重试机制
      if (retryCount < this.maxRetries) {
        console.log(`🔄 ${this.retryDelay / 1000}秒后进行第${retryCount + 1}次重试...`);
        setTimeout(() => {
          this.performTokenRefresh(retryCount + 1);
        }, this.retryDelay);
        return false;
      } else {
        console.error('❌ Token刷新重试次数已达上限，但继续保持登录状态');
        // 不立即登出，而是等待下次定时刷新
        return false;
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 更新Token到全局变量和存储
   */
  private updateTokens(accessToken: string, refreshToken: string): void {
    // 更新全局变量
    (window as any).globalAccessToken = accessToken;
    (window as any).globalRefreshToken = refreshToken;

    // 更新存储
    storage.setAuthData('accessToken', accessToken);
    storage.setAuthData('refreshToken', refreshToken);
    
    // 刷新成功，重置失败计数
    this.resetFailureCount();

    console.log('🔄 Token已更新到全局变量和存储');
  }

  /**
   * 处理刷新失败（仅在严重错误时调用）
   */
  private handleRefreshFailure(): void {
    // 只有在连续多次失败且确认Token完全无效时才执行登出
    const consecutiveFailures = this.getConsecutiveFailureCount();
    
    if (consecutiveFailures >= 5) { // 连续5次失败才登出
      console.warn('⚠️ Token连续多次刷新失败，执行登出');
      
      this.stopAutoRefresh();
      
      // 清除认证数据
      storage.clearAllAuthData();
      
      // 通知用户重新登录
      window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));
      
      // 跳转到登录页
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      console.warn('⚠️ Token刷新失败，但继续尝试');
      this.incrementFailureCount();
    }
  }

  /**
   * 获取连续失败次数
   */
  private getConsecutiveFailureCount(): number {
    const count = localStorage.getItem('tokenRefreshFailureCount');
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * 增加失败次数
   */
  private incrementFailureCount(): void {
    const count = this.getConsecutiveFailureCount() + 1;
    localStorage.setItem('tokenRefreshFailureCount', count.toString());
  }

  /**
   * 重置失败次数
   */
  private resetFailureCount(): void {
    localStorage.removeItem('tokenRefreshFailureCount');
  }

  /**
   * 手动刷新Token
   */
  async manualRefresh(): Promise<boolean> {
    return await this.performTokenRefresh();
  }

  /**
   * 检查是否需要刷新Token
   */
  shouldRefreshToken(): boolean {
    const accessToken = storage.getAuthData('accessToken');
    const refreshToken = storage.getAuthData('refreshToken');
    return !!(accessToken && refreshToken);
  }
}

export const tokenRefreshManager = TokenRefreshManager.getInstance();