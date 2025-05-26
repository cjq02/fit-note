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
import { getWorkoutsGroupByDate } from '@/api/workout.api';
import { WorkoutDayGroup } from '../workout/components/WorkoutDayGroup';

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

  // 模拟数据
  const stats = [
    { title: '本周训练', value: '3次', icon: <CalendarOutline />, color: 'primary' },
    { title: '累计消耗', value: '1200千卡', icon: <HeartOutline />, color: 'warning' },
    { title: '连续训练', value: '5天', icon: <StarOutline />, color: 'success' },
  ];

  return (
    <div className="page-container bg-[var(--adm-color-background)]">
      <div className="p-4">
        {/* 训练统计 */}
        <Card className="mb-4">
          <Grid columns={3} gap={8}>
            {stats.map(item => (
              <Grid.Item key={item.title}>
                <div className="flex flex-col items-center">
                  <div className={`text-[var(--adm-color-${item.color})] mb-1`}>{item.icon}</div>
                  <div className="text-sm text-[var(--adm-color-text-light)]">{item.title}</div>
                  <div className="font-medium">{item.value}</div>
                </div>
              </Grid.Item>
            ))}
          </Grid>
        </Card>

        {/* 快捷入口 */}
        <Card title="快捷入口" className="mb-4">
          <Grid columns={2} gap={8}>
            <Grid.Item>
              <div
                className="h-24 rounded-lg bg-[var(--adm-color-primary-light)] flex flex-col items-center justify-center cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => navigate('/project')}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--adm-color-primary)] flex items-center justify-center mb-2">
                  <VideoOutline style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <span className="text-[var(--adm-color-primary)] font-medium">开始训练</span>
              </div>
            </Grid.Item>
            <Grid.Item>
              <div
                className="h-24 rounded-lg bg-[var(--adm-color-success-light)] flex flex-col items-center justify-center cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => navigate('/workout')}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--adm-color-success)] flex items-center justify-center mb-2">
                  <HistogramOutline style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <span className="text-[var(--adm-color-success)] font-medium">训练记录</span>
              </div>
            </Grid.Item>
            <Grid.Item>
              <div
                className="h-24 rounded-lg bg-[var(--adm-color-warning-light)] flex flex-col items-center justify-center cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => navigate('/schedule')}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--adm-color-warning)] flex items-center justify-center mb-2">
                  <SendOutline style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <span className="text-[var(--adm-color-warning)] font-medium">训练日程</span>
              </div>
            </Grid.Item>
            <Grid.Item>
              <div
                className="h-24 rounded-lg bg-[var(--adm-color-danger-light)] flex flex-col items-center justify-center cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => navigate('/stats')}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--adm-color-danger)] flex items-center justify-center mb-2">
                  <PieOutline style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <span className="text-[var(--adm-color-danger)] font-medium">数据统计</span>
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
