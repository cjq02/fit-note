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
  '#C0C0C0', // 银色
  '#006633', // 深绿
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

/**
 * 根据类别字符串生成一个固定的颜色
 *
 * @param {string} category - 类别字符串
 * @returns {string} 生成的颜色值，格式为 #RRGGBB
 */
export const generateColorFromCategory = (category: string): string => {
  const CATEGORY_COLOR_MAP: Record<string, string> = {
    Chest: '#FF7043', // 橘红
    Back: '#29B6F6', // 亮天蓝
    Shoulders: '#AB47BC', // 紫罗兰
    Arms: '#FFC107', // 金黄
    Legs: '#66BB6A', // 草绿
    Abs: '#EF5350', // 鲜红
    Cardio: '#26C6DA', // 青蓝
    Core: '#8D6E63', // 深棕
  };
  return CATEGORY_COLOR_MAP[category] || '#B0BEC5'; // 默认浅蓝灰
};
