import { TabBar, NavBar } from 'antd-mobile';
import { AppOutline, UnorderedListOutline, UserOutline } from 'antd-mobile-icons';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

const tabs = [
  {
    key: '/',
    title: '首页',
    icon: <AppOutline />,
  },
  {
    key: '/workout',
    title: '训练',
    icon: <UnorderedListOutline />,
  },
  {
    key: '/profile',
    title: '我的',
    icon: <UserOutline />,
  },
];

/**
 * 应用主组件
 *
 * @returns {JSX.Element} 返回应用主界面
 */
export const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 在登录和注册页面不显示底部导航栏
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <Outlet />;
  }

  // 获取当前页面的标题
  const getPageTitle = () => {
    const currentTab = tabs.find(tab => tab.key === location.pathname);
    return currentTab?.title || 'Fit Note';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar
        className="bg-white border-b border-[var(--adm-color-border)]"
        onBack={() => navigate(-1)}
      >
        {getPageTitle()}
      </NavBar>
      <div className="flex-1 pb-[var(--adm-tab-bar-height)]">
        <Outlet />
      </div>
      <TabBar
        activeKey={location.pathname}
        onChange={value => navigate(value)}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--adm-color-border)]"
      >
        {tabs.map(item => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
        ))}
      </TabBar>
    </div>
  );
};
