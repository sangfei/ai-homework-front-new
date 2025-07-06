// 日期时间工具函数

/**
 * 将日期时间字符串转换为时间戳
 * @param dateTimeString - 格式为 YYYY-MM-DDTHH:mm 的日期时间字符串
 * @returns 时间戳（毫秒）
 */
export const dateTimeToTimestamp = (dateTimeString: string): number => {
  return new Date(dateTimeString).getTime();
};

/**
 * 将时间戳转换为日期时间字符串
 * @param timestamp - 时间戳（毫秒）
 * @returns 格式为 YYYY-MM-DDTHH:mm 的日期时间字符串
 */
export const timestampToDateTime = (timestamp: number): string => {
  return new Date(timestamp).toISOString().slice(0, 16);
};

/**
 * 获取当前时间的日期时间字符串
 * @returns 格式为 YYYY-MM-DDTHH:mm 的当前时间字符串
 */
export const getCurrentDateTime = (): string => {
  return new Date().toISOString().slice(0, 16);
};

/**
 * 获取明天上午9点的日期时间字符串
 * @returns 格式为 YYYY-MM-DDTHH:mm 的明天上午9点时间字符串
 */
export const getTomorrowMorning = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow.toISOString().slice(0, 16);
};

/**
 * 格式化时间戳为可读的日期时间字符串
 * @param timestamp - 时间戳（毫秒）
 * @param options - 格式化选项
 * @returns 格式化后的日期时间字符串
 */
export const formatTimestamp = (
  timestamp: number, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  return new Date(timestamp).toLocaleString('zh-CN', options);
};

/**
 * 验证日期时间字符串是否有效
 * @param dateTimeString - 日期时间字符串
 * @returns 是否有效
 */
export const isValidDateTime = (dateTimeString: string): boolean => {
  const date = new Date(dateTimeString);
  return !isNaN(date.getTime());
};

/**
 * 比较两个日期时间字符串
 * @param dateTime1 - 第一个日期时间字符串
 * @param dateTime2 - 第二个日期时间字符串
 * @returns -1: dateTime1 < dateTime2, 0: 相等, 1: dateTime1 > dateTime2
 */
export const compareDateTimes = (dateTime1: string, dateTime2: string): number => {
  const timestamp1 = new Date(dateTime1).getTime();
  const timestamp2 = new Date(dateTime2).getTime();
  
  if (timestamp1 < timestamp2) return -1;
  if (timestamp1 > timestamp2) return 1;
  return 0;
};