import { Layout, Menu } from 'antd';
import { HomeOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;

export const Navbar = () => {
    const location = useLocation();

    return (
        <Header className="bg-white shadow">
            <Menu
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={[
                    {
                        key: '/',
                        icon: <HomeOutlined />,
                        label: <Link to="/">首页</Link>,
                    },
                    {
                        key: '/workout',
                        icon: <UnorderedListOutlined />,
                        label: <Link to="/workout">训练记录</Link>,
                    },
                    {
                        key: '/workout/new',
                        icon: <PlusOutlined />,
                        label: <Link to="/workout/new">新增训练</Link>,
                    },
                ]}
            />
        </Header>
    );
}; 