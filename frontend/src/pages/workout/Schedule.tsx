import { Calendar, Card, List, Picker } from 'antd-mobile';
import { useEffect, useState } from 'react';
import { getWorkoutsByYearMonth } from '@/api/workout.api';
import type { Workout } from '@/@typings/types.d.ts';
import type { PickerValue } from 'antd-mobile/es/components/picker';

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
  const fetchWorkoutData = async () => {
    try {
      setLoading(true);
      const { year, month } = selectedYearMonth;
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
    fetchWorkoutData();
  }, [selectedYearMonth.year, selectedYearMonth.month]);

  // 获取选中日期的训练计划
  const getSelectedDateSchedule = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return workoutData[dateStr] || [];
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
