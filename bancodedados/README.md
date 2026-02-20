# 🗄️ NexusCRM — Banco de Dados (MongoDB)

## Collections (Schemas)

| Collection | Arquivo | Descrição |
|---|---|---|
| `tenants` | `models/Tenant.js` | Empresas/organizações (multi-tenant) |
| `users` | `models/User.js` | Usuários da plataforma |
| `sessions` | `models/Session.js` | Sessões ativas (JWT) |
| `leads` | `models/Lead.js` | Leads e clientes (PF/PJ) |
| `messages` | `models/Message.js` | Mensagens omnichannel |
| `conversations` | `models/Message.js` | Conversas agrupadas |
| `automations` | `models/Automation.js` | Fluxos automáticos |
| `calendar_events` | `models/CalendarEvent.js` | Eventos de agenda |
| `templates` | Inline em `routes/template.routes.js` | Templates de mensagens |

## Relacionamentos

```
Tenant (1) ──── (N) User
Tenant (1) ──── (N) Lead
Tenant (1) ──── (N) Conversation
Tenant (1) ──── (N) Automation
Tenant (1) ──── (N) CalendarEvent

Lead (1) ──── (N) Interaction (embedded)
Lead (1) ──── (N) Conversation
Lead (1) ──── (N) CalendarEvent

Conversation (1) ──── (N) Message

User (1) ──── (N) Session
User (1) ──── (N) Lead (responsável)
```

## Seed

```bash
cd backend
npm run seed
```

## Conexão

```bash
# Local
MONGODB_URI=mongodb://localhost:27017/nexuscrm

# Atlas (cloud)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nexuscrm
```
