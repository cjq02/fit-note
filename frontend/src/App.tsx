import { TabBar, NavBar } from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
  CalendarOutline,
  AddCircleOutline,
} from 'antd-mobile-icons';
import { useLocation, useNavigate, Outlet, matchRoutes } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { router } from './router';

const tabs = [
  {
    key: '/',
    title: '首页',
    icon: <AppOutline />,
  },
  {
    key: '/schedule',
    title: '日程',
    icon: <CalendarOutline />,
  },
  {
    key: '/project',
    title: '开始',
    icon: (
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center -mt-4 shadow-lg">
        <AddCircleOutline style={{ fontSize: '24px', color: 'white' }} />
      </div>
    ),
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
 * 扩展路由类型，添加 title 属性
 */
type CustomRouteObject = RouteObject & {
  title?: string;
  children?: CustomRouteObject[];
  onBack?: () => void;
};

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

  /**
   * 获取当前页面的标题和回退事件
   *
   * @returns {{ title: string; onBack?: () => void }} 页面标题和回退事件
   */
  const getPageConfig = () => {
    const matches = matchRoutes(router.routes, location);
    if (!matches) return { title: 'Fit Note' };

    // 获取最后一个匹配的路由（最具体的路由）
    const lastMatch = matches[matches.length - 1];
    const route = lastMatch.route as CustomRouteObject;
    return {
      title: route.title || 'Fit Note',
      onBack: route.onBack,
    };
  };

  const pageConfig = getPageConfig();

  return (
    <div className="flex flex-col h-screen">
      <NavBar
        className="flex-none bg-white border-b border-[var(--adm-color-border)]"
        onBack={pageConfig.onBack || (() => navigate(-1))}
      >
        {pageConfig.title}
      </NavBar>
      <div className="flex-1 overflow-y-auto pb-[50px] body">
        <Outlet />
      </div>
      <TabBar
        activeKey={location.pathname}
        onChange={value => navigate(value)}
        className="flex-none bg-white border-t border-[var(--adm-color-border)] fixed bottom-0 left-0 right-0"
      >
        {tabs.map(item => (
          <TabBar.Item
            key={item.key}
            icon={item.icon}
            title={item.key === '/project' ? '' : item.title}
            className={item.key === '/project' ? 'scale-110' : ''}
          />
        ))}
      </TabBar>
    </div>
  );
};
