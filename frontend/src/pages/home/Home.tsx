import { Card, Grid, Space, Tag } from 'antd-mobile';
import {
  CalendarOutline,
  PieOutline,
  HeartOutline,
  HistogramOutline,
  VideoOutline,
  SendOutline,
  StarOutline,
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import React from 'react';

import { NavHeader } from '@/components/NavHeader';

/**
 * 首页组件
 *
 * @returns {JSX.Element} 首页
 */
export const Home = () => {
  const navigate = useNavigate();

  // 模拟数据
  const stats = [
    { title: '本周训练', value: '3次', icon: <CalendarOutline />, color: 'primary' },
    { title: '累计消耗', value: '1200千卡', icon: <HeartOutline />, color: 'warning' },
    { title: '连续训练', value: '5天', icon: <StarOutline />, color: 'success' },
  ];

  const quickActions = [
    {
      title: '开始训练',
      path: '/project',
      color: 'primary',
      icon: <VideoOutline className="text-white text-2xl" />,
    },
    {
      title: '训练记录',
      path: '/workout',
      color: 'success',
      icon: <HistogramOutline className="text-white text-2xl" />,
    },
    {
      title: '训练计划',
      path: '/plan',
      color: 'warning',
      icon: <SendOutline className="text-white text-2xl" />,
    },
    {
      title: '数据统计',
      path: '/stats',
      color: 'danger',
      icon: <PieOutline className="text-white text-2xl" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--adm-color-background)]">
      <NavHeader title="首页" />
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
            {quickActions.map(item => (
              <Grid.Item key={item.title}>
                <div
                  className={`h-24 rounded-lg bg-[var(--adm-color-${item.color}-light)] flex flex-col items-center justify-center cursor-pointer active:opacity-80 transition-opacity`}
                  onClick={() => navigate(item.path)}
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-[var(--adm-color-${item.color})] flex items-center justify-center mb-2`}
                  >
                    {item.icon}
                  </div>
                  <span className={`text-[var(--adm-color-${item.color})] font-medium`}>
                    {item.title}
                  </span>
                </div>
              </Grid.Item>
            ))}
          </Grid>
        </Card>

        {/* 最近训练 */}
        <Card title="最近训练" className="mb-4">
          <Space direction="vertical" block>
            <div className="flex justify-between items-center p-2">
              <div>
                <div className="font-medium">俯卧撑</div>
                <div className="text-xs text-[var(--adm-color-text-light)] mt-1">2024-03-20</div>
              </div>
              <Tag color="primary">3组</Tag>
            </div>
            <div className="flex justify-between items-center p-2">
              <div>
                <div className="font-medium">健腹轮</div>
                <div className="text-xs text-[var(--adm-color-text-light)] mt-1">2024-03-19</div>
              </div>
              <Tag color="primary">2组</Tag>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};
