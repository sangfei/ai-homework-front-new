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

  // 用户登录状态相关的Cookie操作
  setLastLoginUsername(username: string): void {
    // 保存最后登录的用户名，有效期30天
    this.setCookie('lastLoginUsername', username, 30);
    console.log('💾 已保存最后登录用户名到Cookie:', username);
  }

  getLastLoginUsername(): string {
    const username = this.getCookie('lastLoginUsername');
    console.log('📖 从Cookie读取最后登录用户名:', username || '无');
    return username || '';
  }

  clearLastLoginUsername(): void {
    this.removeCookie('lastLoginUsername');
    console.log('🗑️ 已清除最后登录用户名Cookie');
  }

  // 记住密码功能相关的Cookie操作
  setRememberMe(username: string, remember: boolean): void {
    if (remember) {
      // 如果选择记住密码，保存用户名，有效期30天
      this.setCookie('rememberedUsername', username, 30);
      this.setCookie('rememberMe', 'true', 30);
      console.log('💾 已启用记住密码功能，用户名:', username);
    } else {
      // 如果不记住密码，清除相关Cookie
      this.removeCookie('rememberedUsername');
      this.removeCookie('rememberMe');
      console.log('🗑️ 已禁用记住密码功能');
    }
  }

  getRememberedUsername(): { username: string; rememberMe: boolean } {
    const username = this.getCookie('rememberedUsername') || '';
    const rememberMe = this.getCookie('rememberMe') === 'true';
    console.log('📖 从Cookie读取记住的用户信息:', { username, rememberMe });
    return { username, rememberMe };
  }

  clearRememberedUsername(): void {
    this.removeCookie('rememberedUsername');
    this.removeCookie('rememberMe');
    console.log('🗑️ 已清除记住的用户名Cookie');
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
    
    // 注意：不清除lastLoginUsername和rememberedUsername，这些应该保留
    console.log('🧹 已清除所有认证数据，但保留用户名记忆功能');
  }
}

export const storage = StorageManager.getInstance();