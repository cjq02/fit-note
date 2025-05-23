import { NavBar } from 'antd-mobile';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavHeaderProps {
    title: string;
    showBack?: boolean;
}

export const NavHeader = ({ title, showBack = true }: NavHeaderProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 首页和个人中心页面不显示顶部栏
    if (location.pathname === '/' || location.pathname === '/profile') {
        return null;
    }

    return (
        <NavBar
            onBack={() => navigate(-1)}
            style={{
                '--height': '48px',
                '--border-bottom': '1px solid var(--adm-color-border)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: '#fff',
            }}
        >
            {title}
        </NavBar>
    );
}; 