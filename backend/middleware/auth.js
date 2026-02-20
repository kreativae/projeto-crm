// ============================================================
// NexusCRM - Middleware de Autenticação JWT
// ============================================================
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../../bancodedados/models/User.js';
import Session from '../../bancodedados/models/Session.js';

/**
 * Middleware de autenticação via JWT
 * Verifica o token de acesso e injeta req.user e req.tenantId
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido.',
        code: 'AUTH_TOKEN_MISSING',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar e decodificar token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Faça refresh ou login novamente.',
          code: 'AUTH_TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token inválido.',
        code: 'AUTH_TOKEN_INVALID',
      });
    }

    // Verificar se sessão ainda é válida
    const session = await Session.findOne({
      userId: decoded.userId,
      isValid: true,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Sessão invalidada. Faça login novamente.',
        code: 'AUTH_SESSION_INVALID',
      });
    }

    // Buscar usuário
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado.',
        code: 'AUTH_USER_NOT_FOUND',
      });
    }

    // Verificar se o usuário está ativo
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Sua conta está desativada. Contate o administrador.',
        code: 'AUTH_USER_INACTIVE',
      });
    }

    // Injetar dados no request
    req.user = user;
    req.userId = user._id.toString();
    req.tenantId = decoded.tenantId || user.tenantId.toString();
    req.userRole = user.role;
    req.sessionId = session._id.toString();

    // Atualizar último acesso da sessão
    session.lastActivity = new Date();
    await session.save();

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno de autenticação.',
      code: 'AUTH_INTERNAL_ERROR',
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Não bloqueia se não houver token, mas injeta req.user se houver
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.userId).select('-password');

    if (user && user.status === 'active') {
      req.user = user;
      req.userId = user._id.toString();
      req.tenantId = decoded.tenantId || user.tenantId.toString();
      req.userRole = user.role;
    }

    next();
  } catch {
    next();
  }
};

/**
 * Gerar tokens de acesso e refresh
 */
export const generateTokens = (userId, tenantId) => {
  const accessToken = jwt.sign(
    { userId, tenantId, type: 'access' },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, tenantId, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

/**
 * Verificar refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};
