// ============================================================
// NexusCRM - Model: Message & Conversation
// ============================================================
// Collections: messages, conversations
// Central de Conversas Omnichannel
// ============================================================

import mongoose from 'mongoose';

// ---- MENSAGEM ----
const messageSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      index: true,
    },
    channel: {
      type: String,
      enum: ['whatsapp', 'instagram', 'facebook', 'telegram', 'email'],
      required: true,
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'template', 'interactive'],
      default: 'text',
    },
    content: {
      text: String,
      mediaUrl: String,
      mediaType: String,
      fileName: String,
      caption: String,
      latitude: Number,
      longitude: Number,
      templateName: String,
      templateParams: [String],
    },
    senderName: String,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending',
    },
    externalId: String, // ID da mensagem na API externa (WhatsApp, etc.)
    metadata: mongoose.Schema.Types.Mixed,
    isAutomated: {
      type: Boolean,
      default: false,
    },
    automationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Automation',
    },
  },
  {
    timestamps: true,
    collection: 'messages',
  }
);

messageSchema.index({ tenantId: 1, conversationId: 1, createdAt: -1 });
messageSchema.index({ tenantId: 1, leadId: 1, createdAt: -1 });
messageSchema.index({ externalId: 1 });

// ---- CONVERSA ----
const conversationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['whatsapp', 'instagram', 'facebook', 'telegram', 'email'],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'pending', 'resolved', 'closed'],
      default: 'open',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedToName: String,
    lastMessage: {
      content: String,
      direction: String,
      timestamp: Date,
      senderName: String,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    // Dados do contato externo
    externalContactId: String,
    externalContactName: String,
    externalContactPhone: String,
    externalContactEmail: String,
    // Timestamps
    firstMessageAt: Date,
    lastMessageAt: Date,
    resolvedAt: Date,
    closedAt: Date,
  },
  {
    timestamps: true,
    collection: 'conversations',
  }
);

conversationSchema.index({ tenantId: 1, status: 1 });
conversationSchema.index({ tenantId: 1, leadId: 1, channel: 1 });
conversationSchema.index({ tenantId: 1, assignedTo: 1 });
conversationSchema.index({ tenantId: 1, lastMessageAt: -1 });

// ---- Método: atualizar última mensagem ----
conversationSchema.methods.updateLastMessage = async function (message) {
  this.lastMessage = {
    content: message.content.text || '[Mídia]',
    direction: message.direction,
    timestamp: message.createdAt,
    senderName: message.senderName,
  };
  this.lastMessageAt = message.createdAt;

  if (message.direction === 'inbound') {
    this.unreadCount += 1;
  }

  return this.save();
};

export const Message = mongoose.model('Message', messageSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);
export default { Message, Conversation };
