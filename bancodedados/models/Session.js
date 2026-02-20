// ============================================================
// NexusCRM - Model: Session (Sessão)
// ============================================================
// Collection: sessions
// Controle de sessões ativas para invalidação de JWT
// ============================================================

import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    userAgent: String,
    ipAddress: String,
    isValid: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL - auto-delete quando expirar
    },
  },
  {
    timestamps: true,
    collection: 'sessions',
  }
);

sessionSchema.index({ userId: 1, isValid: 1 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
