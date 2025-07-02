import { List } from 'antd-mobile';
import dayjs from 'dayjs';

import type { Workout as WorkoutType } from '@/@typings/types.d.ts';
import { generateColorFromDate } from '@/utils/color.utils';
import { WorkoutItem } from './WorkoutItem';

interface WorkoutDayGroupProps {
  date: string;
  workouts: WorkoutType[];
  onDeleteSuccess: () => void;
}

// 日期格式化函数
function formatDisplayDate(dateStr: string) {
  const date = dayjs(dateStr);
  const today = dayjs();
  const diff = today.startOf('day').diff(date.startOf('day'), 'day');
  const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
  const dateText = `${date.format('YYYY年M月D日')}，周${weekMap[date.day()]}`;
  if (diff === 0) return `今天（${dateText}）`;
  if (diff === 1) return `昨天（${dateText}）`;
  if (diff === 2) return `前天（${dateText}）`;
  return `${dateText}`;
}

/**
 * 按天分组的训练记录组件
 *
 * @param {WorkoutDayGroupProps} props - 组件属性
 * @returns {JSX.Element} 按天分组的训练记录
 */
export const WorkoutDayGroup = ({ date, workouts, onDeleteSuccess }: WorkoutDayGroupProps) => {
  // 生成基于日期的颜色
  const dateColor = generateColorFromDate(date);

  return (
    <div className="day-group mb-2 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 m-2">
        <div
          className="w-1.5 h-4 rounded-full"
          style={{
            background: `linear-gradient(to bottom, ${dateColor}, ${dateColor}99)`,
          }}
        />
        <div className="text-[15px] font-medium tracking-wide" style={{ color: dateColor }}>
          {formatDisplayDate(date)}
        </div>
        <div
          className="flex-1 h-[1px]"
          style={{
            background: `linear-gradient(to right, ${dateColor}33, transparent)`,
          }}
        />
      </div>
      {/* 覆盖adm-list-item-content的边框 */}
      <style>{`
        .adm-list-item-content {
          border: none !important;
        }
      `}</style>
      <List>
        <div className="py-2 bg-white">
          {workouts.map(workout => (
            <WorkoutItem
              key={workout.id}
              workout={workout}
              workouts={workouts}
              onDeleteSuccess={onDeleteSuccess}
              dateColor={dateColor}
            />
          ))}
        </div>
      </List>
    </div>
  );
};
