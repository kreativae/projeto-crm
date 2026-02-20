// ============================================================
// NexusCRM - Rotas de Templates de Mensagens
// ============================================================
import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.js';
import { checkPermission, tenantIsolation } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(authenticate, tenantIsolation);

// Schema simples de template (inline)
const templateSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true, trim: true },
  channel: { type: String, enum: ['whatsapp', 'email', 'sms', 'telegram', 'universal'], default: 'universal' },
  category: { type: String, enum: ['greeting', 'followup', 'closing', 'support', 'marketing', 'other'], default: 'other' },
  subject: String,
  content: { type: String, required: true },
  variables: [String],
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, collection: 'templates' });

const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);

// GET /api/templates
router.get('/', checkPermission('templates:read'), asyncHandler(async (req, res) => {
  const { channel, category, search } = req.query;
  const filter = { tenantId: req.tenantId };
  if (channel) filter.channel = channel;
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const templates = await Template.find(filter).sort({ usageCount: -1 });
  res.json({ success: true, data: { templates } });
}));

// POST /api/templates
router.post('/', checkPermission('templates:create'), asyncHandler(async (req, res) => {
  const { name, channel, category, subject, content, variables } = req.body;
  if (!name || !content) return res.status(400).json({ success: false, message: 'Nome e conteúdo obrigatórios.' });

  // Extrair variáveis do conteúdo
  const extractedVars = content.match(/\{\{(\w+)\}\}/g)?.map(v => v.replace(/\{\{|\}\}/g, '')) || [];

  const template = await Template.create({
    tenantId: req.tenantId, name, channel, category, subject, content,
    variables: variables || extractedVars,
    createdBy: req.userId,
  });

  res.status(201).json({ success: true, message: 'Template criado.', data: { template } });
}));

// PUT /api/templates/:id
router.put('/:id', checkPermission('templates:update'), asyncHandler(async (req, res) => {
  const template = await Template.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true }
  );
  if (!template) return res.status(404).json({ success: false, message: 'Template não encontrado.' });
  res.json({ success: true, message: 'Template atualizado.', data: { template } });
}));

// DELETE /api/templates/:id
router.delete('/:id', checkPermission('templates:delete'), asyncHandler(async (req, res) => {
  const template = await Template.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!template) return res.status(404).json({ success: false, message: 'Template não encontrado.' });
  res.json({ success: true, message: 'Template removido.' });
}));

export default router;
