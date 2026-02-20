# 🚀 NexusCRM — Backend API

## Arquitetura

```
backend/
├── server.js                    # Entry point
├── config/
│   └── index.js                 # Configurações centrais
├── middleware/
│   ├── auth.js                  # JWT authentication
│   ├── rbac.js                  # Role-based access control
│   └── errorHandler.js          # Error handling
├── routes/
│   ├── auth.routes.js           # Autenticação
│   ├── user.routes.js           # Gestão de usuários
│   ├── lead.routes.js           # Leads & Clientes
│   ├── message.routes.js        # Mensagens & Conversas
│   ├── automation.routes.js     # Automações
│   ├── analytics.routes.js      # Analytics & Métricas
│   ├── tenant.routes.js         # Tenant (empresa)
│   ├── webhook.routes.js        # Webhooks
│   ├── calendar.routes.js       # Agenda
│   └── template.routes.js       # Templates
├── .env.example                 # Variáveis de ambiente
├── package.json
└── README.md

bancodedados/
├── connection.js                # Conexão MongoDB
├── models/
│   ├── Tenant.js                # Empresa/Organização
│   ├── User.js                  # Usuário
│   ├── Session.js               # Sessão JWT
│   ├── Lead.js                  # Lead/Cliente
│   ├── Message.js               # Mensagem + Conversa
│   ├── Automation.js            # Automação
│   └── CalendarEvent.js         # Evento de Agenda
├── seeds/
│   └── seed.js                  # Dados iniciais
└── README.md
```

## Rotas da API

### 🔐 Autenticação (`/api/auth`)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Registrar empresa + admin |
| POST | `/auth/login` | Login (email + senha) |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout |
| POST | `/auth/forgot-password` | Esqueci minha senha |
| POST | `/auth/reset-password` | Redefinir senha |
| GET | `/auth/me` | Dados do usuário logado |

### 👥 Usuários (`/api/users`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/users` | Listar usuários |
| GET | `/users/:id` | Detalhes do usuário |
| POST | `/users/invite` | Convidar usuário |
| PUT | `/users/:id` | Atualizar usuário |
| PATCH | `/users/:id/status` | Ativar/Desativar |
| PATCH | `/users/:id/reset-password` | Reset de senha (admin) |
| DELETE | `/users/:id` | Remover usuário |

### 🎯 Leads (`/api/leads`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/leads` | Listar leads |
| GET | `/leads/pipeline` | Pipeline view |
| GET | `/leads/:id` | Detalhes do lead |
| POST | `/leads` | Criar lead |
| PUT | `/leads/:id` | Atualizar lead |
| PATCH | `/leads/:id/stage` | Mover no pipeline |
| POST | `/leads/:id/interactions` | Adicionar interação |
| DELETE | `/leads/:id` | Remover lead |

### 💬 Mensagens (`/api/messages`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/messages/conversations` | Listar conversas |
| GET | `/messages/conversations/:id/messages` | Mensagens de uma conversa |
| POST | `/messages/send` | Enviar mensagem |
| PATCH | `/messages/conversations/:id/assign` | Atribuir conversa |
| PATCH | `/messages/conversations/:id/status` | Alterar status |

### ⚡ Automações (`/api/automations`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/automations` | Listar automações |
| GET | `/automations/:id` | Detalhes |
| POST | `/automations` | Criar |
| PUT | `/automations/:id` | Atualizar |
| PATCH | `/automations/:id/toggle` | Ativar/Desativar |
| DELETE | `/automations/:id` | Remover |

### 📊 Analytics (`/api/analytics`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/analytics/dashboard` | Dashboard principal |
| GET | `/analytics/revenue` | Receita por mês |
| GET | `/analytics/conversion-funnel` | Funil de conversão |
| GET | `/analytics/response-time` | Tempo de resposta |

### 📅 Agenda (`/api/calendar`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/calendar` | Listar eventos |
| POST | `/calendar` | Criar evento |
| PUT | `/calendar/:id` | Atualizar evento |
| PATCH | `/calendar/:id/status` | Alterar status |
| DELETE | `/calendar/:id` | Remover evento |

### 🏢 Tenant (`/api/tenants`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/tenants/current` | Dados da empresa |
| PUT | `/tenants/current` | Atualizar empresa |
| PUT | `/tenants/current/integrations` | Configurar integrações |
| GET | `/tenants/current/usage` | Uso do plano |

## Setup

```bash
# 1. Instalar dependências
cd backend
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Seed do banco
npm run seed

# 4. Iniciar servidor
npm run dev
```

## Segurança
- ✅ JWT (access + refresh token)
- ✅ RBAC (Role-Based Access Control)
- ✅ bcrypt (hash de senha, salt 12)
- ✅ Rate limiting
- ✅ Helmet (security headers)
- ✅ CORS configurável
- ✅ Isolamento por tenant
- ✅ Bloqueio após 5 tentativas de login
- ✅ Token de reset com expiração

## Roles & Permissões
| Role | Nível |
|------|-------|
| `admin` | Acesso total |
| `gestor` | Gerencia equipe e leads |
| `vendedor` | CRUD de leads próprios |
| `suporte` | Leitura + mensagens |
