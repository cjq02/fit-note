import type {
  ApiResponse,
  WorkoutStats,
  WorkoutWeekResponse,
  WorkoutPeriodData,
} from '@/@typings/types.d.ts';
import {
  getWorkoutsGroupByWeek,
  getWorkoutStats,
  getWorkoutsGroupByMonth,
  getWorkoutsGroupByYear,
} from '@/api/workout.api';
import TrophyIcon from '@/assets/svg/trophy.svg';
import { useQuery } from '@tanstack/react-query';
import { Card, Grid, Space, Tabs } from 'antd-mobile';
import {
  CalendarOutline,
  HeartOutline,
  HistogramOutline,
  PieOutline,
  StarOutline,
  VideoOutline,
} from 'antd-mobile-icons';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkoutPeriodGroup } from '../workout/components/WorkoutPeriodGroup';

/** 解决adm-card-header-title宽度问题 */
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `.adm-card-header-title { width: 100% !important; }`;
  document.head.appendChild(style);
}

/**
 * 美化数字显示
 *
 * @param {number} value - 原始数字
 * @returns {string} 美化后的字符串
 */
const formatStatNumber = (value: number | undefined) => {
  if (!value) return '-';
  if (value > 999) return '999+';
  return value.toString();
};

/**
 * 首页组件
 *
 * @returns {JSX.Element} 首页
 */
