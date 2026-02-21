import express from 'express';
import mongoose from 'mongoose';
import Lead from '../../bancodedados/models/Lead.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Helper function para garantir ObjectId válido
const ensureObjectId = (value) => {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return value instanceof mongoose.Types.ObjectId ? value : new mongoose.Types.ObjectId(value);
  }
  return value;
};

// Todos os endpoints requerem autenticação e isolamento por tenant
router.use(authenticate, tenantIsolation);

// ==============================
// CRUD de Leads
// ==============================

// GET /api/leads — Listar todos os leads do tenant
router.get('/', asyncHandler(async (req, res) => {
  const { status, isClient, search, source, tag, page = 1, limit = 50 } = req.query;
  
  const filter = { tenantId: req.tenantId };
  if (status) filter.status = status;
  if (isClient !== undefined) filter.isClient = isClient === 'true';
  if (source) filter.source = source;
  if (tag) filter.tags = tag;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'company.name': { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('responsibleId', 'name email avatar'),
    Lead.countDocuments(filter),
  ]);

  res.json({ 
    success: true,
    leads, 
    total, 
    page: Number(page), 
    pages: Math.ceil(total / Number(limit)) 
  });
}));

// GET /api/leads/:id — Detalhe completo do lead
router.get('/:id', asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.tenantId })
    .populate('responsibleId', 'name email avatar')
    .populate('interactions.userId', 'name avatar')
    .populate('documents.uploadedBy', 'name avatar');

  if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });
  res.json({ success: true, data: lead, lead }); // Enviar lead direto também para compatibilidade
}));

// POST /api/leads — Criar lead
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, phone, mobile, company, value, status, source, tags, temperature, score, notes } = req.body;

  // Validações básicas
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Nome é obrigatório' });
  }

  const leadData = {
    name: name.trim(),
    email: email?.toLowerCase().trim() || undefined,
    phone: phone?.trim() || undefined,
    mobile: mobile?.trim() || undefined,
    company: company || undefined,
    value: value ? Number(value) : 0,
    status: status || 'novo',
    source: source || 'outro',
    tags: Array.isArray(tags) ? tags : [],
    temperature: temperature || 'cold',
    score: score || 0,
    notes: notes || undefined,
    tenantId: req.tenantId,
  };

  const lead = new Lead(leadData);
  
  lead.interactions.push({
    type: 'system',
    content: 'Lead criado no sistema',
    userId: req.user._id,
    userName: req.user.name || 'Sistema',
  });

  await lead.save();
  res.status(201).json({ success: true, data: lead, lead });
}));

// PUT /api/leads/:id — Atualizar lead
router.put('/:id', asyncHandler(async (req, res) => {
  const leadId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    return res.status(400).json({ success: false, error: 'ID do lead inválido' });
  }

  const updateData = { ...req.body };
  delete updateData.tenantId; // Proteção: nunca permitir mudar o tenantId
  delete updateData._id;

  const lead = await Lead.findOneAndUpdate(
    { _id: leadId, tenantId: req.tenantId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
  
  if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });
  res.json({ success: true, data: lead, lead });
}));

// DELETE /api/leads/:id — Excluir lead
router.delete('/:id', asyncHandler(async (req, res) => {
  const lead = await Lead.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });
  res.json({ success: true, message: 'Lead excluído com sucesso' });
}));

// ==============================
// Interações & Documentos
// ==============================

// POST /api/leads/:id/interactions — Adicionar interação
router.post('/:id/interactions', asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });

  lead.interactions.push({
    type: req.body.type || 'note',
    content: req.body.content,
    userId: req.user._id,
    userName: req.user.name,
    metadata: req.body.metadata,
  });
  lead.lastContactAt = new Date();
  await lead.save();
  res.status(201).json({ success: true, data: lead });
}));

// POST /api/leads/:id/documents — Anexar documento (Base64)
router.post('/:id/documents', asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });

  const doc = {
    name: req.body.name,
    type: req.body.type || 'outro',
    mimeType: req.body.mimeType,
    size: req.body.size,
    data: req.body.data,
    uploadedBy: req.user._id,
    uploadedByName: req.user.name,
  };

  lead.documents.push(doc);
  lead.interactions.push({
    type: 'document',
    content: `Documento "${req.body.name}" anexado`,
    userId: req.user._id,
    userName: req.user.name,
  });
  await lead.save();
  res.status(201).json({ success: true, data: lead });
}));

// DELETE /api/leads/:id/documents/:docId — Remover documento
router.delete('/:id/documents/:docId', asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });

  lead.documents = lead.documents.filter(d => d._id.toString() !== req.params.docId);
  await lead.save();
  res.json({ success: true, data: lead });
}));

// ==============================
// Operações Especiais
// ==============================

// POST /api/leads/:id/convert — Converter lead para cliente
router.post('/:id/convert', asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });

  lead.isClient = true;
  lead.convertedToClientAt = new Date();
  lead.status = 'ganho';
  lead.interactions.push({
    type: 'conversion',
    content: 'Lead convertido para Cliente',
    userId: req.user._id,
    userName: req.user.name,
  });
  await lead.save();
  res.json({ success: true, data: lead });
}));

// GET /api/leads/:id/messages — Buscar mensagens trocadas com este lead
router.get('/:id/messages', asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });

  const conditions = [];
  if (lead.email) conditions.push({ 'contact.email': lead.email });
  if (lead.phone) conditions.push({ 'contact.phone': lead.phone });
  if (lead.mobile) conditions.push({ 'contact.phone': lead.mobile });

  if (conditions.length === 0) return res.json({ success: true, data: [] });

  const conversations = await Conversation.find({
    tenantId: req.tenantId,
    $or: conditions,
  }).sort({ updatedAt: -1 }).limit(50);

  res.json({ success: true, data: conversations });
}));

// GET /api/leads/:id/meetings — Buscar reuniões/eventos vinculados
router.get('/:id/meetings', asyncHandler(async (req, res) => {
  const events = await CalendarEvent.find({
    tenantId: req.tenantId,
    leadId: req.params.id,
  }).sort({ startDate: -1 }).limit(20);

  res.json({ success: true, data: events });
}));

export default router;


export default router;
