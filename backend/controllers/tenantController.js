import Tenant from '../../bancodedados/models/Tenant.js';
import User from '../../bancodedados/models/User.js';

// Obter dados da empresa atual
export const getCurrentTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId).select('-apiKeys.secret');
    if (!tenant) return res.status(404).json({ message: 'Tenant não encontrado' });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar configurações gerais e branding
export const updateSettings = async (req, res) => {
  try {
    const { name, settings, branding } = req.body;
    
    // Atualização com spread para não sobrescrever sub-objetos
    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.user.tenantId,
      {
        $set: {
          name,
          'settings.timezone': settings.timezone,
          'settings.language': settings.language,
          'branding.primaryColor': branding.primaryColor,
          'branding.logoUrl': branding.logoUrl,
          'branding.loginMessage': branding.loginMessage
        }
      },
      { new: true }
    );
    res.json(updatedTenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gerenciar Integrações (Upsert)
export const updateIntegration = async (req, res) => {
  try {
    const { provider, apiKey, active } = req.body;
    
    const tenant = await Tenant.findById(req.user.tenantId);
    
    // Procura se já existe a integração
    const index = tenant.integrations.findIndex(i => i.provider === provider);
    
    if (index !== -1) {
      tenant.integrations[index].apiKey = apiKey;
      tenant.integrations[index].active = active;
    } else {
      tenant.integrations.push({ provider, apiKey, active });
    }
    
    await tenant.save();
    res.json(tenant.integrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Adicionar Webhook
export const addWebhook = async (req, res) => {
  try {
    const { url, events } = req.body;
    const tenant = await Tenant.findById(req.user.tenantId);
    
    tenant.webhooks.push({ 
      url, 
      events,
      active: true,
      secret: Math.random().toString(36).substring(7) // Mock secret
    });
    
    await tenant.save();
    res.json(tenant.webhooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remover Webhook
export const removeWebhook = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    tenant.webhooks = tenant.webhooks.filter(w => w._id.toString() !== req.params.id);
    await tenant.save();
    res.json(tenant.webhooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gerar API Key
export const generateApiKey = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    const newKey = {
      key: 'nk_' + Math.random().toString(36).substring(2, 15),
      name: req.body.name || 'Nova Chave',
      scopes: ['full_access']
    };
    tenant.apiKeys.push(newKey);
    await tenant.save();
    res.json(tenant.apiKeys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
