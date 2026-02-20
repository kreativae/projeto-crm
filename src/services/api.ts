import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Backend URL
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com erros de autenticação (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/login'; // Opcional: Redirecionar forçado
    }
    return Promise.reject(error);
  }
);

export default api;
