import { Button, Form, Input, Toast } from 'antd-mobile';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';

import { NavHeader } from '@/components/NavHeader';
import { login } from '@/api/auth.api';

/**
 * 登录页面组件
 *
 * @returns {JSX.Element} 登录页面
 */
export const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  // 处理登录
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const response = await login(values);
      localStorage.setItem('token', response.data.token);
      Toast.show({
        icon: 'success',
        content: '登录成功',
      });
      navigate('/');
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error.response?.data?.message || '登录失败',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--adm-color-background)]">
      <NavHeader title="登录" />
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">欢迎使用</h1>
            <p className="text-[var(--adm-color-text-light)]">请登录您的账号</p>
          </div>
          <Form
            form={form}
            layout="vertical"
            footer={
              <Button block color="primary" size="large" onClick={handleSubmit} className="mb-4">
                登录
              </Button>
            }
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input type="password" placeholder="请输入密码" />
            </Form.Item>
          </Form>
          <div className="text-center">
            <Link to="/register" className="text-[var(--adm-color-primary)]">
              还没有账号？立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
