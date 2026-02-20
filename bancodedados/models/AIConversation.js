import mongoose from 'mongoose';

const aiMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'summary', 'chart', 'table', 'insight'], default: 'text' },
  metadata: {
    module: String, // 'leads', 'pipeline', 'calendar', 'conversations', 'analytics'
    dataPoints: Number,
    processingTime: Number,
    sources: [String],
  },
  createdAt: { type: Date, default: Date.now },
});

const aiConversationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'Nova conversa' },
  messages: [aiMessageSchema],
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  tokensUsed: { type: Number, default: 0 },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'ai_conversations' });

aiConversationSchema.index({ tenantId: 1, userId: 1, lastMessageAt: -1 });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;
