import { NavBar } from 'antd-mobile';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavHeaderProps {
  title: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
  onBack?: () => void;
}

/**
 * 导航栏头部组件
 *
 * @param {NavHeaderProps} props - 组件属性
 * @returns {JSX.Element | null} 导航栏头部组件
 */
export const NavHeader = ({ title, showBack = true, rightContent, onBack }: NavHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 首页和个人中心页面不显示顶部栏
  if (location.pathname === '/' || location.pathname === '/profile') {
    return null;
  }

  return (
    <NavBar
      onBack={showBack ? onBack || (() => navigate(-1)) : undefined}
      right={rightContent}
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
