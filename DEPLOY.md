# 🚀 Checklist de Implantação - NexusCRM

Este guia descreve os passos necessários para levar o **NexusCRM** do ambiente de desenvolvimento para a produção.

## 📋 Pré-requisitos

1.  **Domínio:** Um domínio registrado (ex: `seucrm.com.br`).
2.  **Servidor/Hospedagem:**
    *   **Frontend:** Vercel, Netlify ou AWS S3+CloudFront.
    *   **Backend:** VPS (DigitalOcean, AWS EC2), Railway, Render ou Heroku.
    *   **Banco de Dados:** MongoDB Atlas (Recomendado) ou Self-hosted.

---

## 🛠️ 1. Banco de Dados (MongoDB)

O MongoDB é o coração do sistema. Para produção, **não use** banco local.

1.  [ ] Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/atlas).
2.  [ ] Crie um Cluster (o plano M0 Free Tier serve para começar).
3.  [ ] Em "Network Access", permita o IP do seu servidor backend (ou `0.0.0.0/0` temporariamente).
4.  [ ] Em "Database Access", crie um usuário e senha fortes.
5.  [ ] Obtenha a **Connection String** (ex: `mongodb+srv://user:pass@cluster0.mongodb.net/nexuscrm`).

---

## ⚙️ 2. Backend (Node.js API)

### Variáveis de Ambiente (.env)
No seu serviço de hospedagem (ex: Railway/Render), configure as seguintes variáveis:

| Variável | Valor Recomendado | Descrição |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Ativa otimizações de produção. |
| `PORT` | `4000` (ou a porta dada pelo host) | Porta do servidor. |
| `MONGODB_URI` | `mongodb+srv://...` | Connection string do passo anterior. |
| `JWT_ACCESS_SECRET` | (Gere um hash aleatório longo) | Segurança dos tokens. |
| `JWT_REFRESH_SECRET` | (Gere um hash aleatório longo) | Segurança dos refresh tokens. |
| `CORS_ORIGIN` | `https://seucrm.com.br` | URL final do seu Frontend (sem barra no final). |
| `SMTP_HOST` | `smtp.sendgrid.net` (exemplo) | Servidor de email para senhas/convites. |
| `SMTP_USER` | (Seu usuário SMTP) | |
| `SMTP_PASS` | (Sua senha SMTP) | |

### Deploy
1.  [ ] Faça commit do código para o GitHub/GitLab.
2.  [ ] Conecte o repositório ao serviço de hospedagem (ex: Railway).
3.  [ ] Defina o comando de start: `cd backend && npm install && npm start`.
4.  [ ] **Importante:** Execute o seed inicial se o banco estiver vazio: `cd backend && npm run seed`.

---

## 🎨 3. Frontend (React/Vite)

### Configuração
1.  [ ] Abra `src/services/api.ts`.
2.  [ ] Certifique-se de que a `baseURL` aponta para a URL do seu backend em produção OU use variáveis de ambiente no build (`VITE_API_URL`).

**Opção recomendada (Vite env vars):**
Crie um arquivo `.env.production` na raiz do projeto (fora do backend):
```env
VITE_API_URL=https://api.seucrm.com.br/api
```

### Build & Deploy
1.  [ ] No serviço de hospedagem (ex: Vercel), importe o projeto do GitHub.
2.  [ ] **Root Directory:** `./` (Raiz).
3.  [ ] **Build Command:** `npm run build`.
4.  [ ] **Output Directory:** `dist`.
5.  [ ] Adicione a variável de ambiente `VITE_API_URL` nas configurações do projeto na Vercel.

---

## 🔒 4. Segurança & Finalização

1.  [ ] **SSL (HTTPS):** Certifique-se de que tanto o Frontend quanto o Backend estão rodando em HTTPS (Hospedagens modernas fazem isso automaticamente).
2.  [ ] **Emails:** Teste o fluxo de "Esqueci minha senha" para garantir que o SMTP está enviando emails.
3.  [ ] **White Label:** Acesse `/settings` com a conta admin e configure o logo e cores da empresa.
4.  [ ] **Backup:** Configure backups automáticos no MongoDB Atlas.

## 🚀 5. Teste Final

1.  Acesse `https://seucrm.com.br`.
2.  Faça login com `carlos@nexuscrm.com` / `admin123` (se usou o seed).
3.  Vá em Perfil e altere sua senha imediatamente.

**Parabéns! Seu SaaS está no ar!** 🎉
