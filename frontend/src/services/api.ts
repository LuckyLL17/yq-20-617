import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // 统一处理后端的响应格式 { code, message, data, timestamp }
    // 提取 data 字段，让业务代码直接使用 response.data
    if (response.data && typeof response.data === 'object' && 'code' in response.data) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // 统一处理错误响应格式
    if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

export default api;
