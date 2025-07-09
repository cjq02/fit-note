import React from 'react';
import type { WorkoutWeekStats } from '@/@typings/types.d.ts';
import { generateColorFromDate } from '@/utils/color.utils';
import emptySvg from '@/assets/svg/date-empty.svg';

interface WorkoutPeriodGroupProps {
  /**
   * 时间键值（周/月/年的开始日期）
   */
  periodKey: string;
  /**
   * 该时间段的训练项目统计信息
   */
  projects: WorkoutWeekStats[];
  /**
   * 该时间段的总训练天数
   */
  periodTotalDays?: number;
  /**
   * 自定义标题
   */
  customTitle?: string;
}

/**
 * 训练内容分组组件
 *
 * @param {WorkoutPeriodGroupProps} props - 组件属性
 * @returns {JSX.Element} 训练内容分组组件
 */
export const WorkoutPeriodGroup: React.FC<WorkoutPeriodGroupProps> = ({
  periodKey,
  projects,
  periodTotalDays,
  customTitle,
}) => {
  // 将日期转换为更友好的显示格式
  const startDate = new Date(periodKey);
  let endDate = new Date(startDate);
  let dateDisplay = '';

  // 根据日期格式判断是周、月还是年
  if (periodKey.includes('-W')) {
    // 周格式：YYYY-WW
    endDate.setDate(startDate.getDate() + 6);
    dateDisplay =
      customTitle ||
      `${startDate.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })} - ${endDate.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}`;
  } else if (periodKey.length === 7) {
    // 月格式：YYYY-MM
    endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    dateDisplay = customTitle || `${startDate.getFullYear()}年${startDate.getMonth() + 1}月`;
  } else {
    // 年格式：YYYY
    dateDisplay = customTitle || `${startDate.getFullYear()}年`;
  }

  // 生成颜色
  const groupColor = generateColorFromDate(periodKey);
  const groupColorLight = `${groupColor}40`; // 增加透明度到40%
  const groupColorMedium = `${groupColor}80`; // 增加透明度到80%

  // 按 totalDays 降序排序 projects
  const sortedProjects = [...projects].sort((a, b) => b.totalDays - a.totalDays);

  return (
    <div className="mb-6">
      <div className="relative mb-4">
        <div
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-8 rounded-full"
          style={{ background: groupColor }}
        />
        <div
          className="text-lg font-semibold pl-6 pr-8 py-3 rounded-2xl relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${groupColorLight}, ${groupColor}20)`,
            color: groupColor,
          }}
        >
          <div
            className="absolute -right-8 -top-8 w-16 h-16 rounded-full opacity-20"
            style={{ background: groupColor }}
          />
          <div
            className="absolute -left-4 -bottom-4 w-12 h-12 rounded-full opacity-20"
            style={{ background: groupColor }}
          />
          <span className="relative z-10">{dateDisplay}</span>
          {typeof periodTotalDays === 'number' && (
            <span className="ml-4 text-sm font-normal text-gray-500 relative z-10">
              训练天数：{periodTotalDays}天
            </span>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div
            className="rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center min-h-[100px]"
            style={{
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderColor: '#dee2e6',
            }}
          >
            <img
              src={emptySvg}
              alt="暂无记录"
              className="w-20 h-20 opacity-40"
              style={{ color: '#adb5bd' }}
            />
            <div className="text-center space-y-1">
              <div className="text-sm font-medium text-gray-400">这个时间段还没有训练记录</div>
            </div>
          </div>
        ) : (
          sortedProjects.map(project => (
            <div
              key={project.projectName}
              className="rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border"
              style={{
                background: `linear-gradient(to bottom right, white, ${groupColorLight})`,
                borderColor: groupColorMedium,
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-base font-medium text-gray-800 tracking-wide">
                  {project.projectName}
                </span>
                <span
                  className="text-sm px-3 py-1 rounded-full font-medium"
                  style={{
                    color: groupColor,
                    background: groupColorLight,
                  }}
                >
                  训练{project.totalDays}天
                </span>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: groupColorLight }}
                  >
                    <span style={{ color: groupColor, fontWeight: 600 }}>
                      {project.totalGroups}
                    </span>
                  </div>
                  <span>组</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: groupColorLight }}
                  >
                    <span style={{ color: groupColor, fontWeight: 600 }}>{project.totalReps}</span>
                  </div>
                  <span>次</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
