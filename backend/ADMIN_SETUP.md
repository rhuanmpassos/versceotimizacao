# 🔐 Configuração do Painel Admin

Este documento explica como configurar o painel administrativo para gerenciar links de influenciadores.

## Acesso ao Painel

O painel admin é acessado pelo frontend:

- **Produção**: `https://seudominio.com/admin`
- **Desenvolvimento**: `http://localhost:5173/admin`

### Credenciais

- **Email**: Configurado via `ADMIN_EMAIL`
- **Senha**: Configurado via `ADMIN_PASSWORD_HASH` (hash bcrypt)

---

## 🚀 Variáveis de Ambiente para Vercel (Backend)

### ⚠️ OBRIGATÓRIAS (sem elas o sistema NÃO funciona)

```env
# Database (Render, Neon, Supabase, etc)
DATABASE_URL=postgresql://user:password@host:5432/database

# Autenticação Admin (OBRIGATÓRIO)
JWT_SECRET=gere-uma-string-aleatoria-de-64-caracteres-ou-mais-aqui
ADMIN_EMAIL=rhuanc01@gmail.com
ADMIN_PASSWORD_HASH=$2b$12$Pk4YQeyReHHaC5L8rpJvu.lE869SOiEmT7R/Qzu.yjNfNfR5aqQUO

# CORS - URL do seu frontend (OBRIGATÓRIO para segurança)
CORS_ALLOWED_ORIGIN=https://seudominio.com
NEXT_PUBLIC_SITE_URL=https://seudominio.com
REFERRAL_BASE_URL=https://seudominio.com
```

### 📌 Opcionais (mas recomendadas)

```env
# Discord Notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/xxx
DISCORD_BOT_TOKEN=seu-bot-token
DISCORD_USER_ID=seu-discord-id

# Ambiente (Vercel seta automaticamente)
NODE_ENV=production
```

---

## 🔑 Como Gerar Valores Seguros

### JWT_SECRET (64+ caracteres aleatórios)

```bash
# No terminal (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Ou no PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
```

### ADMIN_PASSWORD_HASH (hash bcrypt da senha)

```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('SuaSenhaAqui', 12).then(h => console.log(h))"
```

**Senha atual configurada**: `Rhuancar@17`  
**Hash correspondente**: `$2b$12$Pk4YQeyReHHaC5L8rpJvu.lE869SOiEmT7R/Qzu.yjNfNfR5aqQUO`

---

## 📋 Checklist de Deploy na Vercel

### Backend (API)

1. [ ] Criar projeto na Vercel apontando para `/backend`
2. [ ] Configurar TODAS as variáveis obrigatórias
3. [ ] Verificar se `DATABASE_URL` está correto
4. [ ] Testar endpoint `/api/admin/auth/login`

### Frontend

1. [ ] Criar projeto na Vercel apontando para `/frontend`
2. [ ] Configurar `VITE_API_BASE_URL` apontando para o backend
3. [ ] Verificar se CORS está funcionando

---

## 🛡️ Segurança Implementada

| Proteção | Status |
|----------|--------|
| Senha hasheada com bcrypt (12 rounds) | ✅ |
| JWT com expiração de 24h | ✅ |
| Rate limiting (5 tentativas / 15 min) | ✅ |
| Delay em tentativas falhas (anti-brute force) | ✅ |
| Validação de variáveis de ambiente | ✅ |
| Headers de segurança (CSP, XSS, etc) | ✅ |
| CORS restritivo em produção | ✅ |
| Sanitização de inputs | ✅ |
| Notificações de tentativas de acesso | ✅ |

---

## 🔒 Rotas da API

| Método | Rota | Proteção | Descrição |
|--------|------|----------|-----------|
| POST | `/api/admin/auth/login` | Rate limit | Login |
| GET | `/api/admin/auth/verify` | JWT | Verificar token |
| GET | `/api/admin/influencers/list` | JWT | Listar influencers |
| POST | `/api/admin/influencers/create` | JWT | Criar influencer |
| POST | `/api/admin/influencers/toggle` | JWT | Ativar/desativar |
| GET | `/api/admin/influencers/stats` | JWT | Estatísticas |

Header de autenticação:
```
Authorization: Bearer <token>
```

---

## ⚠️ Importante

1. **NUNCA** commite variáveis de ambiente no código
2. **SEMPRE** use HTTPS em produção
3. **GERE** um novo `JWT_SECRET` para produção
4. **MUDE** a senha padrão antes de ir para produção
5. **CONFIGURE** `CORS_ALLOWED_ORIGIN` com a URL exata do seu frontend
