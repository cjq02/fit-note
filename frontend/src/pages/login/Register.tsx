import { Button, Form, Input, Toast } from 'antd-mobile';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { register } from '@/api/auth.api';

/**
 * 注册
 *
 * @returns {JSX.Element} 注册页面
 */
export const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [captchaImg, setCaptchaImg] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaTip, setCaptchaTip] = useState('');

  // 获取验证码图片
  const fetchCaptcha = async () => {
    try {
      const res = await axios.get('/api/auth/captcha');
      setCaptchaImg(res.data.data.data);
      setCaptchaId(res.data.data.id);
    } catch {
      setCaptchaTip('验证码加载失败，请重试');
    }
  };

  // 页面加载时自动获取验证码
  useEffect(() => {
    fetchCaptcha();
  }, []);

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
      const payload = { ...values, captchaId };
      const res = await register(payload);
      if (res.message === 'success') {
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
        content: error.message || '注册失败',
      });
      fetchCaptcha(); // 注册失败时刷新验证码
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-100 to-pink-100 px-4">
      <div className="w-full max-w-sm p-8 rounded-2xl shadow-xl bg-white/90 backdrop-blur-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          {/* Logo区域，可替换为svg图片 */}
          <div className="mb-4">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="24" fill="#6366F1" />
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                fill="#fff"
                fontSize="20"
                fontWeight="bold"
                dy=".3em"
              >
                Fit
              </text>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight text-gray-800">创建账号</h1>
          <p className="text-base text-gray-500 font-medium">请填写以下信息</p>
        </div>
        <Form
          form={form}
          layout="vertical"
          footer={
            <Button
              block
              color="primary"
              size="large"
              onClick={handleSubmit}
              className="mb-4 rounded-full text-base font-semibold shadow-md"
            >
              注册
            </Button>
          }
        >
          <Form.Item
            name="username"
            label={<span className="font-semibold text-gray-700">用户名</span>}
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少2个字符' },
              { max: 20, message: '用户名最多20个字符' },
            ]}
          >
            <Input
              placeholder="请输入用户名"
              className="rounded-full px-4 py-2 border border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span className="font-semibold text-gray-700">密码</span>}
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input
              type="password"
              placeholder="请输入密码"
              className="rounded-full px-4 py-2 border border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={<span className="font-semibold text-gray-700">确认密码</span>}
            rules={[{ required: true, message: '请确认密码' }]}
          >
            <Input
              type="password"
              placeholder="请再次输入密码"
              className="rounded-full px-4 py-2 border border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </Form.Item>
          {/* 图形验证码 */}
          <Form.Item
            name="captcha"
            label={<span className="font-semibold text-gray-700">验证码</span>}
            rules={[{ required: true, message: '请输入验证码' }]}
            style={{ marginBottom: 0 }}
          >
            <div className="relative w-full">
              <Input
                id="captcha-input"
                placeholder="请输入验证码"
                className="rounded-full px-4 py-2 pr-20 border border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-full"
                maxLength={4}
                style={{ minWidth: 0 }}
              />
              <img
                src={captchaImg}
                alt="验证码"
                className="absolute top-1 bottom-1 right-4 my-auto h-7 w-16 rounded cursor-pointer border border-gray-200 bg-white shadow"
                onClick={fetchCaptcha}
                title="点击刷新验证码"
                style={{ flexShrink: 0 }}
              />
            </div>
          </Form.Item>
          <div className="text-xs text-gray-400 mt-1 cursor-pointer" onClick={fetchCaptcha}>
            看不清？点击图片或此处刷新
          </div>
          <div className="text-xs text-gray-400 mt-1">{captchaTip}</div>
        </Form>
        <div className="text-center mt-4">
          <span className="text-gray-500">已有账号？</span>
          <Link to="/login" className="ml-1 text-indigo-600 font-semibold hover:underline">
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
};
