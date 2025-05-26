/**
 * 预定义的颜色数组，使用固定的颜色排列
 */
const COLOR_PALETTE = [
  '#3498DB', // 天蓝色
  '#E74C3C', // 红色
  '#2ECC71', // 翠绿色
  '#9B59B6', // 紫色
  '#F1C40F', // 金黄色
  '#1ABC9C', // 青绿色
  '#E67E22', // 橙色
  '#34495E', // 深青色
];

/**
 * 根据日期字符串生成一个固定的颜色
 *
 * @param {string} dateStr - 日期字符串，格式为 YYYY-MM-DD
 * @returns {string} 生成的颜色值，格式为 #RRGGBB
 */
export const generateColorFromDate = (dateStr: string): string => {
  // 将日期字符串转换为数字
  const dateNum = parseInt(dateStr.replace(/-/g, ''), 10);

  // 使用日期数字从预定义的颜色数组中选择一个颜色
  const colorIndex = dateNum % COLOR_PALETTE.length;
  return COLOR_PALETTE[colorIndex];
};
