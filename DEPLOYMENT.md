# 🚀 Guia de Deploy em Produção - NexusCRM

## Estrutura do Projeto
```
frontend → Netlify (https://projeto.kreativ.ae)
backend  → Render (https://api-projeto.render.com)
database → MongoDB Atlas (Cloud)
```

---

## ✅ Passo 1: Preparar Variáveis de Ambiente para Produção

### Backend `.env` em Produção (Render)
- Acesse [Render.com](https://render.com)
- Create New → Web Service
- Conecte seu repositório GitHub
- Configure as variáveis de ambiente abaixo:

```
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://kreativae:Fabio0803@projeto-crm.xltdck4.mongodb.net/nexuscrm
JWT_ACCESS_SECRET=seu_valor_muito_aleatorio_com_32_chars_minimo
JWT_REFRESH_SECRET=outro_valor_muito_aleatorio_com_32_chars
CORS_ORIGIN=https://projeto.kreativ.ae
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app_google
```

**Como gerar chaves seguras:**
```bash
# No Mac/Linux
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ Passo 2: Deploy do Backend (Render)

### Opção A: Via Render Dashboard (Mais Fácil)
1. Acesse https://dashboard.render.com
2. Clique em "New +" → "Web Service"
3. Selecione seu repositório GitHub
4. Configure:
   - **Name:** `nexuscrm-api`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free (ou Starter para produção)
5. Adicione as variáveis de ambiente (veja acima)
6. Clique em "Create Web Service"

### URL que você receberá:
```
https://nexuscrm-api.onrender.com
```

---

## ✅ Passo 3: Atualizar Frontend para Produção

### Configurar URL da API
O arquivo `src/services/api.ts` já está configurado para detectar automaticamente:
- **Em desenvolvimento:** `http://localhost:4000/api`
- **Em produção:** `https://api.projeto.kreativ.ae/api`

**Se a URL for diferente, atualize:**
```typescript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://sua-url-backend.com/api'
  : 'http://localhost:4000/api';
```

---

## ✅ Passo 4: Configurar DNS e Subdomínio

Para que `api.projeto.kreativ.ae` funcione:

1. Acesse seu provedor de DNS (Namecheap, Cloudflare, etc)
2. Crie um CNAME record:
   ```
   Nome: api
   Tipo: CNAME
   Valor: nexuscrm-api.onrender.com
   ```

3. Aguarde 24-48h para a DNS propagar

**Alternativa (mais rápido):** Use um proxy com Cloudflare

---

## ✅ Passo 5: Deploy do Frontend (Netlify)

### Verificar Configuração
O arquivo `netlify.toml` já está configurado, apenas confirme:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  status = 200
  to = "/index.html"
```

### Fazer Deploy
1. Faça commit e push para GitHub:
```bash
git add .
git commit -m "feat: configurar para produção"
git push origin main
```

2. Netlify fará deploy automaticamente!

---

## 🔐 Checklist de Segurança

- ✅ `.env` NÃO está commitado (verifique `.gitignore`)
- ✅ Chaves JWT são aleatórias e fortes (32+ chars)
- ✅ CORS_ORIGIN aponta para seu domínio de produção
- ✅ NODE_ENV=production
- ✅ MongoDB com IP whitelist configurado
- ✅ HTTPS habilitado (Netlify + Render fazem automaticamente)

---

## 📊 Monitoramento em Produção

### Render
- Dashboard mostra logs em tempo real
- Alertas de erro automáticos
- Reinicialização automática

### Netlify
- Analytics de performance
- Build logs
- Histórico de deploys

### MongoDB Atlas
- Connection status
- Query performance
- Storage usage

---

## 🚨 Troubleshooting

### Erro "CORS blocked" em produção
Verifique `CORS_ORIGIN` no backend `.env`:
```
CORS_ORIGIN=https://projeto.kreativ.ae
```

### Banco de dados não conecta
1. Verifique `MONGODB_URI` em produção
2. Confirme IP whitelist no MongoDB Atlas
3. Teste a conexão: `mongosh "sua_connection_string"`

### Frontend não consegue chamar API
1. Verifique URL em `src/services/api.ts`
2. Check CORS headers: `curl -i https://sua-api.com/api/health`
3. Verifique network tab do DevTools

---

## 🔄 Workflow de Desenvolvimento Futuro

```bash
# 1. Fazer alterações
git add .
git commit -m "feature: nova funcionalidade"
git push origin main

# 2. Render faz deploy automático do backend
# 3. Netlify faz deploy automático do frontend
# 4. Testar em projeto.kreativ.ae
```

---

## 📚 Links Úteis

- [Render Docs](https://render.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [JWT.io](https://jwt.io)

---

**Status:** ✅ Configuração Pronta para Deploy
