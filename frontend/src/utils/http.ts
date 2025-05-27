import axios from 'axios';

import type { ApiResponse } from '@/@typings/types.d';

// 创建 axios 实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    // 添加调试日志
    const requestUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log('Request URL:', requestUrl);
    console.log('Request Config:', config);
    return config;
  },
  error => {
    console.error('Request Error:', error);
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
      console.error('Response Error:', data);

      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          localStorage.removeItem('token');
          // 返回错误信息，让调用者处理
          return Promise.reject({
            code: status,
            message: data.message || '未授权',
            data: null,
          });
        case 403:
          // 权限不足
          return Promise.reject({
            code: status,
            message: data.message || '权限不足',
            data: null,
          });
        case 404:
          // 资源不存在
          return Promise.reject({
            code: status,
            message: data.message || '资源不存在',
            data: null,
          });
        case 500:
          // 服务器错误
          return Promise.reject({
            code: status,
            message: data.message || '服务器错误',
            data: null,
          });
        default:
          return Promise.reject({
            code: status,
            message: data.message || '请求失败',
            data: null,
          });
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      return Promise.reject({
        code: -1,
        message: '网络错误，请检查网络连接',
        data: null,
      });
    } else {
      // 请求配置出错
      return Promise.reject({
        code: -1,
        message: `请求配置错误: ${error.message}`,
        data: null,
      });
    }
  },
);

// 封装 HTTP 方法
export const http = {
  get: <T>(url: string, config?: any): Promise<ApiResponse<T>> => {
    return instance.get(url, config);
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
