import { Card, Grid, Space } from 'antd-mobile';
import {
  CalendarOutline,
  HeartOutline,
  HistogramOutline,
  PieOutline,
  SendOutline,
  StarOutline,
  VideoOutline,
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, Workout as WorkoutType } from '@/@typings/types.d.ts';
import { getWorkoutsGroupByDate, getWorkoutStats } from '@/api/workout.api';
import { WorkoutDayGroup } from '../workout/components/WorkoutDayGroup';
import React from 'react';

type WorkoutStats = {
  weeklyDays: number;
  monthlyDays: number;
  continuousDays: number;
};

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

  // 获取最近训练记录
  const { data: recentWorkouts } = useQuery<
    ApiResponse<{ data: Record<string, WorkoutType[]>; total: number }>
  >({
    queryKey: ['workouts', 'recent'],
    queryFn: async () => {
      const response = await getWorkoutsGroupByDate({
        page: 1,
        pageSize: 3,
      });
      return response;
    },
  });

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
      title: '连续训练',
      value: formatStatNumber(workoutStats?.data?.continuousDays),
      icon: <StarOutline />,
      color: 'success',
      unit: '天',
    },
  ];

  return (
    <div className="page-container bg-[var(--adm-color-background)]">
      <div className="p-4">
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
                  <SendOutline style={{ fontSize: '32px', color: 'white' }} />
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
        <Card title="最近训练" className="mb-4">
          <Space direction="vertical" block>
            {recentWorkouts?.data.data &&
              Object.entries(recentWorkouts.data.data).map(([date, workouts]) => (
                <WorkoutDayGroup
                  key={date}
                  date={date}
                  workouts={workouts}
                  onDeleteSuccess={() => {}}
                />
              ))}
          </Space>
        </Card>
      </div>
    </div>
  );
};
