import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';
import isLeapYear from 'dayjs/plugin/isLeapYear';

// 初始化 dayjs
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(isLeapYear);


/**
 * 格式化日期字符串
 * @param {string | Date} date - 要格式化的日期，可以是日期字符串或 Date 对象
 * @param {string} format - 格式化模板，支持以下占位符：
 *   - YYYY: 四位年份
 *   - YY: 两位年份
 *   - MM: 两位月份
 *   - M: 一位月份
 *   - DD: 两位日期
 *   - D: 一位日期
 *   - HH: 两位小时（24小时制）
 *   - H: 一位小时（24小时制）
 *   - hh: 两位小时（12小时制）
 *   - h: 一位小时（12小时制）
 *   - mm: 两位分钟
 *   - m: 一位分钟
 *   - ss: 两位秒数
 *   - s: 一位秒数
 *   - A: 上午/下午（大写）
 *   - a: 上午/下午（小写）
 * @returns {string} 格式化后的日期字符串
 * @example
 * formatDate('2024-03-20', 'YYYY年MM月DD日') // 返回 '2024年03月20日'
 * formatDate('2024-03-20', 'YYYY/MM/DD HH:mm:ss') // 返回 '2024/03/20 00:00:00'
 */
export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};
/**
 * 日期工具包
 * 基于 dayjs 的日期处理方法
 */

/**
 * 获取今天的日期字符串
 * @returns {string} 返回格式为 'YYYY-MM-DD' 的日期字符串
 */
export const getTodayString = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

/**
 * 获取指定日期的字符串
 * @param {Date | string} date - 日期对象或日期字符串
 * @returns {string} 返回格式为 'YYYY-MM-DD' 的日期字符串
 */
export const getDateString = (date: Date | string): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * 获取指定日期是星期几
 * @param {string} dateString - 格式为 'YYYY-MM-DD' 的日期字符串
 * @returns {number} 返回 0-6，0 表示星期日，1-6 表示星期一至星期六
 */
export const getDayOfWeek = (dateString: string): number => {
  return dayjs(dateString).day();
};

/**
 * 获取指定日期所在月份的第一天
 * @param {string} dateString - 格式为 'YYYY-MM-DD' 的日期字符串
 * @returns {string} 返回格式为 'YYYY-MM-DD' 的日期字符串
 */
export const getFirstDayOfMonth = (dateString: string): string => {
  return dayjs(dateString).startOf('month').format('YYYY-MM-DD');
};

/**
 * 获取指定日期所在月份的最后一天
 * @param {string} dateString - 格式为 'YYYY-MM-DD' 的日期字符串
 * @returns {string} 返回格式为 'YYYY-MM-DD' 的日期字符串
 */
export const getLastDayOfMonth = (dateString: string): string => {
  return dayjs(dateString).endOf('month').format('YYYY-MM-DD');
};

/**
 * 获取指定日期所在周的第一天（周一）
 * @param {string} dateString - 格式为 'YYYY-MM-DD' 的日期字符串
 * @returns {string} 返回格式为 'YYYY-MM-DD' 的日期字符串
 */
export const getFirstDayOfWeek = (dateString: string): string => {
  return dayjs(dateString).startOf('isoWeek').format('YYYY-MM-DD');
};

/**
 * 获取指定日期所在周的最后一天（周日）
 * @param {string} dateString - 格式为 'YYYY-MM-DD' 的日期字符串
 * @returns {string} 返回格式为 'YYYY-MM-DD' 的日期字符串
 */
export const getLastDayOfWeek = (dateString: string): string => {
  return dayjs(dateString).endOf('isoWeek').format('YYYY-MM-DD');
};

/**
 * 获取指定日期前/后n天的日期
 * @param {string} dateString - 格式为 'YYYY-MM-DD' 的日期字符串
 * @param {number} days - 天数，正数表示后n天，负数表示前n天
 * @returns {string} 返回格式为 'YYYY-MM-DD' 的日期字符串
 */
export const addDays = (dateString: string, days: number): string => {
  return dayjs(dateString).add(days, 'day').format('YYYY-MM-DD');
};

/**
 * 判断两个日期字符串是否为同一天
 * @param {string} date1 - 格式为 'YYYY-MM-DD' 的日期字符串
 * @param {string} date2 - 格式为 'YYYY-MM-DD' 的日期字符串
 * @returns {boolean} 如果两个日期是同一天返回 true，否则返回 false
 */
export const isSameDay = (date1: string, date2: string): boolean => {
  return dayjs(date1).isSame(date2, 'day');
};

/**
 * 判断日期字符串是否为今天
 * @param {string} dateString - 格式为 'YYYY-MM-DD' 的日期字符串
 * @returns {boolean} 如果是今天返回 true，否则返回 false
 */
export const isToday = (dateString: string): boolean => {
  return dayjs(dateString).isSame(dayjs(), 'day');
};

/**
 * 获取两个日期之间的天数差
 * @param {string} date1 - 格式为 'YYYY-MM-DD' 的日期字符串
 * @param {string} date2 - 格式为 'YYYY-MM-DD' 的日期字符串
 * @returns {number} 返回两个日期之间的天数差
 */
export const getDaysDiff = (date1: string, date2: string): number => {
  return dayjs(date2).diff(dayjs(date1), 'day');
};

/**
 * 判断日期是否在指定范围内
 * @param {string} date - 要检查的日期字符串
 * @param {string} start - 范围开始日期字符串
 * @param {string} end - 范围结束日期字符串
 * @param {string} unit - 比较单位，默认为 'day'
 * @returns {boolean} 如果日期在范围内返回 true，否则返回 false
 */
export const isDateBetween = (
  date: string,
  start: string,
  end: string,
  unit: 'day' | 'week' | 'month' | 'year' = 'day'
): boolean => {
  return dayjs(date).isBetween(start, end, unit, '[]');
};

/**
 * 获取指定日期所在月份的天数
 * @param {string} dateString - 格式为 'YYYY-MM-DD' 的日期字符串
 * @returns {number} 返回月份的天数
 */
export const getDaysInMonth = (dateString: string): number => {
  return dayjs(dateString).daysInMonth();
};

/**
 * 获取指定日期所在年份的天数
 * @param {string} dateString - 格式为 'YYYY-MM-DD' 的日期字符串
 * @returns {number} 返回年份的天数（365或366）
 */
export const getDaysInYear = (dateString: string): number => {
  return dayjs(dateString).isLeapYear() ? 366 : 365;
};

/**
 * 获取指定日期所在月份的所有日期
 * @param {string} dateString - 格式为 'YYYY-MM-DD' 的日期字符串
 * @returns {string[]} 返回该月所有日期的数组
 */
export const getDatesInMonth = (dateString: string): string[] => {
  const daysInMonth = getDaysInMonth(dateString);
  const dates: string[] = [];
  const date = dayjs(dateString).startOf('month');

  for (let i = 0; i < daysInMonth; i++) {
    dates.push(date.add(i, 'day').format('YYYY-MM-DD'));
  }

  return dates;
};