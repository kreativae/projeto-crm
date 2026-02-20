// ============================================================
// NexusCRM - Rotas de Autenticação
// ============================================================
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import User from '../../bancodedados/models/User.js';
import Tenant from '../../bancodedados/models/Tenant.js';
import Session from '../../bancodedados/models/Session.js';
import { authenticate, generateTokens, verifyRefreshToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// ============================================================
// POST /api/auth/register - Registrar nova empresa + admin
// ============================================================
router.post('/register', asyncHandler(async (req, res) => {
  const { companyName, name, email, password, phone } = req.body;

  // Validações
  if (!companyName || !name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Todos os campos obrigatórios devem ser preenchidos.',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'A senha deve ter no mínimo 6 caracteres.',
    });
  }

  // Verificar se email já existe
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Este e-mail já está cadastrado.',
    });
  }

  // Criar Tenant (empresa)
  const tenant = await Tenant.create({
    name: companyName,
    email: email.toLowerCase(),
    phone,
    status: 'trial',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
  });

  // Criar Usuário Admin
  const user = await User.create({
    tenantId: tenant._id,
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role: 'admin',
    status: 'active',
    emailVerified: true,
  });

  // Atualizar tenant com ownerId
  tenant.ownerId = user._id;
  tenant.usage.usersCount = 1;
  await tenant.save();

  // Gerar tokens
  const { accessToken, refreshToken } = generateTokens(
    user._id.toString(),
    tenant._id.toString()
  );

  // Criar sessão
  await Session.create({
    userId: user._id,
    tenantId: tenant._id,
    refreshToken,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.status(201).json({
    success: true,
    message: 'Empresa registrada com sucesso!',
    data: {
      user: user.toSafeJSON(),
      tenant: {
        id: tenant._id,
        name: tenant.name,
        plan: tenant.plan,
        slug: tenant.slug,
      },
      tokens: { accessToken, refreshToken },
    },
  });
}));

// ============================================================
// POST /api/auth/login - Login
// ============================================================
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'E-mail e senha são obrigatórios.',
    });
  }

  // Buscar usuário com senha
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'E-mail ou senha incorretos.',
    });
  }

  // Verificar bloqueio
  if (user.isLocked()) {
    return res.status(423).json({
      success: false,
      message: 'Conta temporariamente bloqueada por excesso de tentativas. Tente em 30 minutos.',
      code: 'ACCOUNT_LOCKED',
    });
  }

  // Verificar status
  if (user.status === 'inactive' || user.status === 'blocked') {
    return res.status(403).json({
      success: false,
      message: 'Sua conta está desativada. Contate o administrador.',
    });
  }

  // Verificar senha
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    return res.status(401).json({
      success: false,
      message: 'E-mail ou senha incorretos.',
    });
  }

  // Resetar tentativas
  await user.resetLoginAttempts();

  // Gerar tokens
  const { accessToken, refreshToken } = generateTokens(
    user._id.toString(),
    user.tenantId.toString()
  );

  // Invalidar sessões anteriores (opcional: manter múltiplas)
  await Session.updateMany(
    { userId: user._id },
    { isValid: false }
  );

  // Criar nova sessão
  await Session.create({
    userId: user._id,
    tenantId: user.tenantId,
    refreshToken,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Buscar tenant
  const tenant = await Tenant.findById(user.tenantId).select('name plan slug branding');

  res.json({
    success: true,
    message: 'Login realizado com sucesso!',
    data: {
      user: user.toSafeJSON(),
      tenant: tenant ? {
        id: tenant._id,
        name: tenant.name,
        plan: tenant.plan,
        slug: tenant.slug,
        branding: tenant.branding,
      } : null,
      tokens: { accessToken, refreshToken },
    },
  });
}));

// ============================================================
// POST /api/auth/refresh - Refresh Token
// ============================================================
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token é obrigatório.',
    });
  }

  // Verificar token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Refresh token inválido ou expirado.',
    });
  }

  // Verificar sessão
  const session = await Session.findOne({
    userId: decoded.userId,
    refreshToken,
    isValid: true,
  });

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Sessão inválida. Faça login novamente.',
    });
  }

  // Gerar novos tokens
  const tokens = generateTokens(decoded.userId, decoded.tenantId);

  // Atualizar sessão
  session.refreshToken = tokens.refreshToken;
  session.lastActivity = new Date();
  await session.save();

  res.json({
    success: true,
    data: { tokens },
  });
}));

// ============================================================
// POST /api/auth/logout - Logout
// ============================================================
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  // Invalidar sessão atual
  await Session.updateMany(
    { userId: req.userId },
    { isValid: false }
  );

  res.json({
    success: true,
    message: 'Logout realizado com sucesso.',
  });
}));

// ============================================================
// POST /api/auth/forgot-password - Esqueci minha senha
// ============================================================
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'E-mail é obrigatório.',
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Sempre retorna sucesso (segurança: não revelar se email existe)
  if (!user) {
    return res.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.',
    });
  }

  // Gerar token de reset
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  await user.save({ validateBeforeSave: false });

  // TODO: Enviar email com link de reset
  // const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  // await sendEmail({ to: user.email, subject: 'Recuperação de Senha', html: ... });

  console.log(`🔑 Token de reset para ${email}: ${resetToken}`);

  res.json({
    success: true,
    message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.',
    // Em dev, retornar token para facilitar testes
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  });
}));

// ============================================================
// POST /api/auth/reset-password - Redefinir senha
// ============================================================
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token e nova senha são obrigatórios.',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'A nova senha deve ter no mínimo 6 caracteres.',
    });
  }

  // Hash do token para comparação
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpiresAt');

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Token inválido ou expirado.',
    });
  }

  // Atualizar senha
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  // Invalidar todas as sessões
  await Session.updateMany(
    { userId: user._id },
    { isValid: false }
  );

  res.json({
    success: true,
    message: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
  });
}));

// ============================================================
// GET /api/auth/me - Dados do usuário logado
// ============================================================
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  const tenant = await Tenant.findById(req.tenantId).select('name plan slug branding settings');

  res.json({
    success: true,
    data: {
      user: user.toSafeJSON(),
      tenant,
    },
  });
}));

export default router;
