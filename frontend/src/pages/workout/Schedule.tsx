import type { Workout, Project } from '@/@typings/types.d.ts';
import { getWorkoutsByYearMonth } from '@/api/workout.api';
import { getProjects } from '@/api/project.api';
import { Calendar, Card, List, Picker, Tabs } from 'antd-mobile';
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
  // 显示模式：'count' | 'category'
  const [displayMode, setDisplayMode] = useState<'count' | 'category'>('count');

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

    if (displayMode === 'count') {
      return workouts.length > 0 ? `${workouts.length}项` : '';
    } else {
      // 项目类别模式
      if (workouts.length === 0) return '';

      // 获取所有不重复的项目类别
      const categories = [...new Set(workouts.map(w => getProjectCategory(w.projectName)))];
      const categoryLabels = categories.filter(cat => cat).map(cat => getCategoryLabel(cat));
      return categoryLabels.join('|');
    }
  };

  // 渲染日历标签
  const renderLabel = (date: Date) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const hasWorkout = workoutData[dateStr]?.length > 0;

    return hasWorkout ? (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className="h-1 w-1 rounded-full bg-[var(--adm-color-primary)]" />
      </div>
    ) : null;
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
            {(items, { open }) => (
              <div className="flex items-center justify-between p-2" onClick={open}>
                <span>选择年月</span>
                <span>{`${selectedYearMonth.year}年${selectedYearMonth.month}月`}</span>
              </div>
            )}
          </Picker>
        </Card>

        {/* 显示模式选择器 */}
        <Card className="mb-2">
          <div className="[&_.adm-tabs-header]:h-8 [&_.adm-tabs-header]:border-b-0">
            <Tabs
              activeKey={displayMode}
              onChange={key => setDisplayMode(key as 'count' | 'category')}
            >
              <Tabs.Tab title="项目数" key="count" />
              <Tabs.Tab title="项目类别" key="category" />
            </Tabs>
          </div>
        </Card>

        {/* 日历 */}
        <Card className="mb-2">
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
                    isSelected ? 'bg-[var(--adm-color-primary)]' : ''
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium -mt-1 ${
                      hasWorkout && !isSelected ? 'bg-orange-500 text-white' : ''
                    } ${isSelected ? 'text-white' : ''}`}
                  >
                    {date.getDate()}
                  </div>
                  <div
                    className={`text-[10px] mt-1 w-10 text-center h-3 flex items-center justify-center overflow-hidden whitespace-nowrap ${
                      isSelected ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    <div className="justify-start w-full">{displayContent}</div>
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
