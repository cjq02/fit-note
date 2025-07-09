export * from './date.utils';

/**
 * 重量单位选项
 * @type {{ label: string; value: string }[]}
 */
export const UNIT_OPTIONS = [
  { label: '自重', value: '自重' },
  { label: 'kg', value: 'kg' },
  { label: '磅', value: '磅' },
  { label: '分钟', value: '分钟' },
  { label: '米', value: '米' },
  { label: '公里', value: '公里' },
];

/**
 * 器械选项
 * @type {{ label: string; value: string }[]}
 */
export const EQUIPMENT_OPTIONS = [
  // 珊瑚红
  { label: '卧推带', value: 'benchBelt', color: '#FF6B6B' },
  // 薄荷绿
  { label: '训练杆', value: 'trainingBar', color: '#4ECDC4' },
  // 柠檬黄
  { label: '脚蹬', value: 'pedalMagicBand', color: '#FFD93D' },
  // 深青色
  { label: '门扣', value: 'doorAnchor', color: '#1A535C' },
  // 橙色
  { label: '把手', value: 'handle', color: '#FF922B' },
  // 靛蓝色
  { label: '握把', value: 'grip', color: '#5F6CAF' },
  // 草绿色
  { label: '阴力绳', value: 'resistanceBand', color: '#6BCB77' },
  // 粉红色
  { label: '俯卧撑架', value: 'pushUpBar', color: '#FF6F91' },
  // 紫色
  { label: '健腹轮', value: 'abWheel', color: '#845EC2' },
  // 金黄色
  { label: '杠铃', value: 'barbell', color: '#FFC75F' },
  // 天蓝色
  { label: '哑铃', value: 'dumbbell', color: '#0081CF' },
  // 淡紫色
  { label: '单杠', value: 'pullUpBar', color: '#B39CD0' },
];
