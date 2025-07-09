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
  { label: '卧推带', value: 'benchBelt' },
  { label: '训练杆', value: 'trainingBar' },
  { label: '脚蹬魔力绳', value: 'pedalMagicBand' },
  { label: '阴力绳', value: 'resistanceBand' },
  { label: '杠铃', value: 'barbell' },
  { label: '哑铃', value: 'dumbbell' },
];
