// 时区和日期处理工具类
export class DateUtils {
  // 东八区时区偏移（UTC+8）
  private static readonly CHINA_TIMEZONE_OFFSET = 8 * 60; // 8小时 = 480分钟

  /**
   * 获取东八区当前时间
   */
  static getChinaTime(): Date {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (DateUtils.CHINA_TIMEZONE_OFFSET * 60000));
  }

  /**
   * 将任意日期转换为东八区时间
   */
  static toChinaTime(date: Date): Date {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (DateUtils.CHINA_TIMEZONE_OFFSET * 60000));
  }

  /**
   * 获取东八区指定日期的0点0分0秒
   */
  static getChinaDateStart(date: Date): Date {
    const chinaTime = DateUtils.toChinaTime(date);
    chinaTime.setHours(0, 0, 0, 0);
    return chinaTime;
  }

  /**
   * 获取东八区当日0点0分0秒
   */
  static getTodayStart(): Date {
    return DateUtils.getChinaDateStart(DateUtils.getChinaTime());
  }

  /**
   * 获取东八区明日上午9点
   */
  static getTomorrowNineAM(): Date {
    const tomorrow = DateUtils.getChinaTime();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }

  /**
   * 将东八区时间转换为datetime-local格式（YYYY-MM-DDTHH:mm）
   */
  static toDateTimeLocal(date: Date): string {
    const chinaTime = DateUtils.toChinaTime(date);
    const year = chinaTime.getFullYear();
    const month = String(chinaTime.getMonth() + 1).padStart(2, '0');
    const day = String(chinaTime.getDate()).padStart(2, '0');
    const hours = String(chinaTime.getHours()).padStart(2, '0');
    const minutes = String(chinaTime.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * 将datetime-local格式转换为东八区时间戳
   */
  static fromDateTimeLocal(dateTimeString: string): number {
    // 解析datetime-local字符串（假设输入已经是东八区时间）
    const date = new Date(dateTimeString);
    
    // 由于datetime-local输入被浏览器当作本地时间处理，
    // 我们需要调整为东八区时间
    const localOffset = date.getTimezoneOffset(); // 本地时区偏移（分钟）
    const chinaOffset = -480; // 东八区偏移（UTC+8 = -480分钟）
    const offsetDiff = localOffset - chinaOffset;
    
    return date.getTime() + (offsetDiff * 60000);
  }

  /**
   * 将东八区时间转换为YYYY-MM-DD格式（用于API接口）
   */
  static toDateString(date: Date): string {
    const chinaTime = DateUtils.toChinaTime(date);
    const year = chinaTime.getFullYear();
    const month = String(chinaTime.getMonth() + 1).padStart(2, '0');
    const day = String(chinaTime.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * 从时间戳创建东八区日期字符串
   */
  static timestampToDateString(timestamp: number): string {
    const date = new Date(timestamp);
    return DateUtils.toDateString(date);
  }

  /**
   * 验证日期时间逻辑
   */
  static validateDateTimeLogic(publishTime: number, ddlTime: number): string | null {
    if (ddlTime <= publishTime) {
      return '截止时间必须晚于发布时间';
    }
    
    const now = DateUtils.getChinaTime().getTime();
    if (publishTime < now - 24 * 60 * 60 * 1000) { // 允许1天的回溯
      return '发布时间不能早于昨天';
    }
    
    return null;
  }

  /**
   * 格式化显示时间（东八区）
   */
  static formatDisplayTime(timestamp: number): string {
    const date = new Date(timestamp);
    const chinaTime = DateUtils.toChinaTime(date);
    
    return chinaTime.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}

// 导出常用的快捷方法
export const {
  getChinaTime,
  toChinaTime,
  getChinaDateStart,
  getTodayStart,
  getTomorrowNineAM,
  toDateTimeLocal,
  fromDateTimeLocal,
  toDateString,
  timestampToDateString,
  validateDateTimeLogic,
  formatDisplayTime
} = DateUtils;