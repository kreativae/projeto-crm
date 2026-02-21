import axios from 'axios';

// Detectar a URL do backend baseado no hostname
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // Em produção em projeto.kreativ.ae
  if (hostname === 'projeto.kreativ.ae' || hostname === 'www.projeto.kreativ.ae') {
    return 'https://projeto-crm-1.onrender.com';
  }
  
  // Em desenvolvimento local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  
  // Fallback: usar mesmo domínio
  return `${window.location.origin}`;
};

const API_BASE_URL = getApiBaseUrl();
console.log('🔌 API Base URL:', API_BASE_URL);

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
