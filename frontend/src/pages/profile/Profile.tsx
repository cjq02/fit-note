import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Dialog, List, Switch, Toast, Form, Input } from 'antd-mobile';
import {
  AntOutline,
  BellOutline,
  EditSOutline,
  KeyOutline,
  LockOutline,
  RightOutline,
  SetOutline,
} from 'antd-mobile-icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VConsole from 'vconsole';

import { getUserInfo, changePassword } from '@/api/auth.api';
import { PasswordDialog } from './components/PasswordDialog';

/**
 * 个人中心页面组件
 *
 * @returns {JSX.Element} 个人中心页面
 */
export const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [vConsole, setVConsole] = useState<VConsole | null>(null);
  const [isDebugEnabled, setIsDebugEnabled] = useState(() => {
    return localStorage.getItem('debug_enabled') === 'true';
  });

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

  // 修改密码弹窗相关
  const [showPwdDialog, setShowPwdDialog] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // 处理修改密码
  const handleChangePassword = () => {
    setShowPwdDialog(true);
  };

  // 封装后的提交逻辑
  const handlePwdSubmit = async (form: { oldPassword: string; newPassword: string }) => {
    setPwdLoading(true);
    try {
      await changePassword(form);
      Toast.show({ icon: 'success', content: '密码修改成功' });
      setShowPwdDialog(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '修改失败';
      Toast.show({ icon: 'fail', content: msg });
    } finally {
      setPwdLoading(false);
    }
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

  // 处理修改用户名
  const handleChangeUsername = () => {
    Toast.show({
      content: '功能开发中...',
    });
  };

  // 处理日志调试开关
  const handleDebugToggle = (checked: boolean) => {
    if (checked) {
      const vc = new VConsole();
      setVConsole(vc);
      localStorage.setItem('debug_enabled', 'true');
      setIsDebugEnabled(true);
      Toast.show({
        icon: 'success',
        content: '已开启调试模式',
      });
    } else {
      vConsole?.destroy();
      setVConsole(null);
      localStorage.setItem('debug_enabled', 'false');
      setIsDebugEnabled(false);
      Toast.show({
        icon: 'success',
        content: '已关闭调试模式',
      });
    }
  };

  // 初始化 vConsole
  useEffect(() => {
    if (isDebugEnabled) {
      const vc = new VConsole();
      setVConsole(vc);
    }
    return () => {
      vConsole?.destroy();
    };
  }, []);

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
      title: '日志调试',
      icon: <AntOutline />,
      right: <Switch checked={isDebugEnabled} onChange={handleDebugToggle} />,
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

  // 管理员专属设置项
  if (userInfo?.isAdmin) {
    settings.unshift({
      title: '用户管理',
      icon: <SetOutline />,
      onClick: () => navigate('/admin/users'),
      arrow: true,
    });
  }

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

        {/* 修改密码弹窗 */}
        <PasswordDialog
          visible={showPwdDialog}
          loading={pwdLoading}
          onClose={() => setShowPwdDialog(false)}
          onSubmit={handlePwdSubmit}
        />
      </div>
    </div>
  );
};
