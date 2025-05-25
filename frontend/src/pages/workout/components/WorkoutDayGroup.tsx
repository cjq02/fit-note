import { List } from 'antd-mobile';

import type { Workout as WorkoutType } from '@/@typings/types.d.ts';
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
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-4 bg-gradient-to-b from-blue-500 to-sky-500 rounded-full"></div>
        <div className="text-[15px] font-medium text-blue-600 tracking-wide">{date}</div>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-blue-100 to-transparent"></div>
      </div>
      <List>
        {workouts.map(workout => (
          <WorkoutItem
            key={workout.id}
            workout={workout}
            workouts={workouts}
            onDeleteSuccess={onDeleteSuccess}
          />
        ))}
      </List>
    </div>
  );
};
