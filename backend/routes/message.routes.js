// ============================================================
// NexusCRM - Rotas de Mensagens & Conversas
// ============================================================
import { Router } from 'express';
import { Message, Conversation } from '../../bancodedados/models/Message.js';
import { authenticate } from '../middleware/auth.js';
import { checkPermission, tenantIsolation } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(authenticate, tenantIsolation);

// ============================================================
// GET /api/messages/conversations - Listar conversas
// ============================================================
router.get('/conversations', checkPermission('messages:read'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, channel, status, search } = req.query;

  const filter = { tenantId: req.tenantId };
  if (channel) filter.channel = channel;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { externalContactName: { $regex: search, $options: 'i' } },
      { 'lastMessage.content': { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [conversations, total] = await Promise.all([
    Conversation.find(filter)
      .populate('leadId', 'name email phone')
      .populate('assignedTo', 'name avatar')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Conversation.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      conversations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
}));

// ============================================================
// GET /api/messages/conversations/:id/messages - Mensagens de uma conversa
// ============================================================
router.get('/conversations/:id/messages', checkPermission('messages:read'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const conversation = await Conversation.findOne({
    _id: req.params.id,
    tenantId: req.tenantId,
  });

  if (!conversation) {
    return res.status(404).json({ success: false, message: 'Conversa não encontrada.' });
  }

  const [messages, total] = await Promise.all([
    Message.find({
      conversationId: req.params.id,
      tenantId: req.tenantId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Message.countDocuments({
      conversationId: req.params.id,
      tenantId: req.tenantId,
    }),
  ]);

  // Marcar como lidas
  await Message.updateMany(
    { conversationId: req.params.id, direction: 'inbound', status: { $ne: 'read' } },
    { status: 'read' }
  );
  conversation.unreadCount = 0;
  await conversation.save();

  res.json({
    success: true,
    data: {
      messages: messages.reverse(),
      conversation,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    },
  });
}));

// ============================================================
// POST /api/messages/send - Enviar mensagem
// ============================================================
router.post('/send', checkPermission('messages:create'), asyncHandler(async (req, res) => {
  const { conversationId, leadId, channel, content, type = 'text' } = req.body;

  if (!conversationId || !content) {
    return res.status(400).json({
      success: false,
      message: 'conversationId e content são obrigatórios.',
    });
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    tenantId: req.tenantId,
  });

  if (!conversation) {
    return res.status(404).json({ success: false, message: 'Conversa não encontrada.' });
  }

  // Criar mensagem
  const message = await Message.create({
    tenantId: req.tenantId,
    conversationId,
    leadId: leadId || conversation.leadId,
    channel: channel || conversation.channel,
    direction: 'outbound',
    type,
    content: typeof content === 'string' ? { text: content } : content,
    senderName: req.user.name,
    senderId: req.userId,
    status: 'sent',
  });

  // Atualizar conversa
  await conversation.updateLastMessage(message);

  // TODO: Enviar mensagem via API do canal (WhatsApp, Telegram, etc.)
  // await channelService.send(conversation.channel, message);

  res.status(201).json({
    success: true,
    message: 'Mensagem enviada.',
    data: { message },
  });
}));

// ============================================================
// POST /api/messages/webhook/:channel - Receber mensagem (webhook)
// ============================================================
router.post('/webhook/:channel', asyncHandler(async (req, res) => {
  const { channel } = req.params;

  // TODO: Verificar assinatura do webhook por canal
  // TODO: Processar payload específico de cada canal
  // TODO: Criar/atualizar conversa e mensagem
  // TODO: Disparar automações

  console.log(`📨 Webhook recebido (${channel}):`, JSON.stringify(req.body).slice(0, 200));

  res.status(200).json({ success: true });
}));

// ============================================================
// PATCH /api/messages/conversations/:id/assign - Atribuir conversa
// ============================================================
router.patch('/conversations/:id/assign', checkPermission('messages:create'), asyncHandler(async (req, res) => {
  const { userId, userName } = req.body;

  const conversation = await Conversation.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    { assignedTo: userId, assignedToName: userName },
    { new: true }
  );

  if (!conversation) {
    return res.status(404).json({ success: false, message: 'Conversa não encontrada.' });
  }

  res.json({
    success: true,
    message: 'Conversa atribuída.',
    data: { conversation },
  });
}));

// ============================================================
// PATCH /api/messages/conversations/:id/status - Alterar status
// ============================================================
router.patch('/conversations/:id/status', checkPermission('messages:create'), asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['open', 'pending', 'resolved', 'closed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status inválido.' });
  }

  const updates = { status };
  if (status === 'resolved') updates.resolvedAt = new Date();
  if (status === 'closed') updates.closedAt = new Date();

  const conversation = await Conversation.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    updates,
    { new: true }
  );

  if (!conversation) {
    return res.status(404).json({ success: false, message: 'Conversa não encontrada.' });
  }

  res.json({
    success: true,
    message: `Conversa marcada como "${status}".`,
    data: { conversation },
  });
}));

export default router;
