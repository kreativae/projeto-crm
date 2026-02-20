// ============================================================
// NexusCRM - Rotas de Webhooks
// ============================================================
import { Router } from 'express';
import crypto from 'crypto';
import Tenant from '../../bancodedados/models/Tenant.js';
import { authenticate } from '../middleware/auth.js';
import { checkPermission, tenantIsolation } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(authenticate, tenantIsolation);

// GET /api/webhooks
router.get('/', checkPermission('webhooks:read'), asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.tenantId).select('webhooks');
  res.json({ success: true, data: { webhooks: tenant?.webhooks || [] } });
}));

// POST /api/webhooks
router.post('/', checkPermission('webhooks:create'), asyncHandler(async (req, res) => {
  const { url, events } = req.body;
  if (!url || !events?.length) {
    return res.status(400).json({ success: false, message: 'URL e eventos são obrigatórios.' });
  }

  const secret = crypto.randomBytes(32).toString('hex');
  const tenant = await Tenant.findById(req.tenantId);
  tenant.webhooks.push({ url, events, secret, isActive: true });
  await tenant.save();

  const newWebhook = tenant.webhooks[tenant.webhooks.length - 1];
  res.status(201).json({ success: true, message: 'Webhook criado.', data: { webhook: newWebhook } });
}));

// DELETE /api/webhooks/:webhookId
router.delete('/:webhookId', checkPermission('webhooks:delete'), asyncHandler(async (req, res) => {
  await Tenant.findByIdAndUpdate(req.tenantId, {
    $pull: { webhooks: { _id: req.params.webhookId } },
  });
  res.json({ success: true, message: 'Webhook removido.' });
}));

export default router;
