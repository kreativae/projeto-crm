// ============================================================
// NexusCRM - Middleware RBAC (Role-Based Access Control)
// ============================================================
import config from '../config/index.js';

/**
 * Middleware de autorização por role (papel)
 * @param  {...string} allowedRoles - Roles permitidas: 'admin', 'gestor', 'vendedor', 'suporte'
 * 
 * Uso: authorize('admin', 'gestor')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária.',
        code: 'RBAC_NOT_AUTHENTICATED',
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este recurso.',
        code: 'RBAC_INSUFFICIENT_ROLE',
        requiredRoles: allowedRoles,
        currentRole: req.userRole,
      });
    }

    next();
  };
};

/**
 * Middleware de autorização por permissão granular
 * @param  {...string} requiredPermissions - Permissões necessárias: 'leads:read', 'users:create', etc.
 * 
 * Uso: checkPermission('leads:read', 'leads:create')
 */
export const checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária.',
        code: 'RBAC_NOT_AUTHENTICATED',
      });
    }

    const userPermissions = config.permissions[req.userRole] || [];

    const hasAllPermissions = requiredPermissions.every(
      (perm) => userPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (perm) => !userPermissions.includes(perm)
      );

      return res.status(403).json({
        success: false,
        message: 'Permissões insuficientes para esta operação.',
        code: 'RBAC_INSUFFICIENT_PERMISSIONS',
        requiredPermissions,
        missingPermissions,
      });
    }

    next();
  };
};

/**
 * Middleware de isolamento por tenant (multi-tenant)
 * Garante que o usuário só acesse dados do seu tenant
 */
export const tenantIsolation = (req, res, next) => {
  if (!req.tenantId) {
    return res.status(400).json({
      success: false,
      message: 'Identificação do tenant não encontrada.',
      code: 'TENANT_NOT_IDENTIFIED',
    });
  }

  // Injetar filtro de tenant para ser usado nas queries
  req.tenantFilter = { tenantId: req.tenantId };

  next();
};

/**
 * Middleware que verifica se o usuário é dono do recurso ou admin
 */
export const ownerOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (req.userRole === 'admin' || req.userId === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Você só pode alterar seus próprios dados.',
      code: 'RBAC_NOT_OWNER',
    });
  };
};

/**
 * Retorna as permissões de um role
 */
export const getRolePermissions = (role) => {
  return config.permissions[role] || [];
};

/**
 * Verifica se um role tem uma permissão específica
 */
export const roleHasPermission = (role, permission) => {
  const permissions = config.permissions[role] || [];
  return permissions.includes(permission);
};
