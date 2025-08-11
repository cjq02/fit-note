import type { Workout, Project } from '@/@typings/types.d.ts';
import { getWorkoutsByYearMonth } from '@/api/workout.api';
import { getProjects } from '@/api/project.api';
import { Calendar, Card, List, Picker } from 'antd-mobile';
import type { PickerValue } from 'antd-mobile/es/components/picker';
import { useEffect, useState } from 'react';
import { WorkoutDayGroup } from './components/WorkoutDayGroup';
import dayjs from 'dayjs';
import './Schedule.css';
import emptySvg from '@/assets/svg/empty-date.svg';
import { CATEGORY_OPTIONS } from '@fit-note/shared-utils/dict.options';

/**
 * 训练日程页面组件
 *
 * @returns {JSX.Element} 训练日程页面
 */
export const Schedule = () => {
  // 当前选中的日期
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // 当前选中的年月
  const [selectedYearMonth, setSelectedYearMonth] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
  });
  // 训练数据
  const [workoutData, setWorkoutData] = useState<Record<string, Workout[]>>({});
  // 项目数据
  const [projects, setProjects] = useState<Project[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(false);

  // 生成年份选项
  const yearColumns = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return {
      label: `${year}年`,
      value: year.toString(),
    };
  });

  // 生成月份选项
  const monthColumns = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      label: `${month}月`,
      value: month.toString().padStart(2, '0'),
    };
  });

  // 获取训练数据
  const fetchWorkoutData = async (year: string, month: string) => {
    try {
      setLoading(true);
      const response = await getWorkoutsByYearMonth({ year, month });
      if (response.code === 0 && response.data) {
        setWorkoutData(response.data.data);
      }
    } catch (error) {
      console.error('获取训练数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取项目数据
  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      if (response.code === 0 && response.data) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('获取项目数据失败:', error);
    }
  };

  // 年月变化时重新获取数据
  useEffect(() => {
    const { year, month } = selectedYearMonth;
    fetchWorkoutData(year, month);
  }, [selectedYearMonth.year, selectedYearMonth.month]);

  // 组件初始化时获取项目数据
  useEffect(() => {
    fetchProjects();
  }, []);

  // 获取选中日期的训练计划
  const getSelectedDateSchedule = () => {
    const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
    return workoutData[dateStr] || [];
  };

  // 根据项目名称获取项目类别
  const getProjectCategory = (projectName: string) => {
    const project = projects.find(p => p.name === projectName);
    return project?.category || '';
  };

  // 根据类别代码获取中文名称
  const getCategoryLabel = (categoryCode: string) => {
    const categoryOption = CATEGORY_OPTIONS.find(opt => opt.value === categoryCode);
    return categoryOption?.label || categoryCode;
  };

  // 获取日期显示内容
  const getDateDisplayContent = (date: Date) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const workouts = workoutData[dateStr] || [];

    if (workouts.length === 0) return '';

    // 获取项目数
    const workoutCount = workouts.length;

    // 获取所有不重复的项目类别
    const categories = [...new Set(workouts.map(w => getProjectCategory(w.projectName)))];
    const categoryLabels = categories.filter(cat => cat).map(cat => getCategoryLabel(cat));

    // 组合显示：项目数 + 项目类别
    const countText = `${workoutCount}`;
    const categoryText = categoryLabels.length > 0 ? categoryLabels.slice(0, 3).join('|') : '';
    return categoryText ? `${countText}${categoryText}` : countText;
  };

  // 根据项目数量获取背景色和文字颜色（红色系）
  const getBackgroundColor = (workoutCount: number) => {
    if (workoutCount === 0) return { bg: '', text: '' };
    if (workoutCount === 1) return { bg: 'bg-red-100', text: 'text-red-1000' };
    if (workoutCount === 2) return { bg: 'bg-red-200', text: 'text-red-900' };
    if (workoutCount === 3) return { bg: 'bg-red-300', text: 'text-red-700' };
    if (workoutCount === 4) return { bg: 'bg-red-400', text: 'text-red-50' };
    if (workoutCount === 5) return { bg: 'bg-red-500', text: 'text-white' };
    if (workoutCount === 6) return { bg: 'bg-red-600', text: 'text-white' };
    if (workoutCount === 7) return { bg: 'bg-red-700', text: 'text-white' };
    return { bg: 'bg-red-800', text: 'text-white' };
  };

  return (
    <div className="page-container bg-[var(--adm-color-background)]">
      <div className="p-2">
        {/* 年月选择器 */}
        <Card className="mb-2">
          <Picker
            columns={[yearColumns, monthColumns]}
            value={[selectedYearMonth.year, selectedYearMonth.month]}
            onConfirm={(value: PickerValue[]) => {
              const [year, month] = value as string[];
              setSelectedYearMonth({ year, month });
            }}
          >
            {(_, { open }) => (
              <div className="flex items-center justify-between p-2" onClick={open}>
                <span>选择年月</span>
                <span>{`${selectedYearMonth.year}年${selectedYearMonth.month}月`}</span>
              </div>
            )}
          </Picker>
        </Card>

        {/* 日历 */}
        <Card className="mb-2 calendar-card">
          <Calendar
            selectionMode="single"
            value={selectedDate}
            onChange={val => val && setSelectedDate(val)}
            onPageChange={(year: number, month: number) => {
              setSelectedYearMonth({
                year: year.toString(),
                month: month.toString(),
              });
            }}
            weekStartsOn="Monday"
            renderDate={date => {
              const dateStr = dayjs(date).format('YYYY-MM-DD');
              const workouts = workoutData[dateStr] || [];
              const workoutCount = workouts.length;
              const hasWorkout = workoutCount > 0;
              const isSelected = dayjs(date).isSame(selectedDate, 'day');
              const displayContent = getDateDisplayContent(date);

              return (
                <div
                  className={`relative flex h-full w-full flex-col items-center justify-center rounded-lg p-1 ${
                    isSelected ? 'bg-purple-600' : ''
                  }`}
                >
                  <div
                    className={`flex h-5 w-10 items-center justify-center rounded-full text-xs font-medium -mt-1 ${
                      hasWorkout && !isSelected ? 'border-[2px] border-orange-500' : ''
                    } ${isSelected ? 'text-white' : ''}`}
                  >
                    {date.getDate()}
                  </div>
                  <div
                    className={`text-[10px] mt-1 w-11 text-center h-4 flex items-center justify-center overflow-hidden rounded ${
                      isSelected ? 'text-white' : 'text-gray-600'
                    } ${hasWorkout && !isSelected ? `${getBackgroundColor(workoutCount).bg} ${getBackgroundColor(workoutCount).text}` : ''}`}
                  >
                    <div className="justify-start w-full whitespace-nowrap">{displayContent}</div>
                  </div>
                </div>
              );
            }}
          />
        </Card>

        {/* 训练计划列表 */}
        {loading ? (
          <List.Item>加载中...</List.Item>
        ) : (
          <>
            {getSelectedDateSchedule().length > 0 ? (
              <WorkoutDayGroup
                date={dayjs(selectedDate).format('YYYY-MM-DD')}
                workouts={getSelectedDateSchedule()}
                onDeleteSuccess={() => {
                  // 删除成功后刷新数据
                  fetchWorkoutData(selectedYearMonth.year, selectedYearMonth.month);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <object data={emptySvg} type="image/svg+xml" className="w-20 h-20 opacity-40" />
                <p className="text-base">暂无训练记录</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
