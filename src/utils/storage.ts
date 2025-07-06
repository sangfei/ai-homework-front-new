// 存储工具类 - 统一管理localStorage和Cookie
export class StorageManager {
  private static instance: StorageManager;

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // Cookie操作
  setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  }

  getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  removeCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  // 同时保存到localStorage和Cookie
  setAuthData(key: string, value: string): void {
    localStorage.setItem(key, value);
    this.setCookie(key, value, 7); // 7天过期
  }

  getAuthData(key: string): string | null {
    // 优先从localStorage获取，如果没有则从Cookie获取
    return localStorage.getItem(key) || this.getCookie(key);
  }

  removeAuthData(key: string): void {
    localStorage.removeItem(key);
    this.removeCookie(key);
  }

  // 清除所有认证数据
  clearAllAuthData(): void {
    const authKeys = ['tenantId', 'userId', 'accessToken', 'refreshToken', 'userProfile'];
    authKeys.forEach(key => {
      this.removeAuthData(key);
    });
  }
}

export const storage = StorageManager.getInstance();