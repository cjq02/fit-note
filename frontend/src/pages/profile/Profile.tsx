import { Avatar, Card, List, Space, Switch, Toast, Dialog, Button } from 'antd-mobile';
import {
  SetOutline,
  UserOutline,
  BellOutline,
  LockOutline,
  RightOutline,
  EditSOutline,
  KeyOutline,
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getUserInfo } from '@/api/auth.api';

/**
 * 个人中心页面组件
 *
 * @returns {JSX.Element} 个人中心页面
 */
export const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 获取用户信息
  const {
    data: userInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }
      const response = await getUserInfo();
      return response.data.user;
    },
    retry: false,
  });

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // 获取头像显示文字
  const getAvatarText = () => {
    console.log('用户信息状态:', { isLoading, error, userInfo });
    if (isLoading) return '...';
    if (error) return '!';
    if (!userInfo?.username) return '?';
    const firstChar = userInfo.username.charAt(0).toUpperCase();
    console.log('头像文字:', firstChar);
    return firstChar;
  };

  // 获取用户名显示
  const getUsername = () => {
    if (isLoading) return '加载中...';
    if (error) return '获取失败';
    return userInfo?.username || '未登录';
  };

  // 处理退出登录
  const handleLogout = () => {
    Dialog.confirm({
      content: '确定要退出登录吗？',
      onConfirm: () => {
        localStorage.removeItem('token');
        queryClient.clear();
        Toast.show({
          icon: 'success',
          content: '已退出登录',
        });
        navigate('/login');
      },
    });
  };

  // 处理修改密码
  const handleChangePassword = () => {
    Toast.show({
      content: '功能开发中...',
    });
  };

  // 处理修改用户名
  const handleChangeUsername = () => {
    Toast.show({
      content: '功能开发中...',
    });
  };

  const settings = [
    {
      title: '修改用户名',
      icon: <EditSOutline />,
      onClick: handleChangeUsername,
      arrow: true,
    },
    {
      title: '修改密码',
      icon: <KeyOutline />,
      onClick: handleChangePassword,
      arrow: true,
    },
    {
      title: '训练提醒',
      icon: <BellOutline />,
      right: <Switch defaultChecked />,
      onClick: () => {
        Toast.show({
          content: '功能开发中...',
        });
      },
    },
    {
      title: '隐私设置',
      icon: <LockOutline />,
      onClick: () => {
        Toast.show({
          content: '功能开发中...',
        });
      },
      arrow: true,
    },
    {
      title: '系统设置',
      icon: <SetOutline />,
      onClick: () => {
        Toast.show({
          content: '功能开发中...',
        });
      },
      arrow: true,
    },
  ];

  return (
    <div className="page-container bg-[var(--adm-color-background)]">
      <div className="p-4">
        {/* 用户信息卡片 */}
        <Card className="mb-4">
          <div className="flex items-center">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-medium select-none"
                style={{
                  background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  minWidth: '4rem',
                  minHeight: '4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <span style={{ display: 'block', lineHeight: 1, fontSize: '1.5rem' }}>
                  {getAvatarText()}
                </span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-medium">{getUsername()}</div>
                  <div className="text-sm text-[var(--adm-color-text-light)] mt-1">
                    欢迎使用 Fit Note
                  </div>
                </div>
                <Button size="small" color="primary" fill="outline" onClick={handleChangeUsername}>
                  修改
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 数据统计卡片 */}
        <Card className="mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-medium text-[var(--adm-color-primary)]">0</div>
              <div className="text-sm text-[var(--adm-color-text-light)]">训练次数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-[var(--adm-color-success)]">0</div>
              <div className="text-sm text-[var(--adm-color-text-light)]">训练天数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-[var(--adm-color-warning)]">0</div>
              <div className="text-sm text-[var(--adm-color-text-light)]">累计消耗</div>
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
                extra={item.right || (item.arrow ? <RightOutline /> : null)}
                arrow={false}
              >
                {item.title}
              </List.Item>
            ))}
          </List>
        </Card>

        {/* 退出登录按钮 */}
        <div className="mt-4 px-4">
          <Button
            block
            color="danger"
            fill="outline"
            onClick={handleLogout}
            className="!border-[var(--adm-color-danger)] !text-[var(--adm-color-danger)]"
          >
            退出登录
          </Button>
        </div>

        {/* 版本信息 */}
        <div className="text-center text-xs text-[var(--adm-color-text-light)] mt-8">
          Fit Note v1.0.0
        </div>
      </div>
    </div>
  );
};
