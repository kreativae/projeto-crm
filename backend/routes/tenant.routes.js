import { Router } from 'express';
import Tenant from '../../bancodedados/models/Tenant.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, checkPermission, tenantIsolation } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(authenticate, tenantIsolation);

// GET /api/tenants/current
router.get('/current', checkPermission('settings:read'), asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.tenantId).select('-apiKeys.secret');
  if (!tenant) return res.status(404).json({ success: false, message: 'Tenant não encontrado.' });
  res.json({ success: true, data: tenant });
}));

// PUT /api/tenants/settings
router.put('/settings', authorize('admin'), asyncHandler(async (req, res) => {
  const { name, settings, branding } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (settings?.timezone) updates['settings.timezone'] = settings.timezone;
  if (settings?.language) updates['settings.language'] = settings.language;
  if (branding?.primaryColor) updates['branding.primaryColor'] = branding.primaryColor;
  if (branding?.logoUrl !== undefined) updates['branding.logoUrl'] = branding.logoUrl;
  if (branding?.loginMessage) updates['branding.loginMessage'] = branding.loginMessage;

  const tenant = await Tenant.findByIdAndUpdate(req.tenantId, { $set: updates }, { new: true });
  res.json({ success: true, message: 'Configurações salvas.', data: tenant });
}));

// POST /api/tenants/integrations
router.post('/integrations', authorize('admin'), asyncHandler(async (req, res) => {
  const { provider, apiKey, active } = req.body;
  const tenant = await Tenant.findById(req.tenantId);
  const idx = tenant.integrations.findIndex(i => i.provider === provider);
  if (idx !== -1) {
    tenant.integrations[idx].apiKey = apiKey;
    tenant.integrations[idx].active = active;
  } else {
    tenant.integrations.push({ provider, apiKey, active });
  }
  await tenant.save();
  res.json({ success: true, data: tenant.integrations });
}));

// POST /api/tenants/webhooks
router.post('/webhooks', authorize('admin'), asyncHandler(async (req, res) => {
  const { url, events } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'URL obrigatória.' });
  const tenant = await Tenant.findById(req.tenantId);
  tenant.webhooks.push({ url, events: events || ['lead.created'], active: true, isActive: true });
  await tenant.save();
  const newHook = tenant.webhooks[tenant.webhooks.length - 1];
  res.status(201).json({ success: true, data: newHook });
}));

// DELETE /api/tenants/webhooks/:id
router.delete('/webhooks/:id', authorize('admin'), asyncHandler(async (req, res) => {
  await Tenant.findByIdAndUpdate(req.tenantId, { $pull: { webhooks: { _id: req.params.id } } });
  res.json({ success: true, message: 'Webhook removido.' });
}));

// POST /api/tenants/apikeys
router.post('/apikeys', authorize('admin'), asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.tenantId);
  const newKey = {
    key: 'nk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    name: req.body.name || 'Nova Chave',
    scopes: ['full_access']
  };
  tenant.apiKeys.push(newKey);
  await tenant.save();
  res.status(201).json({ success: true, data: newKey });
}));

export default router;
