import { Button, Form, Input, Toast } from 'antd-mobile';
import { useNavigate, Link } from 'react-router-dom';

import { register } from '@/api/auth.api';

/**
 * 注册
 *
 * @returns {JSX.Element} 注册页面
 */
export const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 处理注册
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.password !== values.confirmPassword) {
        Toast.show({
          icon: 'fail',
          content: '两次输入的密码不一致',
        });
        return;
      }
      const res = await register(values);
      if (res.code === 200) {
        Toast.show({
          icon: 'success',
          content: '注册成功，请登录',
        });
      } else {
        Toast.show({
          icon: 'fail',
          content: res.message,
        });
      }
      navigate('/login');
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error.response?.data?.message || '注册失败',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--adm-color-background)]">
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">创建账号</h1>
            <p className="text-[var(--adm-color-text-light)]">请填写以下信息</p>
          </div>
          <Form
            form={form}
            layout="vertical"
            footer={
              <Button block color="primary" size="large" onClick={handleSubmit} className="mb-4">
                注册
              </Button>
            }
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 2, message: '用户名至少2个字符' },
                { max: 20, message: '用户名最多20个字符' },
              ]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input type="password" placeholder="请输入密码" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认密码"
              rules={[{ required: true, message: '请确认密码' }]}
            >
              <Input type="password" placeholder="请再次输入密码" />
            </Form.Item>
          </Form>
          <div className="text-center">
            <Link to="/login" className="text-[var(--adm-color-primary)]">
              已有账号？立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
