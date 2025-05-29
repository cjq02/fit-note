import React from 'react';
import type { WorkoutWeekStats } from '@/@typings/types.d.ts';

interface WorkoutWeekGroupProps {
  /**
   * 周一的日期
   */
  weekKey: string;
  /**
   * 该周的训练项目统计信息
   */
  projects: WorkoutWeekStats[];
}

/**
 * 每周训练内容组件
 *
 * @param {WorkoutWeekGroupProps} props - 组件属性
 * @returns {JSX.Element} 每周训练内容组件
 */
export const WorkoutWeekGroup: React.FC<WorkoutWeekGroupProps> = ({ weekKey, projects }) => {
  // 将周一的日期转换为更友好的显示格式
  const weekDate = new Date(weekKey);
  const weekEnd = new Date(weekDate);
  weekEnd.setDate(weekDate.getDate() + 6);
  const weekDisplay = `${weekDate.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })} - ${weekEnd.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}`;

  return (
    <div className="mb-4">
      <div className="text-lg font-semibold text-gray-700 mb-2">{weekDisplay}</div>
      <div className="space-y-2">
        {projects.map(project => (
          <div key={project.project} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base font-medium text-gray-800">{project.project}</span>
              <span className="text-sm text-gray-500">训练{project.totalDays}天</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">{project.totalGroups}</span> 组
              </div>
              <div>
                <span className="font-medium">{project.totalReps}</span> 次
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
