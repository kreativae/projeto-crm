import api from './api';

export interface TenantSettings {
  name: string;
  plan: string;
  settings: {
    language: string;
    timezone: string;
  };
  branding: {
    logoUrl?: string;
    primaryColor: string;
    loginMessage?: string;
  };
  integrations: Array<{
    provider: string;
    apiKey: string;
    active: boolean;
  }>;
  webhooks: Array<{
    _id: string;
    url: string;
    events: string[];
    active: boolean;
  }>;
  billing: {
    plan: string;
    nextInvoiceDate?: string;
  };
  apiKeys: Array<{
    key: string;
    name: string;
    createdAt: string;
  }>;
}

export const tenantService = {
  getSettings: async (): Promise<TenantSettings> => {
    const response = await api.get('/tenants/current');
    return response.data;
  },

  updateSettings: async (data: Partial<TenantSettings>) => {
    const response = await api.put('/tenants/settings', data);
    return response.data;
  },

  updateIntegration: async (data: { provider: string; apiKey: string; active: boolean }) => {
    const response = await api.post('/tenants/integrations', data);
    return response.data;
  },

  addWebhook: async (data: { url: string; events: string[] }) => {
    const response = await api.post('/tenants/webhooks', data);
    return response.data;
  },

  removeWebhook: async (id: string) => {
    const response = await api.delete(`/tenants/webhooks/${id}`);
    return response.data;
  },

  generateApiKey: async (name: string) => {
    const response = await api.post('/tenants/apikeys', { name });
    return response.data;
  }
};
