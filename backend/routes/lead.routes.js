import express from 'express';

const router = express.Router();

// Middleware placeholder (substituir pelos reais)
const auth = (req, res, next) => {
  req.user = req.user || { _id: 'demo', tenantId: 'demo', name: 'Demo' };
  req.tenantId = req.user.tenantId;
  next();
};

router.use(auth);

// ==============================
// CRUD de Leads
// ==============================

// GET /api/leads — Listar todos os leads do tenant
router.get('/', async (req, res) => {
  try {
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
      req.app.locals.Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('responsibleId', 'name email avatar'),
      req.app.locals.Lead.countDocuments(filter),
    ]);

    res.json({ leads, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/:id — Detalhe completo do lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await req.app.locals.Lead.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('responsibleId', 'name email avatar')
      .populate('interactions.userId', 'name avatar')
      .populate('documents.uploadedBy', 'name avatar');

    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads — Criar lead
router.post('/', async (req, res) => {
  try {
    const lead = new req.app.locals.Lead({
      ...req.body,
      tenantId: req.tenantId,
    });
    lead.interactions.push({
      type: 'system',
      content: 'Lead criado no sistema',
      userId: req.user._id,
      userName: req.user.name,
    });
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/leads/:id — Atualizar lead
router.put('/:id', async (req, res) => {
  try {
    const lead = await req.app.locals.Lead.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/leads/:id — Excluir lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await req.app.locals.Lead.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });
    res.json({ message: 'Lead excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// Interações
// ==============================

// POST /api/leads/:id/interactions — Adicionar interação
router.post('/:id/interactions', async (req, res) => {
  try {
    const lead = await req.app.locals.Lead.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });

    lead.interactions.push({
      type: req.body.type || 'note',
      content: req.body.content,
      userId: req.user._id,
      userName: req.user.name,
      metadata: req.body.metadata,
    });
    lead.lastContactAt = new Date();
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==============================
// Documentos
// ==============================

// POST /api/leads/:id/documents — Anexar documento (Base64)
router.post('/:id/documents', async (req, res) => {
  try {
    const lead = await req.app.locals.Lead.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });

    const doc = {
      name: req.body.name,
      type: req.body.type || 'outro',
      mimeType: req.body.mimeType,
      size: req.body.size,
      data: req.body.data, // Base64
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
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/leads/:id/documents/:docId — Remover documento
router.delete('/:id/documents/:docId', async (req, res) => {
  try {
    const lead = await req.app.locals.Lead.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });

    lead.documents = lead.documents.filter(d => d._id.toString() !== req.params.docId);
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// Converter Lead → Cliente
// ==============================

// POST /api/leads/:id/convert — Converter lead para cliente
router.post('/:id/convert', async (req, res) => {
  try {
    const lead = await req.app.locals.Lead.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });

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
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==============================
// Mensagens do Lead (buscar conversas)
// ==============================

// GET /api/leads/:id/messages — Buscar mensagens trocadas com este lead
router.get('/:id/messages', async (req, res) => {
  try {
    const lead = await req.app.locals.Lead.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });

    // Buscar conversas pelo email ou telefone do lead
    const Message = req.app.locals.Message;
    if (!Message) return res.json([]);

    const conditions = [];
    if (lead.email) conditions.push({ 'contact.email': lead.email });
    if (lead.phone) conditions.push({ 'contact.phone': lead.phone });
    if (lead.mobile) conditions.push({ 'contact.phone': lead.mobile });

    if (conditions.length === 0) return res.json([]);

    const conversations = await Message.find({
      tenantId: req.tenantId,
      $or: conditions,
    }).sort({ updatedAt: -1 }).limit(50);

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// Reuniões do Lead (buscar eventos)
// ==============================

// GET /api/leads/:id/meetings — Buscar reuniões/eventos vinculados
router.get('/:id/meetings', async (req, res) => {
  try {
    const CalendarEvent = req.app.locals.CalendarEvent;
    if (!CalendarEvent) return res.json([]);

    const events = await CalendarEvent.find({
      tenantId: req.tenantId,
      leadId: req.params.id,
    }).sort({ startDate: -1 }).limit(20);

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
