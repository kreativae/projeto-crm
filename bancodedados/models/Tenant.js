import mongoose from 'mongoose';

const IntegrationSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  apiKey: { type: String, default: '' },
  apiSecret: { type: String, default: '' },
  active: { type: Boolean, default: false },
  webhookUrl: { type: String },
  metadata: { type: Map, of: String }
});

const WebhookSchema = new mongoose.Schema({
  url: { type: String, required: true },
  events: [{ type: String }],
  active: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  secret: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ApiKeySchema = new mongoose.Schema({
  key: { type: String, required: true },
  name: { type: String, default: 'Chave Padrão' },
  scopes: [{ type: String }],
  lastUsed: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const PipelineStageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#6366f1' },
  order: { type: Number, default: 0 },
});

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  email: { type: String },
  phone: { type: String },
  plan: {
    type: String,
    enum: ['free', 'starter', 'professional', 'pro', 'enterprise'],
    default: 'free'
  },
  status: { type: String, enum: ['active', 'inactive', 'trial', 'overdue'], default: 'active' },
  trialEndsAt: Date,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  settings: {
    language: { type: String, default: 'pt-BR' },
    timezone: { type: String, default: 'America/Sao_Paulo' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    currency: { type: String, default: 'BRL' }
  },

  branding: {
    logoUrl: { type: String },
    faviconUrl: { type: String },
    primaryColor: { type: String, default: '#6366f1' },
    secondaryColor: { type: String, default: '#a855f7' },
    companyName: { type: String },
    loginMessage: { type: String, default: 'Bem-vindo ao seu CRM' }
  },

  pipelineStages: {
    type: [PipelineStageSchema],
    default: [
      { name: 'Novo', color: '#6366f1', order: 0 },
      { name: 'Primeiro Contato', color: '#3b82f6', order: 1 },
      { name: 'Qualificação', color: '#a855f7', order: 2 },
      { name: 'Proposta', color: '#f59e0b', order: 3 },
      { name: 'Negociação', color: '#f97316', order: 4 },
      { name: 'Ganho', color: '#22c55e', order: 5 },
      { name: 'Perdido', color: '#ef4444', order: 6 },
    ],
  },

  integrations: [IntegrationSchema],
  webhooks: [WebhookSchema],
  apiKeys: [ApiKeySchema],

  billing: {
    nextInvoiceDate: { type: Date },
    paymentMethod: { type: String },
    lastPaymentStatus: { type: String }
  },

  usage: {
    usersCount: { type: Number, default: 0 },
    leadsCount: { type: Number, default: 0 },
    messagesCount: { type: Number, default: 0 },
    storageUsedMB: { type: Number, default: 0 },
  },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'tenants' });

const planLimits = {
  free: { users: 2, leads: 100 },
  starter: { users: 5, leads: 500 },
  professional: { users: 25, leads: 5000 },
  pro: { users: 25, leads: 5000 },
  enterprise: { users: 9999, leads: 999999 },
};

TenantSchema.methods.isWithinPlanLimits = function (resource) {
  const limits = planLimits[this.plan] || planLimits.free;
  if (resource === 'users') return this.usage.usersCount < limits.users;
  if (resource === 'leads') return this.usage.leadsCount < limits.leads;
  return true;
};

const Tenant = mongoose.model('Tenant', TenantSchema);
export default Tenant;
