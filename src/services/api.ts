import axios from 'axios';

// Detectar se é produção ou desenvolvimento
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://api.projeto.kreativ.ae/api'  // URL de produção
  : 'http://localhost:4000/api';           // URL de desenvolvimento

const api = axios.create({
  baseURL: API_BASE_URL,
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
