import { TabBar } from 'antd-mobile';
import { AppOutline, UnorderedListOutline, AddOutline, UserOutline } from 'antd-mobile-icons';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
            key: '/workout/new',
            title: '新增训练',
            icon: <AddOutline />,
        },
        {
            key: '/profile',
            title: '我的',
            icon: <UserOutline />,
        },
    ];

    return (
        <TabBar
            activeKey={location.pathname}
            onChange={(key) => navigate(key)}
            style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 100, boxShadow: '0 -1px 6px #eee' }}
        >
            {tabs.map((item) => (
                <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
            ))}
        </TabBar>
    );
}; 