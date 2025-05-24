import axios from 'axios';

import type { ApiResponse } from '../api/types';

// 创建 axios 实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response) {
      // 处理 HTTP 错误
      const { status, data } = error.response;
      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // 权限不足
          console.error('权限不足');
          break;
        case 404:
          // 资源不存在
          console.error('资源不存在');
          break;
        case 500:
          // 服务器错误
          console.error('服务器错误');
          break;
        default:
          console.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接');
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  },
);

// 封装 HTTP 方法
export const http = {
  get: <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    return instance.get(url, { params });
  },

  post: <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return instance.post(url, data);
  },

  put: <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return instance.put(url, data);
  },

  delete: <T>(url: string): Promise<ApiResponse<T>> => {
    return instance.delete(url);
  },
};