export const Home = () => {
  const navigate = useNavigate();
  const [groupType, setGroupType] = useState<'week' | 'month' | 'year'>('week');

  // 获取所有时间维度的训练记录
  const { data: weekWorkouts } = useQuery<ApiResponse<WorkoutWeekResponse>>({
    queryKey: ['workouts', 'recent', 'week'],
    queryFn: () => getWorkoutsGroupByWeek({ page: 1, pageSize: 2 }),
  });

  const { data: monthWorkouts } = useQuery<ApiResponse<WorkoutWeekResponse>>({
    queryKey: ['workouts', 'recent', 'month'],
    queryFn: () => getWorkoutsGroupByMonth({ page: 1, pageSize: 2 }),
  });

  const { data: yearWorkouts } = useQuery<ApiResponse<WorkoutWeekResponse>>({
    queryKey: ['workouts', 'recent', 'year'],
    queryFn: () => getWorkoutsGroupByYear({ page: 1, pageSize: 2 }),
  });

  // 根据当前选择的时间维度获取对应的数据
  const recentWorkouts = {
    week: weekWorkouts,
    month: monthWorkouts,
    year: yearWorkouts,
  }[groupType];

  // 获取训练统计信息
  const { data: workoutStats } = useQuery<ApiResponse<WorkoutStats>>({
    queryKey: ['workouts', 'stats'],
    queryFn: getWorkoutStats,
  });

  // 训练统计卡片数据
  const stats = [
    {
      title: '本周训练',
      value: formatStatNumber(workoutStats?.data?.weeklyDays),
      icon: <CalendarOutline />,
      color: 'primary',
      unit: '次',
    },
    {
      title: '本月训练',
      value: formatStatNumber(workoutStats?.data?.monthlyDays),
      icon: <HeartOutline />,
      color: 'warning',
      unit: '次',
    },
    {
      title: workoutStats?.data?.continuousDays === 0 ? '没有训练' : '连续训练',
      value: formatStatNumber(
        workoutStats?.data?.continuousDays === 0
          ? workoutStats?.data?.withoutWorkoutDays
          : workoutStats?.data?.continuousDays,
      ),
      icon: <StarOutline />,
      color: workoutStats?.data?.continuousDays === 0 ? 'danger' : 'success',
      unit: '天',
    },
  ];

  return (
    <div className="page-container bg-[var(--adm-color-background)]">
      <div className="p-4">
        {/* 总训练天数卡片 */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-purple-100 to-purple-300 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-center gap-4">
              <img src={TrophyIcon} alt="训练成就" className="w-16 h-16" />
              <div className="text-2xl text-gray-700 font-medium">
                你已经训练了{' '}
                <span className="text-3xl font-bold text-gray-800">
                  {formatStatNumber(workoutStats?.data?.totalDays)}
                </span>{' '}
                天
              </div>
            </div>
          </div>
        </div>

        {/* 训练统计（重构设计） */}
        <div className="flex gap-3 mb-4">
          {stats.map(item => (
            <div
              key={item.title}
              className={`
                flex-1 flex flex-col items-center justify-center
                rounded-xl shadow-md
                py-4
                bg-gradient-to-br
                ${item.color === 'primary' ? 'from-blue-100 to-blue-300' : ''}
                ${item.color === 'warning' ? 'from-yellow-100 to-yellow-300' : ''}
                ${item.color === 'success' ? 'from-green-100 to-green-300' : ''}
                ${item.color === 'danger' ? 'from-red-100 to-red-300' : ''}
                transition-transform hover:scale-105 active:scale-100
              `}
              style={{ minWidth: 0 }}
            >
              <div className="mb-2">
                {React.cloneElement(item.icon, {
                  style: { fontSize: 32, color: `var(--adm-color-${item.color})` },
                })}
              </div>
              <div className="flex items-end">
                <span className="text-2xl font-extrabold text-gray-800 mr-1">{item.value}</span>
                <span className="text-base text-gray-500 pb-0.5">{item.unit}</span>
              </div>
              <div className="text-base text-gray-700 mt-2 tracking-wide font-semibold">
                {item.title}
              </div>
            </div>
          ))}
        </div>

        {/* 快捷入口 */}
        <Card title="快捷入口" className="mb-4">
          <Grid columns={2} gap={8}>
            <Grid.Item>
              <div
                className="h-24 rounded-lg bg-[var(--adm-color-primary-light)] flex flex-col items-center justify-center cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => navigate('/project')}
              >
                <div className="w-14 h-14 rounded-full bg-[var(--adm-color-primary)] flex items-center justify-center mb-2">
                  <VideoOutline style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <span className="text-black text-base font-normal">开始训练</span>
              </div>
            </Grid.Item>
            <Grid.Item>
              <div
                className="h-24 rounded-lg bg-[var(--adm-color-success-light)] flex flex-col items-center justify-center cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => navigate('/workout')}
              >
                <div className="w-14 h-14 rounded-full bg-[var(--adm-color-success)] flex items-center justify-center mb-2">
                  <HistogramOutline style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <span className="text-black text-base font-normal">训练记录</span>
              </div>
            </Grid.Item>
            <Grid.Item>
              <div
                className="h-24 rounded-lg bg-[var(--adm-color-warning-light)] flex flex-col items-center justify-center cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => navigate('/schedule')}
              >
                <div className="w-14 h-14 rounded-full bg-[var(--adm-color-warning)] flex items-center justify-center mb-2">
                  <CalendarOutline style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <span className="text-black text-base font-normal">训练日程</span>
              </div>
            </Grid.Item>
            <Grid.Item>
              <div
                className="h-24 rounded-lg bg-[var(--adm-color-danger-light)] flex flex-col items-center justify-center cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => navigate('/stats')}
              >
                <div className="w-14 h-14 rounded-full bg-[var(--adm-color-danger)] flex items-center justify-center mb-2">
                  <PieOutline style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <span className="text-black text-base font-normal">数据统计</span>
              </div>
            </Grid.Item>
          </Grid>
        </Card>

        {/* 最近训练 */}
        <Card
          title={
            <div className="flex justify-between items-center w-full">
              <div>
                <span className="text-base font-medium">最近训练</span>
              </div>
              <div>
                <Tabs
                  activeKey={groupType}
                  onChange={key => setGroupType(key as 'week' | 'month' | 'year')}
                  className="!w-auto [&_.adm-tabs-tab]:text-sm [&_.adm-tabs-tab]:px-2 [&_.adm-tabs-tab]:font-normal [&_.adm-tabs-header]:!border-none [&_.adm-tabs-tab-active]:!text-[var(--adm-color-primary)] [&_.adm-tabs-tab-active]:!font-medium"
                >
                  <Tabs.Tab title="按周" key="week" />
                  <Tabs.Tab title="按月" key="month" />
                  <Tabs.Tab title="按年" key="year" />
                </Tabs>
              </div>
            </div>
          }
          className="mb-4"
        >
          <Space direction="vertical" block>
            {recentWorkouts?.data?.data &&
              recentWorkouts.data.data.map((item, index) => {
                // 根据分组类型和索引获取标题
                const getCustomTitle = () => {
                  if (index === 0) {
                    switch (groupType) {
                      case 'week':
                        return '本周训练';
                      case 'month':
                        return '本月训练';
                      case 'year':
                        return '今年训练';
                    }
                  }
                  if (index === 1) {
                    switch (groupType) {
                      case 'week':
                        return '上周训练';
                      case 'month':
                        return '上月训练';
                      case 'year':
                        return '去年训练';
                    }
                  }
                  return undefined;
                };

                return (
                  <WorkoutPeriodGroup
                    key={item.period}
                    periodKey={item.period}
                    projects={item.stats}
                    customTitle={getCustomTitle()}
                  />
                );
              })}
          </Space>
        </Card>
      </div>
    </div>
  );
};
