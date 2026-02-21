import axios from 'axios';

// Detectar a URL do backend baseado no hostname
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('🔍 Detectando Backend URL:', { hostname, protocol });
  
  // Em produção em projeto.kreativ.ae (via proxy/DNS)
  if (hostname === 'projeto.kreativ.ae' || hostname === 'www.projeto.kreativ.ae') {
    console.log('✅ Usando Render backend para projeto.kreativ.ae');
    return 'https://projeto-crm-1.onrender.com';
  }
  
  // Em produção via Render direto
  if (hostname.includes('onrender.com')) {
    console.log('✅ Usando mesmo domínio para Render');
    return `${protocol}//${hostname}`;
  }
  
  // Em desenvolvimento local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('✅ Usando localhost backend');
    return 'http://localhost:4000';
  }
  
  // Fallback: usar mesmo protocolo e domínio
  console.log('⚠️  Fallback: usando origem da página');
  return `${window.location.origin}`;
};

const API_VERSION = '1.0.5-fix-typing-lag';
const API_BASE_URL = getApiBaseUrl();
console.log(`🚀 NexusCRM API Version: ${API_VERSION}`);
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
    const token = localStorage.getItem('token');
    // Só deslogar se NÃO for um token de demo (para evitar loops em preview)
    if (error.response && error.response.status === 401 && (!token || !token.startsWith('demo-'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/login'; // Opcional: Redirecionar forçado
    }
    return Promise.reject(error);
  }
);

export default api;

export const APP_VERSION = '1.0.5-fix-typing-lag'; // Versão com correção de performance (typing lag)
