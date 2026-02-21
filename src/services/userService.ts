import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'vendedor' | 'suporte';
  status: 'active' | 'inactive';
  lastAccess?: string;
  avatar?: string;
}

const userService = {
  getAll: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },

  create: async (data: Partial<User>) => {
    // Normalmente envia email de convite
    const response = await api.post('/api/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<User>) => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
};

export default userService;
