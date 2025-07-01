// 日期工具函数
import dayjs from 'dayjs';

/**
 * 格式化日期
 * @param date 日期对象或日期字符串
 * @param format 格式化模板，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

/**
 * 获取今天的日期字符串（YYYY-MM-DD）
 * @returns 今天的日期字符串
 */
export const getToday = (): string => {
  return formatDate(new Date());
};

/**
 * 判断是否是同一天
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 是否是同一天
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  return dayjs(date1).isSame(dayjs(date2), 'day');
};

/**
 * 获取日期所在周的起始日期和结束日期
 * @param date 日期对象或日期字符串
 * @returns 包含周起始日期和结束日期的对象
 */
export const getWeekRange = (date: Date | string) => {
  const d = dayjs(date);
  return {
    start: d.startOf('week').format('YYYY-MM-DD'),
    end: d.endOf('week').format('YYYY-MM-DD'),
  };
};

/**
 * 获取日期所在月的起始日期和结束日期
 * @param date 日期对象或日期字符串
 * @returns 包含月起始日期和结束日期的对象
 */
export const getMonthRange = (date: Date | string) => {
  const d = dayjs(date);
  return {
    start: d.startOf('month').format('YYYY-MM-DD'),
    end: d.endOf('month').format('YYYY-MM-DD'),
  };
};

/**
 * 获取一天中的时间段（上午/下午/晚上）
 * @param date 日期对象或日期字符串
 * @returns '上午' | '下午' | '晚上'
 */
export const getPeriodOfDay = (date: Date | string): '上午' | '下午' | '晚上' => {
  const hour = dayjs(date).hour();
  if (hour < 12) return '上午';
  if (hour < 18) return '下午';
  return '晚上';
};
