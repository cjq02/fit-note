import type { Workout } from '@/@typings/types.d.ts';
import { getWorkoutsByYearMonth } from '@/api/workout.api';
import { Calendar, Card, List, Picker } from 'antd-mobile';
import type { PickerValue } from 'antd-mobile/es/components/picker';
import { useEffect, useState } from 'react';
import { WorkoutDayGroup } from './components/WorkoutDayGroup';
import './Schedule.css';

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

  // 年月变化时重新获取数据
  useEffect(() => {
    const { year, month } = selectedYearMonth;
    fetchWorkoutData(year, month);
  }, [selectedYearMonth.year, selectedYearMonth.month]);

  // 获取选中日期的训练计划
  const getSelectedDateSchedule = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return workoutData[dateStr] || [];
  };

  // 渲染日历标签
  const renderLabel = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const hasWorkout = workoutData[dateStr]?.length > 0;

    return hasWorkout ? (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className="h-1 w-1 rounded-full bg-[var(--adm-color-primary)]" />
      </div>
    ) : null;
  };

  return (
    <div className="page-container bg-[var(--adm-color-background)]">
      <div className="p-4">
        {/* 年月选择器 */}
        <Card className="mb-4">
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

        {/* 日历 */}
        <Card className="mb-4">
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
              const dateStr = date.toISOString().split('T')[0];
              const hasWorkout = workoutData[dateStr]?.length > 0;
              return (
                <div className="relative flex h-full w-full items-center justify-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full -mt-1 ${
                      hasWorkout ? 'bg-orange-500 text-white' : ''
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            }}
          />
        </Card>

        {/* 训练计划列表 */}
        <Card title="训练记录" className="mb-4">
          {loading ? (
            <List.Item>加载中...</List.Item>
          ) : (
            <>
              {getSelectedDateSchedule().length > 0 ? (
                <WorkoutDayGroup
                  date={selectedDate.toISOString().split('T')[0]}
                  workouts={getSelectedDateSchedule()}
                  onDeleteSuccess={() => {
                    // 删除成功后刷新数据
                    fetchWorkoutData(selectedYearMonth.year, selectedYearMonth.month);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <svg
                    className="mb-4 h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-base">暂无训练记录</p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
