// ============================================================
// NexusCRM - Configuração Central
// ============================================================
import dotenv from 'dotenv';
dotenv.config();

const config = {
  // ---- Servidor ----
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // ---- MongoDB ----
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nexuscrm',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // ---- JWT ----
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'nexuscrm_access_secret_dev_2025',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'nexuscrm_refresh_secret_dev_2025',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  // ---- CORS ----
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },

  // ---- Rate Limiting ----
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // requisições por janela
  },

  // ---- E-mail (SMTP) ----
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@nexuscrm.com',
  },

  // ---- Integrações ----
  integrations: {
    whatsapp: {
      apiUrl: process.env.WHATSAPP_API_URL || '',
      token: process.env.WHATSAPP_TOKEN || '',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID || '',
      appSecret: process.env.FACEBOOK_APP_SECRET || '',
      pageToken: process.env.FACEBOOK_PAGE_TOKEN || '',
    },
    instagram: {
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    },
  },

  // ---- White Label ----
  whiteLabel: {
    defaultPrimaryColor: '#6366f1',
    defaultLogo: '/assets/logo-default.png',
    defaultFavicon: '/assets/favicon-default.ico',
  },

  // ---- Planos SaaS ----
  plans: {
    starter: {
      name: 'Starter',
      maxUsers: 5,
      maxLeads: 500,
      maxMessages: 2000,
      maxAutomations: 5,
      storageGB: 5,
      price: 97,
    },
    professional: {
      name: 'Professional',
      maxUsers: 25,
      maxLeads: 5000,
      maxMessages: 10000,
      maxAutomations: 25,
      storageGB: 25,
      price: 247,
    },
    enterprise: {
      name: 'Enterprise',
      maxUsers: -1, // ilimitado
      maxLeads: -1,
      maxMessages: -1,
      maxAutomations: 50,
      storageGB: 50,
      price: 497,
    },
  },

  // ---- RBAC - Permissões por Role ----
  permissions: {
    admin: [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'leads:read', 'leads:create', 'leads:update', 'leads:delete',
      'clients:read', 'clients:create', 'clients:update', 'clients:delete',
      'messages:read', 'messages:create', 'messages:delete',
      'automations:read', 'automations:create', 'automations:update', 'automations:delete',
      'analytics:read', 'analytics:export',
      'settings:read', 'settings:update',
      'billing:read', 'billing:update',
      'integrations:read', 'integrations:update',
      'webhooks:read', 'webhooks:create', 'webhooks:update', 'webhooks:delete',
      'templates:read', 'templates:create', 'templates:update', 'templates:delete',
      'tenant:read', 'tenant:update',
    ],
    gestor: [
      'users:read',
      'leads:read', 'leads:create', 'leads:update',
      'clients:read', 'clients:create', 'clients:update',
      'messages:read', 'messages:create',
      'automations:read', 'automations:create', 'automations:update',
      'analytics:read', 'analytics:export',
      'settings:read',
      'templates:read', 'templates:create', 'templates:update',
    ],
    vendedor: [
      'leads:read', 'leads:create', 'leads:update',
      'clients:read', 'clients:create',
      'messages:read', 'messages:create',
      'analytics:read',
      'templates:read',
    ],
    suporte: [
      'leads:read',
      'clients:read',
      'messages:read', 'messages:create',
      'templates:read',
    ],
  },
};

export default config;
