// ============================================================
// NexusCRM - Model: User (Usuário)
// ============================================================
// Collection: users
// Usuários da plataforma, vinculados a um tenant
// ============================================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // ---- Referência ao Tenant ----
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant é obrigatório'],
      index: true,
    },

    // ---- Dados Pessoais ----
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      maxlength: [150, 'Nome deve ter no máximo 150 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'E-mail inválido'],
    },
    password: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
      select: false, // Não retorna por padrão nas queries
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },

    // ---- Role / Permissões ----
    role: {
      type: String,
      enum: {
        values: ['admin', 'gestor', 'vendedor', 'suporte'],
        message: 'Role inválida: {VALUE}',
      },
      default: 'vendedor',
    },

    // ---- Status ----
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'blocked'],
      default: 'pending',
    },

    // ---- Convite ----
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    invitedAt: Date,
    inviteToken: String,
    inviteExpiresAt: Date,

    // ---- Recuperação de Senha ----
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiresAt: {
      type: Date,
      select: false,
    },

    // ---- Segurança ----
    lastLogin: Date,
    lastLoginIP: String,
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },

    // ---- Multi-tenant: Empresas adicionais ----
    additionalTenants: [
      {
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
        role: { type: String, enum: ['admin', 'gestor', 'vendedor', 'suporte'] },
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    // ---- Preferências ----
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
      language: { type: String, default: 'pt-BR' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        newMessage: { type: Boolean, default: true },
        newLead: { type: Boolean, default: true },
        stageChange: { type: Boolean, default: false },
        reminders: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// ---- Compound Indexes ----
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ tenantId: 1, status: 1 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ inviteToken: 1 });

// ---- Pre-save: Hash de senha ----
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ---- Métodos de Instância ----

/**
 * Comparar senha fornecida com hash armazenado
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Verificar se a conta está bloqueada
 */
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

/**
 * Incrementar tentativas falhas de login
 */
userSchema.methods.incrementLoginAttempts = async function () {
  // Se o lock expirou, resetar
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };

  // Bloquear após 5 tentativas (30 minutos)
  if (this.failedLoginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

/**
 * Resetar tentativas de login após sucesso
 */
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { failedLoginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });
};

/**
 * Retornar dados seguros (sem campos sensíveis)
 */
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiresAt;
  delete obj.emailVerificationToken;
  delete obj.inviteToken;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
