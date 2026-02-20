import api from './api';

export interface Lead {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: {
    name?: string;
    website?: string;
  };
  value?: number;
  status?: string;
  source?: string;
  tags?: string[];
  temperature?: string;
  score?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
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

  create: async (lead: Partial<Lead>) => {
    // Limpar dados e enviar apenas o necessário
    const data: any = {
      name: lead.name?.trim(),
      email: lead.email?.toLowerCase().trim() || undefined,
      phone: lead.phone?.trim() || undefined,
      mobile: lead.mobile?.trim() || undefined,
      value: lead.value ? Number(lead.value) : 0,
      status: lead.status || 'novo',
      source: lead.source || 'outro',
      tags: Array.isArray(lead.tags) ? lead.tags : [],
      temperature: lead.temperature || 'cold',
      score: lead.score || 0,
      notes: lead.notes?.trim() || undefined,
    };

    // Apenas incluir company se tiver dados
    if (lead.company) {
      data.company = {
        name: typeof lead.company === 'string' ? lead.company : lead.company.name,
        website: lead.company.website,
      };
    }

    // Remover campos undefined
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

    const response = await api.post('/leads', data);
    return response.data;
  },

  update: async (id: string, lead: Partial<Lead>) => {
    // Limpar dados e enviar apenas o necessário
    const data: any = {};
    
    if (lead.name) data.name = lead.name;
    if (lead.email) data.email = lead.email.toLowerCase().trim();
    if (lead.phone) data.phone = lead.phone;
    if (lead.mobile) data.mobile = lead.mobile;
    if (lead.value !== undefined) data.value = Number(lead.value);
    if (lead.status) data.status = lead.status;
    if (lead.source) data.source = lead.source;
    if (lead.tags) data.tags = lead.tags;
    if (lead.temperature) data.temperature = lead.temperature;
    if (lead.score !== undefined) data.score = lead.score;
    if (lead.notes) data.notes = lead.notes;

    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
};

export default leadService;
