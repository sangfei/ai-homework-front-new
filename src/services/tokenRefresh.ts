import { storage } from '../utils/storage';
import { authenticatedFetch } from '../utils/request';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// 定义Token事件类型
export enum TokenEventType {
  REFRESHED = 'token:refreshed',
  REFRESH_FAILED = 'token:refresh_failed',
  EXPIRED = 'token:expired',
  REFRESH_NEEDED = 'token:refresh_needed'
}

// 添加事件总线，用于通知token更新
export const tokenEvents = {
  // 使用函数返回新的事件实例，避免重用同一个事件对象
  tokenRefreshed: () => new CustomEvent(TokenEventType.REFRESHED),
  tokenRefreshFailed: () => new CustomEvent(TokenEventType.REFRESH_FAILED),
  tokenExpired: () => new CustomEvent(TokenEventType.EXPIRED),
  tokenRefreshNeeded: () => new CustomEvent(TokenEventType.REFRESH_NEEDED)
};

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
  private expirationTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshInterval = 15 * 60 * 1000; // 15分钟（900000毫秒）
  private tokenLifespan = 30 * 60 * 1000; // 假设token有效期为30分钟
  private maxRetries = 3;
  private retryDelay = 5000; // 5秒
  private lastRefreshTime = 0; // 记录上次刷新时间
  private minRefreshInterval = 60000; // 最小刷新间隔1分钟，防止频繁刷新
  private refreshPromise: Promise<boolean> | null = null; // 用于处理并发请求
  private tokenExpirationTime: number = 0; // token过期时间戳

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
    // 先停止现有的所有定时器
    this.stopAllTimers();
    
    // 计算token过期时间
    this.calculateTokenExpiration();
    
    console.log('🔄 启动自动刷新Token定时任务，间隔:', this.refreshInterval / 60000, '分钟');
    console.log('⏱️ Token预计过期时间:', new Date(this.tokenExpirationTime).toLocaleString());

    // 设置刷新定时器
    this.scheduleNextRefresh();
    
    // 设置过期提醒定时器
    this.scheduleExpirationReminder();
  }

  /**
   * 计算token过期时间
   */
  private calculateTokenExpiration(): void {
    // 从localStorage获取过期时间
    const expiresTimeStr = storage.getAuthData('expiresTime');
    if (expiresTimeStr) {
      // 如果有明确的过期时间，使用它
      this.tokenExpirationTime = parseInt(expiresTimeStr, 10);
    } else {
      // 否则使用当前时间加上预估的token寿命
      this.tokenExpirationTime = Date.now() + this.tokenLifespan;
    }
    
    console.log('⏱️ Token过期时间已计算:', new Date(this.tokenExpirationTime).toLocaleString());
  }

  /**
   * 安排下一次刷新
   */
  private scheduleNextRefresh(): void {
    // 清除现有的刷新定时器
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    // 计算下一次刷新的时间
    const now = Date.now();
    const timeUntilExpiration = Math.max(0, this.tokenExpirationTime - now);
    
    // 在过期前的refreshInterval时间刷新，或者如果已经接近过期，则立即刷新
    const timeUntilRefresh = Math.max(0, timeUntilExpiration - this.refreshInterval);
    
    console.log(`🔄 安排下一次刷新: ${timeUntilRefresh / 1000}秒后`);
    
    this.refreshTimer = setTimeout(async () => {
      await this.performTokenRefresh();
      // 刷新完成后，重新安排下一次刷新
      this.scheduleNextRefresh();
    }, timeUntilRefresh);
  }

  /**
   * 安排过期提醒
   */
  private scheduleExpirationReminder(): void {
    // 清除现有的过期定时器
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
    }
    
    // 计算到过期的时间
    const now = Date.now();
    const timeUntilExpiration = Math.max(0, this.tokenExpirationTime - now);
    
    // 在即将过期时（提前1分钟）触发提醒
    const reminderTime = Math.max(0, timeUntilExpiration - 60000);
    
    console.log(`⏰ 安排过期提醒: ${reminderTime / 1000}秒后`);
    
    this.expirationTimer = setTimeout(() => {
      console.warn('⚠️ Token即将过期，触发刷新');
      window.dispatchEvent(tokenEvents.tokenRefreshNeeded());
      this.performTokenRefresh();
    }, reminderTime);
  }

  /**
   * 停止所有定时器
   */
  private stopAllTimers(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
    
    console.log('⏹️ 已停止所有Token相关定时器');
  }

  /**
   * 停止自动刷新
   */
  stopAutoRefresh(): void {
    this.stopAllTimers();
    console.log('⏹️ 停止自动刷新Token定时任务');
  }

  /**
   * 执行Token刷新
   */
  private async performTokenRefresh(retryCount = 0): Promise<boolean> {
    // 如果已经有刷新操作在进行中，返回该Promise
    if (this.refreshPromise) {
      console.log('🔄 Token刷新正在进行中，复用现有Promise');
      return this.refreshPromise;
    }

    // 检查是否距离上次刷新时间太短
    const now = Date.now();
    if (this.lastRefreshTime > 0 && (now - this.lastRefreshTime) < this.minRefreshInterval) {
      console.log(`🔄 距离上次刷新时间太短(${(now - this.lastRefreshTime) / 1000}秒)，跳过本次刷新`);
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
    // 创建刷新Promise
    this.refreshPromise = (async () => {
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
        
        // 更新过期时间
        if (result.data.expiresTime) {
          this.updateExpirationTime(result.data.expiresTime);
        } else {
          // 如果后端没有返回明确的过期时间，使用默认值
          this.updateExpirationTime(Date.now() + this.tokenLifespan);
        }
        
        // 更新最后刷新时间
        this.lastRefreshTime = Date.now();
        
        console.log('✅ Token刷新成功');
        
        // 触发token刷新成功事件
        window.dispatchEvent(tokenEvents.tokenRefreshed());
        
        // 重新安排过期提醒
        this.scheduleExpirationReminder();
        
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
          // 不立即登出，但触发过期事件
          window.dispatchEvent(tokenEvents.tokenExpired());
          return false;
        }
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();
    
    return this.refreshPromise;
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
    
    // 触发token更新事件
    window.dispatchEvent(tokenEvents.tokenRefreshed());
  }
  
  /**
   * 更新Token过期时间
   */
  private updateExpirationTime(expiresTime: number): void {
    this.tokenExpirationTime = expiresTime;
    
    // 更新存储
    storage.setAuthData('expiresTime', expiresTime.toString());
    
    console.log('⏱️ Token过期时间已更新:', new Date(expiresTime).toLocaleString());
    
    // 重新安排刷新定时器
    this.scheduleNextRefresh();
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
      
      // 触发token刷新失败事件
      window.dispatchEvent(tokenEvents.tokenRefreshFailed());
      
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
    
    if (!accessToken || !refreshToken) {
      return false;
    }
    
    // 检查是否接近过期
    const now = Date.now();
    const timeUntilExpiration = Math.max(0, this.tokenExpirationTime - now);
    
    // 如果剩余时间小于刷新间隔，则需要刷新
    return timeUntilExpiration < this.refreshInterval;
  }
  
  /**
   * 获取当前token状态
   */
  getTokenStatus(): {
    isValid: boolean;
    expiresIn: number;
    expirationTime: number;
  } {
    const now = Date.now();
    const expiresIn = Math.max(0, this.tokenExpirationTime - now);
    
    return {
      isValid: expiresIn > 0,
      expiresIn,
      expirationTime: this.tokenExpirationTime
    };
  }
}

export const tokenRefreshManager = TokenRefreshManager.getInstance();