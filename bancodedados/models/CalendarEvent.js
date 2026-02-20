// ============================================================
// NexusCRM - Model: CalendarEvent (Evento de Agenda)
// ============================================================
// Collection: calendar_events
// Eventos vinculados a leads/clientes
// ============================================================

import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['reuniao', 'ligacao', 'followup', 'demo', 'tarefa', 'outro'],
      default: 'outro',
    },

    // ---- Datas ----
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    timezone: { type: String, default: 'America/Sao_Paulo' },

    // ---- Recorrência ----
    recurrence: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
      interval: { type: Number, default: 1 },
      endDate: Date,
      daysOfWeek: [Number],
    },

    // ---- Vínculo com Lead ----
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    leadName: String,

    // ---- Participantes ----
    organizer: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      email: String,
    },
    attendees: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      email: String,
      status: { type: String, enum: ['pending', 'accepted', 'declined', 'tentative'], default: 'pending' },
    }],

    // ---- Lembretes ----
    reminders: [{
      type: { type: String, enum: ['email', 'push', 'sms'], default: 'push' },
      minutesBefore: { type: Number, default: 15 },
      sent: { type: Boolean, default: false },
    }],

    // ---- Local ----
    location: {
      type: { type: String, enum: ['presential', 'online', 'phone'] },
      address: String,
      meetingUrl: String,
      phoneNumber: String,
    },

    // ---- Integração Google Calendar ----
    googleCalendarId: String,
    googleEventId: String,
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'error', 'not_synced'],
      default: 'not_synced',
    },

    // ---- Status ----
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    completedAt: Date,
    cancelledAt: Date,
    cancelReason: String,

    // ---- Notas ----
    notes: String,
    outcome: String,

    // ---- Metadados ----
    color: { type: String, default: '#6366f1' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    collection: 'calendar_events',
  }
);

calendarEventSchema.index({ tenantId: 1, startDate: 1 });
calendarEventSchema.index({ tenantId: 1, leadId: 1 });
calendarEventSchema.index({ tenantId: 1, 'organizer.userId': 1 });
calendarEventSchema.index({ tenantId: 1, status: 1 });
calendarEventSchema.index({ googleEventId: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;
