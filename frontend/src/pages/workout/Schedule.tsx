import { Calendar, Card, List } from 'antd-mobile';
import { useEffect, useState } from 'react';
import { getWorkoutsGroupByDate } from '@/api/workout.api';
import type { Workout } from '@/@typings/types.d.ts';

/**
 * 训练日程页面组件
 *
 * @returns {JSX.Element} 训练日程页面
 */
export const Schedule = () => {
  // 当前选中的日期
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // 训练数据
  const [workoutData, setWorkoutData] = useState<Record<string, Workout[]>>({});
  // 加载状态
  const [loading, setLoading] = useState(false);

  // 获取训练数据
  const fetchWorkoutData = async () => {
    try {
      setLoading(true);
      const response = await getWorkoutsGroupByDate();
      if (response.code === 0 && response.data) {
        setWorkoutData(response.data.data);
      }
    } catch (error) {
      console.error('获取训练数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    fetchWorkoutData();
  }, []);

  // 获取选中日期的训练计划
  const getSelectedDateSchedule = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return workoutData[dateStr] || [];
  };

  return (
    <div className="page-container bg-[var(--adm-color-background)]">
      <div className="p-4">
        {/* 日历 */}
        <Card className="mb-4">
          <Calendar
            selectionMode="single"
            value={selectedDate}
            onChange={val => val && setSelectedDate(val)}
          />
        </Card>

        {/* 训练计划列表 */}
        <Card title="训练计划" className="mb-4">
          <List>
            {loading ? (
              <List.Item>加载中...</List.Item>
            ) : (
              <>
                {getSelectedDateSchedule().map((item, index) => (
                  <List.Item
                    key={index}
                    prefix={new Date(item.createdAt).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    description={`${item.groups.length}组`}
                  >
                    {item.project}
                  </List.Item>
                ))}
                {getSelectedDateSchedule().length === 0 && <List.Item>暂无训练计划</List.Item>}
              </>
            )}
          </List>
        </Card>
      </div>
    </div>
  );
};
