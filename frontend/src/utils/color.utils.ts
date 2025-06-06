/**
 * 预定义的颜色数组，使用固定的颜色排列
 */
const COLOR_PALETTE = [
  '#0000FF', // 纯蓝
  '#FF0000', // 纯红
  '#008000', // 橄榄绿
  '#FF00FF', // 品红
  '#CC9900', // 深黄
  '#00B3B3', // 青色
  '#CC6600', // 深橙
  '#8000FF', // 亮紫
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
