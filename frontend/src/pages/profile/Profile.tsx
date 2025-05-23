import { Avatar, Card, List, Space, Switch } from 'antd-mobile';
import { SetOutline, UserOutline, BellOutline, LockOutline, RightOutline } from 'antd-mobile-icons';

import { NavHeader } from '../../components/NavHeader';

export const Profile = () => {
  // 模拟数据
  const userInfo = {
    name: '健身达人',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    level: 'Lv.3',
    days: 30,
  };

  const settings = [
    {
      title: '个人信息',
      icon: <UserOutline />,
      onClick: () => console.log('个人信息'),
    },
    {
      title: '训练提醒',
      icon: <BellOutline />,
      right: <Switch defaultChecked />,
    },
    {
      title: '隐私设置',
      icon: <LockOutline />,
      onClick: () => console.log('隐私设置'),
    },
    {
      title: '系统设置',
      icon: <SetOutline />,
      onClick: () => console.log('系统设置'),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--adm-color-background)]">
      <NavHeader title="我的" />
      <div className="p-4">
        {/* 用户信息卡片 */}
        <Card className="mb-4">
          <div className="flex items-center">
            <Avatar src={userInfo.avatar} className="w-16 h-16" />
            <div className="ml-4">
              <div className="flex items-center">
                <span className="text-lg font-medium">{userInfo.name}</span>
                <span className="ml-2 px-2 py-0.5 bg-[var(--adm-color-primary)] text-white text-xs rounded-full">
                  {userInfo.level}
                </span>
              </div>
              <div className="text-sm text-[var(--adm-color-text-light)] mt-1">
                已坚持训练 {userInfo.days} 天
              </div>
            </div>
          </div>
        </Card>

        {/* 设置列表 */}
        <Card>
          <List>
            {settings.map(item => (
              <List.Item
                key={item.title}
                prefix={item.icon}
                onClick={item.onClick}
                extra={item.right || <RightOutline />}
              >
                {item.title}
              </List.Item>
            ))}
          </List>
        </Card>

        {/* 版本信息 */}
        <div className="text-center text-xs text-[var(--adm-color-text-light)] mt-8">
          Fit Note v1.0.0
        </div>
      </div>
    </div>
  );
};
