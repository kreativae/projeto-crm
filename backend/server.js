// ============================================================
// NexusCRM - Servidor Principal
// ============================================================
// Arquitetura: API-first, Multi-tenant SaaS, Modular
// Stack: Node.js + Express + MongoDB (Mongoose)
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import { connectDB } from '../bancodedados/connection.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import leadRoutes from './routes/lead.routes.js';
import messageRoutes from './routes/message.routes.js';
import automationRoutes from './routes/automation.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import tenantRoutes from './routes/tenant.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import templateRoutes from './routes/template.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// ============================================================
// Middlewares Globais
// ============================================================

// Segurança HTTP headers (OWASP)
app.use(helmet());

// CORS
app.use(cors(config.cors));

// Rate Limiting (proteção contra brute-force)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Rate limit mais restritivo para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================
// Health Check
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'NexusCRM API está online',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// Rotas da API
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/automations', automationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/ai', aiRoutes);

// ============================================================
// Error Handling
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// Inicialização
// ============================================================
const startServer = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();
    console.log('✅ MongoDB conectado com sucesso');

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║           NexusCRM API Server                ║
║══════════════════════════════════════════════║
║  🚀 Rodando em: http://localhost:${config.port}       ║
║  📦 Ambiente: ${config.nodeEnv.padEnd(30)}║
║  🗄️  MongoDB: Conectado                      ║
║  🔐 JWT: Ativo                               ║
║  🛡️  RBAC: Ativo                              ║
║  📊 Rate Limit: ${config.rateLimit.max} req/${config.rateLimit.windowMs / 60000}min            ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
