import { TabBar } from 'antd-mobile';
import { AppOutline, UnorderedListOutline, UserOutline } from 'antd-mobile-icons';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 在新增训练页面隐藏底部导航栏
    if (location.pathname === '/workout/new') {
        return null;
    }

    // 获取当前激活的标签页
    const getActiveKey = () => {
        const path = location.pathname;
        if (path === '/') return '/';
        if (path.startsWith('/workout')) return '/workout';
        if (path.startsWith('/profile')) return '/profile';
        return '/';
    };

    const tabs = [
        {
            key: '/',
            title: '首页',
            icon: <AppOutline />,
        },
        {
            key: '/workout',
            title: '训练记录',
            icon: <UnorderedListOutline />,
        },
        {
            key: '/profile',
            title: '我的',
            icon: <UserOutline />,
        },
    ];

    return (
        <TabBar
            activeKey={getActiveKey()}
            onChange={(key) => navigate(key)}
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                zIndex: 100,
                boxShadow: '0 -1px 6px #eee',
                backgroundColor: '#fff',
            }}
        >
            {tabs.map((item) => (
                <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
            ))}
        </TabBar>
    );
}; 