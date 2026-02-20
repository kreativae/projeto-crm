import api from './api';

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  value: number;
  status: string; // 'Novo', 'Primeiro Contato', etc.
  source: string;
  tags: string[];
  ownerId?: string; // ID do usuário responsável
  createdAt: string;
  updatedAt: string;
  interactions?: any[];
}

const leadService = {
  getAll: async () => {
    const response = await api.get('/leads');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  create: async (data: Partial<Lead>) => {
    const response = await api.post('/leads', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Lead>) => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
};

export default leadService;
