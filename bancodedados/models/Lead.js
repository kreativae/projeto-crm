import mongoose from 'mongoose';

// ---- Sub-schema: Documentos Anexados ----
const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['cpf', 'cnpj', 'rg', 'contrato', 'proposta', 'nf', 'comprovante', 'outro'], default: 'outro' },
  mimeType: String,
  size: Number,
  data: String, // Base64
  url: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedByName: String,
  createdAt: { type: Date, default: Date.now },
});

// ---- Sub-schema: Interações ----
const interactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['note', 'call', 'email', 'meeting', 'whatsapp', 'instagram', 'facebook', 'telegram', 'stage_change', 'task', 'system', 'document', 'proposal', 'conversion'],
    required: true,
  },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

// ---- Sub-schema: Contato Adicional ----
const contactSchema = new mongoose.Schema({
  name: String,
  role: String,
  email: String,
  phone: String,
  isPrimary: { type: Boolean, default: false },
});

const leadSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    // ---- Dados Básicos ----
    name: { type: String, required: [true, 'Nome é obrigatório'], trim: true, maxlength: 200 },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    mobile: { type: String, trim: true },
    type: { type: String, enum: ['PF', 'PJ'], default: 'PF' },
    document: { type: String, trim: true }, // CPF ou CNPJ
    rg: { type: String, trim: true },
    birthDate: Date,
    gender: { type: String, enum: ['M', 'F', 'O', ''], default: '' },
    profession: String,
    avatar: String,

    // ---- Dados PJ ----
    company: {
      name: String,
      tradeName: String,
      website: String,
      industry: String,
      employeesCount: Number,
      annualRevenue: Number,
      foundedAt: Date,
    },

    // ---- Contatos Adicionais (PJ) ----
    contacts: [contactSchema],

    // ---- Endereço ----
    address: {
      street: String, number: String, complement: String,
      neighborhood: String, city: String, state: String,
      zipCode: String, country: { type: String, default: 'BR' },
    },

    // ---- Pipeline ----
    stage: { type: String, default: 'Novo' },
    status: {
      type: String,
      enum: ['novo', 'contatado', 'qualificado', 'proposta', 'negociacao', 'ganho', 'perdido'],
      default: 'novo',
    },

    // ---- Classificação ----
    source: {
      type: String,
      enum: ['google_ads', 'facebook_ads', 'instagram', 'linkedin', 'website', 'indicacao', 'telegram', 'email', 'telefone', 'evento', 'outro'],
      default: 'outro',
    },
    sourceDetails: String,
    tags: [{ type: String, trim: true }],
    score: { type: Number, default: 0, min: 0, max: 100 },
    temperature: { type: String, enum: ['cold', 'warm', 'hot'], default: 'cold' },

    // ---- Financeiro ----
    value: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'BRL' },
    probability: { type: Number, default: 0, min: 0, max: 100 },
    monthlyRevenue: { type: Number, default: 0 },

    // ---- Responsável ----
    responsibleId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responsibleName: String,

    // ---- Documentos Anexados ----
    documents: [documentSchema],

    // ---- Histórico de Interações ----
    interactions: [interactionSchema],

    // ---- Observações ----
    notes: String,
    customFields: mongoose.Schema.Types.Mixed,

    // ---- Datas ----
    firstContactAt: Date,
    lastContactAt: Date,
    wonAt: Date,
    lostAt: Date,
    lostReason: String,
    convertedToClientAt: Date,
    isClient: { type: Boolean, default: false },
    nextFollowUp: Date,
  },
  { timestamps: true, collection: 'leads' }
);

// ---- Indexes ----
leadSchema.index({ tenantId: 1, status: 1 });
leadSchema.index({ tenantId: 1, stage: 1 });
leadSchema.index({ tenantId: 1, responsibleId: 1 });
leadSchema.index({ tenantId: 1, isClient: 1 });
leadSchema.index({ tenantId: 1, createdAt: -1 });
leadSchema.index({ tenantId: 1, name: 'text', 'company.name': 'text' });

// ---- Pre-save ----
leadSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'ganho') { this.wonAt = new Date(); this.isClient = true; this.convertedToClientAt = new Date(); }
    if (this.status === 'perdido') this.lostAt = new Date();
    if (this.status === 'contatado' && !this.firstContactAt) this.firstContactAt = new Date();
  }
  next();
});

// ---- Métodos ----
leadSchema.methods.addInteraction = function (type, content, userId, userName, metadata) {
  this.interactions.push({ type, content, userId, userName, metadata });
  this.lastContactAt = new Date();
  return this.save();
};

leadSchema.methods.addDocument = function (doc) {
  this.documents.push(doc);
  this.interactions.push({
    type: 'document',
    content: `Documento "${doc.name}" anexado`,
    userId: doc.uploadedBy,
    userName: doc.uploadedByName,
  });
  return this.save();
};

leadSchema.methods.convertToClient = function (userId, userName) {
  this.isClient = true;
  this.convertedToClientAt = new Date();
  this.status = 'ganho';
  this.interactions.push({
    type: 'conversion',
    content: 'Lead convertido para Cliente',
    userId,
    userName,
  });
  return this.save();
};

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
