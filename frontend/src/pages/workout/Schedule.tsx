import { Calendar, Card, List } from 'antd-mobile';
import { useState } from 'react';

/**
 * 训练日程页面组件
 *
 * @returns {JSX.Element} 训练日程页面
 */
export const Schedule = () => {
  // 当前选中的日期
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 模拟数据
  const scheduleData = [
    {
      date: '2024-03-20',
      items: [
        { time: '09:00', title: '俯卧撑', sets: 3, reps: 20 },
        { time: '15:00', title: '健腹轮', sets: 2, reps: 15 },
      ],
    },
    {
      date: '2024-03-21',
      items: [
        { time: '10:00', title: '引体向上', sets: 3, reps: 10 },
        { time: '16:00', title: '深蹲', sets: 4, reps: 25 },
      ],
    },
  ];

  // 获取选中日期的训练计划
  const getSelectedDateSchedule = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return scheduleData.find(item => item.date === dateStr)?.items || [];
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
            {getSelectedDateSchedule().map((item, index) => (
              <List.Item
                key={index}
                prefix={item.time}
                description={`${item.sets}组 × ${item.reps}次`}
              >
                {item.title}
              </List.Item>
            ))}
            {getSelectedDateSchedule().length === 0 && <List.Item>暂无训练计划</List.Item>}
          </List>
        </Card>
      </div>
    </div>
  );
};
