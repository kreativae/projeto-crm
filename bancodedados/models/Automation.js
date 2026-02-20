// ============================================================
// NexusCRM - Model: Automation (Automação)
// ============================================================
// Collection: automations
// Fluxos automáticos com gatilhos e ações
// ============================================================

import mongoose from 'mongoose';

const actionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'send_whatsapp', 'send_email', 'send_sms', 'send_telegram',
      'assign_lead', 'change_stage', 'add_tag', 'remove_tag',
      'create_task', 'create_event', 'notify_user', 'webhook',
      'wait', 'condition',
    ],
    required: true,
  },
  config: {
    // Mensagem
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
    message: String,
    // Atribuição
    assignTo: { type: String, enum: ['specific_user', 'round_robin', 'least_busy'] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Stage
    targetStage: String,
    // Tags
    tagName: String,
    // Wait
    waitDuration: Number, // em minutos
    // Webhook
    webhookUrl: String,
    webhookMethod: { type: String, enum: ['GET', 'POST', 'PUT'] },
    // Condição
    conditionField: String,
    conditionOperator: { type: String, enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'] },
    conditionValue: String,
  },
  order: { type: Number, default: 0 },
});

const executionLogSchema = new mongoose.Schema({
  triggeredAt: { type: Date, default: Date.now },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  leadName: String,
  status: { type: String, enum: ['success', 'failed', 'partial'], default: 'success' },
  actionsExecuted: Number,
  error: String,
  duration: Number, // em ms
});

const automationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Nome da automação é obrigatório'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 500,
    },

    // ---- Gatilho (Trigger) ----
    trigger: {
      type: {
        type: String,
        enum: [
          'lead_created', 'lead_updated', 'lead_stage_changed',
          'message_received', 'message_sent',
          'form_submitted', 'tag_added',
          'date_based', 'inactivity',
          'deal_won', 'deal_lost',
          'webhook_received',
        ],
        required: true,
      },
      conditions: {
        channel: String,
        stage: String,
        source: String,
        tag: String,
        inactivityDays: Number,
        dateField: String,
        daysBefore: Number,
        daysAfter: Number,
      },
    },

    // ---- Ações ----
    actions: [actionSchema],

    // ---- Status ----
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'draft',
    },

    // ---- Estatísticas ----
    stats: {
      executionCount: { type: Number, default: 0 },
      successCount: { type: Number, default: 0 },
      failCount: { type: Number, default: 0 },
      lastExecutedAt: Date,
      avgDuration: { type: Number, default: 0 },
    },

    // ---- Log de execuções (últimas 100) ----
    executionLog: {
      type: [executionLogSchema],
      validate: {
        validator: function (v) { return v.length <= 100; },
        message: 'Log de execução limitado a 100 registros',
      },
    },

    // ---- Criador ----
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'automations',
  }
);

automationSchema.index({ tenantId: 1, status: 1 });
automationSchema.index({ tenantId: 1, 'trigger.type': 1 });

// ---- Métodos ----
automationSchema.methods.execute = async function (leadId, leadName) {
  const startTime = Date.now();

  try {
    this.stats.executionCount += 1;
    this.stats.successCount += 1;
    this.stats.lastExecutedAt = new Date();

    const duration = Date.now() - startTime;
    this.stats.avgDuration =
      (this.stats.avgDuration * (this.stats.executionCount - 1) + duration) /
      this.stats.executionCount;

    // Adicionar ao log
    if (this.executionLog.length >= 100) {
      this.executionLog.shift();
    }
    this.executionLog.push({
      leadId,
      leadName,
      status: 'success',
      actionsExecuted: this.actions.length,
      duration,
    });

    await this.save();
    return { success: true, duration };
  } catch (error) {
    this.stats.failCount += 1;

    this.executionLog.push({
      leadId,
      leadName,
      status: 'failed',
      actionsExecuted: 0,
      error: error.message,
      duration: Date.now() - startTime,
    });

    await this.save();
    return { success: false, error: error.message };
  }
};

const Automation = mongoose.model('Automation', automationSchema);
export default Automation;
