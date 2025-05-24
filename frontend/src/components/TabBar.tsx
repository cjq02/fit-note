import { TabBar as AntTabBar } from 'antd-mobile';
import { AppOutline, CalendarOutline, UserOutline } from 'antd-mobile-icons';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  {
    key: '/',
    title: '首页',
    icon: <AppOutline />,
  },
  {
    key: '/workout',
    title: '训练',
    icon: <CalendarOutline />,
  },
  {
    key: '/profile',
    title: '我的',
    icon: <UserOutline />,
  },
];

export const TabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AntTabBar
      activeKey={location.pathname}
      onChange={value => navigate(value)}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--adm-color-border)]"
    >
      {tabs.map(item => (
        <AntTabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </AntTabBar>
  );
};
