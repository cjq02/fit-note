import { List } from 'antd-mobile';

import type { Workout as WorkoutType } from '@/@typings/types.d.ts';
import { generateColorFromDate } from '@/utils/color.utils';
import { WorkoutItem } from './WorkoutItem';

interface WorkoutDayGroupProps {
  date: string;
  workouts: WorkoutType[];
  onDeleteSuccess: () => void;
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

  // 按项目名称字母顺序排序
  const sortedWorkouts = [...workouts].sort((a, b) => a.project.localeCompare(b.project));

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1.5 h-4 rounded-full"
          style={{
            background: `linear-gradient(to bottom, ${dateColor}, ${dateColor}99)`,
          }}
        />
        <div className="text-[15px] font-medium tracking-wide" style={{ color: dateColor }}>
          {date}
        </div>
        <div
          className="flex-1 h-[1px]"
          style={{
            background: `linear-gradient(to right, ${dateColor}33, transparent)`,
          }}
        />
      </div>
      <List>
        {sortedWorkouts.map(workout => (
          <WorkoutItem
            key={workout.id}
            workout={workout}
            workouts={workouts}
            onDeleteSuccess={onDeleteSuccess}
            dateColor={dateColor}
          />
        ))}
      </List>
    </div>
  );
};
