// 错误处理工具

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

export class HomeworkError extends Error {
  public code: number;
  public details?: any;

  constructor(message: string, code: number = 500, details?: any) {
    super(message);
    this.name = 'HomeworkError';
    this.code = code;
    this.details = details;
  }
}

/**
 * 统一的错误处理函数
 */
export const handleError = (error: unknown, context: string = '操作'): string => {
  console.error(`❌ ${context}失败:`, error);

  if (error instanceof HomeworkError) {
    return error.message;
  }

  if (error instanceof Error) {
    // 网络错误
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return `${context}失败：网络连接错误，请检查网络后重试`;
    }

    // 认证错误
    if (error.message.includes('401') || error.message.includes('认证')) {
      return `${context}失败：登录已过期，请重新登录`;
    }

    // 权限错误
    if (error.message.includes('403') || error.message.includes('权限')) {
      return `${context}失败：没有权限执行此操作`;
    }

    // 服务器错误
    if (error.message.includes('500') || error.message.includes('服务器')) {
      return `${context}失败：服务器内部错误，请稍后重试`;
    }

    return error.message;
  }

  return `${context}失败：未知错误，请稍后重试`;
};

/**
 * 创建带重试机制的异步函数
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context: string = '操作'
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${context} - 第${attempt}次尝试`);
      const result = await fn();
      console.log(`✅ ${context} - 第${attempt}次尝试成功`);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ ${context} - 第${attempt}次尝试失败:`, error);

      if (attempt < maxRetries) {
        console.log(`⏳ ${context} - ${delay}ms后进行第${attempt + 1}次重试`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // 指数退避
      }
    }
  }

  throw new HomeworkError(
    handleError(lastError, context),
    500,
    { attempts: maxRetries, lastError }
  );
};

/**
 * 验证响应数据格式
 */
export const validateResponse = (response: any, expectedFields: string[] = []): boolean => {
  if (!response || typeof response !== 'object') {
    throw new HomeworkError('响应数据格式错误');
  }

  if (typeof response.code !== 'number') {
    throw new HomeworkError('响应缺少状态码');
  }

  if (response.code !== 0) {
    throw new HomeworkError(response.msg || '服务器返回错误', response.code);
  }

  // 验证必需字段
  for (const field of expectedFields) {
    if (!(field in response.data)) {
      throw new HomeworkError(`响应缺少必需字段: ${field}`);
    }
  }

  return true;
};

/**
 * 安全的JSON解析
 */
export const safeJsonParse = (jsonString: string, defaultValue: any = null): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON解析失败:', error);
    return defaultValue;
  }
};

/**
 * 创建用户友好的错误消息
 */
export const createUserFriendlyError = (error: unknown, operation: string): string => {
  const baseMessage = handleError(error, operation);
  
  // 添加用户指导
  let guidance = '';
  
  if (baseMessage.includes('网络')) {
    guidance = '\n\n💡 解决建议：\n• 检查网络连接\n• 刷新页面重试\n• 联系网络管理员';
  } else if (baseMessage.includes('登录') || baseMessage.includes('认证')) {
    guidance = '\n\n💡 解决建议：\n• 点击重新登录\n• 清除浏览器缓存\n• 联系管理员重置账号';
  } else if (baseMessage.includes('权限')) {
    guidance = '\n\n💡 解决建议：\n• 联系管理员申请权限\n• 确认账号角色正确\n• 尝试使用其他账号';
  } else if (baseMessage.includes('服务器')) {
    guidance = '\n\n💡 解决建议：\n• 稍后重试\n• 联系技术支持\n• 检查系统公告';
  } else {
    guidance = '\n\n💡 如问题持续存在，请联系技术支持';
  }
  
  return baseMessage + guidance;
};