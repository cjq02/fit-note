import React from 'react';
import type { WorkoutWeekStats } from '@/@typings/types.d.ts';
import { generateColorFromDate } from '@/utils/color.utils';

interface WorkoutWeekGroupProps {
  /**
   * 周一的日期
   */
  weekKey: string;
  /**
   * 该周的训练项目统计信息
   */
  projects: WorkoutWeekStats[];
  /**
   * 自定义标题
   */
  customTitle?: string;
}

/**
 * 每周训练内容组件
 *
 * @param {WorkoutWeekGroupProps} props - 组件属性
 * @returns {JSX.Element} 每周训练内容组件
 */
export const WorkoutWeekGroup: React.FC<WorkoutWeekGroupProps> = ({
  weekKey,
  projects,
  customTitle,
}) => {
  // 将周一的日期转换为更友好的显示格式
  const weekDate = new Date(weekKey);
  const weekEnd = new Date(weekDate);
  weekEnd.setDate(weekDate.getDate() + 6);
  const weekDisplay =
    customTitle ||
    `${weekDate.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })} - ${weekEnd.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}`;

  // 生成周颜色
  const weekColor = generateColorFromDate(weekKey);
  const weekColorLight = `${weekColor}40`; // 增加透明度到40%
  const weekColorMedium = `${weekColor}80`; // 增加透明度到80%

  return (
    <div className="mb-6">
      <div className="relative mb-4">
        <div
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-8 rounded-full"
          style={{ background: weekColor }}
        />
        <div
          className="text-lg font-semibold pl-6 pr-8 py-3 rounded-2xl relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${weekColorLight}, ${weekColor}20)`,
            color: weekColor,
          }}
        >
          <div
            className="absolute -right-8 -top-8 w-16 h-16 rounded-full opacity-20"
            style={{ background: weekColor }}
          />
          <div
            className="absolute -left-4 -bottom-4 w-12 h-12 rounded-full opacity-20"
            style={{ background: weekColor }}
          />
          <span className="relative z-10">{weekDisplay}</span>
        </div>
      </div>
      <div className="space-y-3">
        {projects.map(project => (
          <div
            key={project.project}
            className="rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border"
            style={{
              background: `linear-gradient(to bottom right, white, ${weekColorLight})`,
              borderColor: weekColorMedium,
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-medium text-gray-800 tracking-wide">
                {project.project}
              </span>
              <span
                className="text-sm px-3 py-1 rounded-full font-medium"
                style={{
                  color: weekColor,
                  background: weekColorLight,
                }}
              >
                训练{project.totalDays}天
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: weekColorLight }}
                >
                  <span style={{ color: weekColor, fontWeight: 600 }}>{project.totalGroups}</span>
                </div>
                <span>组</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: weekColorLight }}
                >
                  <span style={{ color: weekColor, fontWeight: 600 }}>{project.totalReps}</span>
                </div>
                <span>次</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
