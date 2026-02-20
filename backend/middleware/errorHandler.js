// ============================================================
// NexusCRM - Middleware de Tratamento de Erros
// ============================================================

/**
 * Middleware para rotas não encontradas
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada.`,
    code: 'ROUTE_NOT_FOUND',
  });
};

/**
 * Middleware global de tratamento de erros
 */
export const errorHandler = (err, req, res, _next) => {
  console.error('❌ Erro:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    tenantId: req.tenantId,
    userId: req.userId,
  });

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Erro de validação.',
      code: 'VALIDATION_ERROR',
      errors,
    });
  }

  // Erro de cast do Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido fornecido.',
      code: 'INVALID_ID',
    });
  }

  // Erro de duplicação (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `O valor para '${field}' já está em uso.`,
      code: 'DUPLICATE_KEY',
      field,
    });
  }

  // Erro de payload muito grande
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload muito grande. Limite: 10MB.',
      code: 'PAYLOAD_TOO_LARGE',
    });
  }

  // Erro genérico
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500
      ? 'Erro interno do servidor.'
      : err.message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Wrapper para async handlers (evita try/catch repetitivo)
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
