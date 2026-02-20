// ============================================================
// NexusCRM - Rotas de Gestão de Usuários
// ============================================================
import { Router } from 'express';
import crypto from 'crypto';
import User from '../../bancodedados/models/User.js';
import Tenant from '../../bancodedados/models/Tenant.js';
import Session from '../../bancodedados/models/Session.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, checkPermission, tenantIsolation } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Todos os endpoints requerem autenticação e isolamento por tenant
router.use(authenticate, tenantIsolation);

// ============================================================
// GET /api/users - Listar usuários do tenant
// ============================================================
router.get('/', checkPermission('users:read'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query;

  const filter = { tenantId: req.tenantId };

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      users,
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
// GET /api/users/:id - Detalhes de um usuário
// ============================================================
router.get('/:id', checkPermission('users:read'), asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    tenantId: req.tenantId,
  }).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado.',
    });
  }

  res.json({
    success: true,
    data: { user },
  });
}));

// ============================================================
// POST /api/users/invite - Convidar novo usuário
// ============================================================
router.post('/invite', checkPermission('users:create'), asyncHandler(async (req, res) => {
  const { name, email, role, phone } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({
      success: false,
      message: 'Nome, email e role são obrigatórios.',
    });
  }

  // Verificar se já existe no tenant
  const existing = await User.findOne({
    email: email.toLowerCase(),
    tenantId: req.tenantId,
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Este e-mail já está cadastrado nesta empresa.',
    });
  }

  // Verificar limite do plano
  const tenant = await Tenant.findById(req.tenantId);
  if (!tenant.isWithinPlanLimits('users')) {
    return res.status(403).json({
      success: false,
      message: 'Limite de usuários do plano atingido. Faça upgrade.',
      code: 'PLAN_LIMIT_REACHED',
    });
  }

  // Gerar token de convite e senha temporária
  const inviteToken = crypto.randomBytes(32).toString('hex');
  const tempPassword = crypto.randomBytes(8).toString('hex');

  const user = await User.create({
    tenantId: req.tenantId,
    name,
    email: email.toLowerCase(),
    password: tempPassword,
    phone,
    role,
    status: 'pending',
    invitedBy: req.userId,
    invitedAt: new Date(),
    inviteToken,
    inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
  });

  // Atualizar contagem de uso
  tenant.usage.usersCount += 1;
  await tenant.save();

  // TODO: Enviar email de convite
  console.log(`📧 Convite enviado para ${email} | Token: ${inviteToken}`);

  res.status(201).json({
    success: true,
    message: `Convite enviado para ${email}`,
    data: {
      user: user.toSafeJSON(),
      ...(process.env.NODE_ENV === 'development' && { inviteToken, tempPassword }),
    },
  });
}));

// ============================================================
// PUT /api/users/:id - Atualizar usuário
// ============================================================
router.put('/:id', checkPermission('users:update'), asyncHandler(async (req, res) => {
  const { name, phone, role, avatar, preferences } = req.body;

  const user = await User.findOne({
    _id: req.params.id,
    tenantId: req.tenantId,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado.',
    });
  }

  // Apenas admin pode alterar role
  if (role && req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Apenas administradores podem alterar perfis.',
    });
  }

  // Não permitir alterar o próprio role para não-admin
  if (role && req.params.id === req.userId && role !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Você não pode rebaixar seu próprio perfil.',
    });
  }

  // Atualizar campos permitidos
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (role) user.role = role;
  if (avatar !== undefined) user.avatar = avatar;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();

  res.json({
    success: true,
    message: 'Usuário atualizado com sucesso.',
    data: { user: user.toSafeJSON() },
  });
}));

// ============================================================
// PATCH /api/users/:id/status - Ativar/Desativar usuário
// ============================================================
router.patch('/:id/status', authorize('admin'), asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status deve ser "active" ou "inactive".',
    });
  }

  // Não permitir desativar a si mesmo
  if (req.params.id === req.userId) {
    return res.status(400).json({
      success: false,
      message: 'Você não pode desativar sua própria conta.',
    });
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    { status },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado.',
    });
  }

  // Invalidar sessões se desativado
  if (status === 'inactive') {
    await Session.updateMany(
      { userId: req.params.id },
      { isValid: false }
    );
  }

  res.json({
    success: true,
    message: `Usuário ${status === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
    data: { user },
  });
}));

// ============================================================
// PATCH /api/users/:id/reset-password - Admin reseta senha
// ============================================================
router.patch('/:id/reset-password', authorize('admin'), asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Nova senha deve ter no mínimo 6 caracteres.',
    });
  }

  const user = await User.findOne({
    _id: req.params.id,
    tenantId: req.tenantId,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado.',
    });
  }

  user.password = newPassword;
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  // Invalidar sessões
  await Session.updateMany(
    { userId: req.params.id },
    { isValid: false }
  );

  res.json({
    success: true,
    message: 'Senha do usuário redefinida com sucesso.',
  });
}));

// ============================================================
// DELETE /api/users/:id - Remover usuário
// ============================================================
router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  if (req.params.id === req.userId) {
    return res.status(400).json({
      success: false,
      message: 'Você não pode remover sua própria conta.',
    });
  }

  const user = await User.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.tenantId,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado.',
    });
  }

  // Invalidar sessões
  await Session.deleteMany({ userId: req.params.id });

  // Atualizar contagem
  await Tenant.findByIdAndUpdate(req.tenantId, {
    $inc: { 'usage.usersCount': -1 },
  });

  res.json({
    success: true,
    message: 'Usuário removido com sucesso.',
  });
}));

export default router;
