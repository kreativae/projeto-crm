# 🚀 Guia Completo: Conectar MongoDB Real ao seu CRM

> **Objetivo**: Trocar dados mock por armazenamento real no MongoDB

---

## 📋 Verificar Pré-requisitos

Você já tem instalado? Verifique:

```bash
node --version     # v18+ 
npm --version      # v8+
```

---

## 🗄️ Opção 1: MongoDB Local (Recomendado para Desenvolvimento)

### **Mac - via Homebrew**

```bash
# Instalar MongoDB Community
brew install mongodb-community

# Iniciar o MongoDB
brew services start mongodb-community

# Verificar conexão
mongosh
> db.version()
# Deve listar a versão (ex: 7.0.0)
```

**Pronto!** MongoDB está rodando em `mongodb://localhost:27017`

---

## ☁️ Opção 2: MongoDB Atlas (Cloud - Mais Fácil)

### **Passo a Passo:**

1. Acesse: https://www.mongodb.com/cloud/atlas
2. Crie uma conta gratuita (ou faça login)
3. Crie um novo projeto → Crie um cluster (escolha "Free")
4. Aguarde criar (demora 5-10 minutos)
5. Clique em **"CONNECT"** no cluster
6. Escolha **"Drivers"** → **Node.js**
7. Copie a string de conexão (parecerá com):
   ```
   mongodb+srv://seu_usuario:sua_senha@seu-cluster.mongodb.net/sua_database?retryWrites=true&w=majority
   ```

---

## ⚙️ Configurar o Arquivo .env

Crie o arquivo `.env` na **raiz do projeto** (se não existir):

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/nexuscrm

# Backend
PORT=4000
NODE_ENV=development

# JWT (não altere para desenvolvimento local)
JWT_ACCESS_SECRET=nexuscrm_access_secret_dev_2025
JWT_REFRESH_SECRET=nexuscrm_refresh_secret_dev_2025
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### **Se estiver usando MongoDB Atlas:**

```bash
# Substitua a linha da URI por:
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@seu-cluster.mongodb.net/nexuscrm?retryWrites=true&w=majority
```

---

## 🚀 Iniciar a Aplicação

### **Terminal 1 - Backend (na pasta `backend/`)**

```bash
cd backend
npm install
npm start
```

**Esperado ver:**
```
✅ Express server listening on port 4000
🗄️ MongoDB conectado: localhost/nexuscrm
```

### **Terminal 2 - Frontend (na pasta raiz)**

```bash
npm install
npm run dev
```

**Esperado ver:**
```
💻 Local: http://localhost:5173
```

---

## ✅ Testar a Integração

1. Abra **http://localhost:5173** no navegador
2. Vá para a página **"Leads"**
3. Clique em **"+ Novo Lead"**
4. Preencha o formulário:
   - Nome: `João Silva`
   - Email: `joao@example.com`
   - Telefone: `(11) 99999-1234`
   - Status: `Novo`
   - Valor: `5000`
5. Clique em **"Salvar"**

**O que deve acontecer:**
- Lead aparece na lista
- Quando você recarrega a página (`F5`), o lead continua lá ✅
- Antes seria apagado ao recarregar (porque era mock)

---

## 🗺️ Arquivos Modificados

Já corrigimos o componente **`Leads.tsx`** para usar a API real:

- ✅ Busca dados do MongoDB na página de Leads
- ✅ Cria novos leads no servidor
- ✅ Atualiza leads existentes
- ✅ Deleta leads
- ✅ Adiciona interações

---

## 🔧 Próximos Passos

Agora você pode:

### **1. Testar outras páginas**

Se quiser aplicar a mesma mudança em outras páginas (Dashboard, Calendar, etc):

```typescript
// Use este padrão em qualquer componente:
import { useEffect, useState } from 'react';
import leadService from '@/services/leadService';

export function MeuComponente() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadService.getAll()
      .then(response => setLeads(response.leads || response))
      .catch(err => console.error('Erro:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;
  
  return <div>{leads.length} leads carregados</div>;
}
```

### **2. Criar mais serviços**

Existem serviços prontos em `/src/services/`:
- `leadService.ts` ✅ Pronto
- `userService.ts` (expandir conforme necessário)
- `tenantService.ts` (expandir conforme necessário)

### **3. Autenticação (depois)**

O projeto usa JWT. Para produção:
- Implemente o login real
- Remova o middleware "fake" do backend:

```javascript
// backend/routes/lead.routes.js
// Remova isto:
const auth = (req, res, next) => {
  req.user = { _id: 'demo', tenantId: 'demo' };
  next();
};
```

---

## 🐛 Troubleshooting

### **"MongoDB Connection Refused"**

```bash
# Verificar se MongoDB está rodando
brew services list

# Se não estiver, inicie:
brew services start mongodb-community

# Ou manualmente:
mongod
```

### **"Cannot POST /api/leads"**

- Verifique se o backend está rodando na porta 4000
- Cheque os logs do terminal: `npm start` (backend)

### **"404 Not Found" ao buscar leads**

- Verifique se existe um tenant associado ao usuário
- Cheque o seu `.env`: a `MONGODB_URI` está correta?

### **Backend não carrega models**

```bash
# Certifique-se de instalar dependências do banco
cd bancodedados
npm install
npm install mongoose
```

---

## 📚 Referências

- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Express.js Guide](https://expressjs.com/pt-br/)
- [React Hooks](https://pt-br.react.dev/reference/react)

---

## ✨ Pronto!

Seu CRM agora persiste dados no MongoDB! 🎉

Qualquer dúvida, verifique:
- Logs do backend (`npm start` output)
- Network tab do navegador (F12 → Network)
- Conectividade do MongoDB (`mongosh`)
