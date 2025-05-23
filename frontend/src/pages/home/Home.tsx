import { Card, Grid, Space, Image } from 'antd-mobile';
import { HeartOutline, ClockCircleOutline, StarOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: '本周训练',
      value: '3次',
      icon: <HeartOutline fontSize={24} />,
      color: 'var(--adm-color-danger)',
    },
    {
      title: '总时长',
      value: '120分钟',
      icon: <ClockCircleOutline fontSize={24} />,
      color: 'var(--adm-color-primary)',
    },
    {
      title: '目标完成',
      value: '75%',
      icon: <StarOutline fontSize={24} />,
      color: 'var(--adm-color-success)',
    },
  ];

  const quickActions = [
    {
      title: '开始训练',
      image: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
      onClick: () => navigate('/workout/new'),
    },
    {
      title: '训练记录',
      image: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
      onClick: () => navigate('/workout'),
    },
    {
      title: '训练计划',
      image: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
      onClick: () => navigate('/plan'),
    },
  ];

  return (
    <div className="p-4 pb-20 min-h-screen">
      {/* 欢迎语 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-2 text-[var(--adm-color-text)]">你好，健身达人</h1>
        <p className="text-[var(--adm-color-text-light)] text-sm">今天也要加油哦！</p>
      </div>

      {/* 统计卡片 */}
      <Grid columns={3} gap={8} className="mb-6">
        {stats.map((stat, index) => (
          <Grid.Item key={index}>
            <Card
              className="text-center hover:shadow-md transition-shadow"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                marginBottom: '16px',
              }}
            >
              <Space direction="vertical" align="center" style={{ '--gap': '4px' }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
                <div className="text-lg font-bold text-[var(--adm-color-text)]">{stat.value}</div>
                <div className="text-xs text-[var(--adm-color-text-light)]">{stat.title}</div>
              </Space>
            </Card>
          </Grid.Item>
        ))}
      </Grid>

      {/* 快捷操作 */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4 text-[var(--adm-color-text)]">快捷操作</h2>
        <Grid columns={3} gap={8}>
          {quickActions.map((action, index) => (
            <Grid.Item key={index}>
              <Card
                onClick={action.onClick}
                className="text-center hover:shadow-md transition-shadow active:bg-gray-50"
              >
                <Space direction="vertical" align="center" style={{ '--gap': '8px' }}>
                  <Image src={action.image} width={32} height={32} />
                  <div className="text-sm text-[var(--adm-color-text)]">{action.title}</div>
                </Space>
              </Card>
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* 最近训练 */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-[var(--adm-color-text)]">最近训练</h2>
        <Card className="hover:shadow-md transition-shadow">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-[var(--adm-color-text)]">力量训练</div>
                <div className="text-xs text-[var(--adm-color-text-light)]">2024-03-20</div>
              </div>
              <div className="text-sm text-[var(--adm-color-text-light)]">60分钟</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2 py-1 bg-[var(--adm-color-primary)] bg-opacity-10 text-[var(--adm-color-primary)] text-xs rounded">
                卧推
              </span>
              <span className="px-2 py-1 bg-[var(--adm-color-primary)] bg-opacity-10 text-[var(--adm-color-primary)] text-xs rounded">
                深蹲
              </span>
              <span className="px-2 py-1 bg-[var(--adm-color-primary)] bg-opacity-10 text-[var(--adm-color-primary)] text-xs rounded">
                硬拉
              </span>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};
