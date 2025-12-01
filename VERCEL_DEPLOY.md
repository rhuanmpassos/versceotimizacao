# 🚀 Guia Completo de Deploy na Vercel - Versace Otimização

Este guia mostra passo a passo como fazer o deploy do projeto no plano **gratuito** da Vercel.

## 📋 Índice

1. [Resumo Rápido](#-resumo-rápido)
2. [Arquitetura do Projeto](#-arquitetura-do-projeto)
3. [Pré-requisitos](#-pré-requisitos)
4. [Deploy do Backend](#-passo-1-deploy-do-backend-nextjs-api)
5. [Deploy do Frontend](#-passo-2-deploy-do-frontend-vuevite)
6. [Configuração de Webhooks](#-passo-3-configuração-de-webhooks)
7. [Verificação e Testes](#-passo-4-verificar-e-testar)
8. [Troubleshooting](#-troubleshooting)
9. [Checklist Final](#-checklist-final)

---

## ⚡ Resumo Rápido

| Componente | Root Directory | Framework | Principais Variáveis |
|------------|----------------|-----------|----------------------|
| **Backend** | `backend` | Next.js | `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `OPENPIX_APP_ID` |
| **Frontend** | `frontend` | Vue/Vite | `VITE_API_BASE_URL`, `VITE_STRIPE_PUBLISHABLE_KEY` |

**Webhooks Necessários:**
- **Stripe**: `https://seu-backend.vercel.app/api/checkout/webhook`
- **OpenPix**: `https://seu-backend.vercel.app/api/checkout/webhook-pix`

---

## 🏗️ Arquitetura do Projeto

```
VersaceOtimizacao/
├── backend/                    # API Next.js (Serverless)
│   ├── pages/api/
│   │   ├── leads.js            # Cadastro de leads
│   │   ├── checkout/
│   │   │   ├── create-payment-intent.js  # Criar pagamento (Stripe)
│   │   │   ├── create-pix.js            # Criar pagamento PIX (OpenPix)
│   │   │   ├── webhook.js               # Webhook do Stripe
│   │   │   └── webhook-pix.js           # Webhook do OpenPix
│   │   ├── meetings/
│   │   │   └── available-slots.js       # Horários disponíveis
│   │   ├── referral/                    # Sistema de afiliados
│   │   └── admin/                       # Painel administrativo
│   ├── prisma/
│   │   └── schema.prisma        # Schema do banco de dados
│   └── utils/
│       ├── stripe.js            # Configuração Stripe
│       └── openpix.js           # Configuração OpenPix
│
├── frontend/                    # App Vue.js (SPA)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.vue          # Página principal
│   │   │   ├── SchedulingPage.vue       # Agendamento + Pagamento
│   │   │   ├── ReferralPage.vue         # Cadastro de afiliados
│   │   │   └── ReferralDashboardPage.vue # Dashboard do afiliado
│   │   └── utils/
│   │       ├── api.js           # Chamadas à API
│   │       └── tracking.js      # Tracking de referrals
│   └── dist/                    # Build de produção
```

### Fluxo de Pagamento

```
[Cliente] → [Frontend] → [Backend API] → [Stripe/OpenPix]
                                              ↓
                                         [Webhook]
                                              ↓
                                    [Atualiza DB + Cria Meeting]
```

1. Cliente escolhe horário e método de pagamento
2. Frontend envia dados para API
3. API cria PaymentIntent (Stripe) ou Cobrança (OpenPix)
4. Cliente paga no checkout
5. **Webhook** recebe confirmação do pagamento
6. Webhook atualiza status e cria a reunião no banco

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- [ ] Conta no [Vercel](https://vercel.com) (pode criar com GitHub)
- [ ] Repositório Git com o código do projeto
- [ ] Banco PostgreSQL configurado (Render, Railway, Supabase, etc.)
- [ ] Conta no [Stripe](https://stripe.com) (para pagamentos com cartão)
- [ ] Conta na [OpenPix](https://openpix.com.br) (para pagamentos PIX) - *opcional*
- [ ] Node.js instalado localmente (para migrações)

---

## 🔧 Passo 1: Deploy do Backend (Next.js API)

### 1.1. Criar Projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Conecte seu repositório Git
4. Selecione o repositório do projeto

### 1.2. Configurar o Backend

Na tela de configuração:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Other |
| **Root Directory** | `backend` |
| **Build Command** | *(deixe vazio)* |
| **Output Directory** | *(deixe vazio)* |
| **Install Command** | *(deixe vazio)* |

### 1.3. Configurar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

#### Obrigatórias

```env
# Banco de Dados
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require
NODE_ENV=production

# CORS (URL do Frontend - você vai atualizar depois)
CORS_ALLOWED_ORIGIN=https://seu-frontend.vercel.app
NEXT_PUBLIC_SITE_URL=https://seu-frontend.vercel.app
REFERRAL_BASE_URL=https://seu-frontend.vercel.app
```

#### Stripe (Pagamentos com Cartão)

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> ⚠️ Use `sk_test_...` para testes, `sk_live_...` para produção

#### OpenPix (Pagamentos PIX) - Opcional

```env
OPENPIX_APP_ID=sua_app_id
OPENPIX_WEBHOOK_SECRET=seu_webhook_secret
```

#### Discord (Notificações) - Opcional

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_BOT_TOKEN=seu_bot_token
DISCORD_USER_ID=seu_user_id
```

### 1.4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (2-5 minutos)
3. **Anote a URL**: `https://seu-backend.vercel.app`

### 1.5. Aplicar Migrações do Prisma

Após o deploy, execute localmente:

```bash
cd backend

# Windows PowerShell
$env:DATABASE_URL="sua_url_do_postgresql_aqui"

# Windows CMD
set DATABASE_URL=sua_url_do_postgresql_aqui

# Linux/Mac
export DATABASE_URL="sua_url_do_postgresql_aqui"

# Executar migrações
npx prisma migrate deploy
```

---

## 🎨 Passo 2: Deploy do Frontend (Vue/Vite)

### 2.1. Criar Novo Projeto no Vercel

1. No dashboard, clique em **"Add New..."** → **"Project"**
2. Selecione o **mesmo repositório**

### 2.2. Configurar o Frontend

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | *(deixe vazio)* |
| **Output Directory** | *(deixe vazio)* |
| **Install Command** | *(deixe vazio)* |

### 2.3. Configurar Variáveis de Ambiente

```env
# URL da API (backend)
VITE_API_BASE_URL=https://seu-backend.vercel.app/api

# Stripe (chave pública - pode expor no frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

> ⚠️ Use `pk_test_...` para testes, `pk_live_...` para produção

### 2.4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (1-3 minutos)
3. **Anote a URL**: `https://seu-frontend.vercel.app`

### 2.5. Atualizar CORS no Backend

Volte ao projeto do **backend** na Vercel:

1. **Settings** → **Environment Variables**
2. Atualize as variáveis com a URL real do frontend:

```env
CORS_ALLOWED_ORIGIN=https://seu-frontend.vercel.app
NEXT_PUBLIC_SITE_URL=https://seu-frontend.vercel.app
REFERRAL_BASE_URL=https://seu-frontend.vercel.app
```

3. Faça um **Redeploy** (Deployments → ... → Redeploy)

---

## 🔗 Passo 3: Configuração de Webhooks

Os webhooks são **essenciais** para o funcionamento do sistema de pagamentos. Quando um cliente paga, o Stripe/OpenPix envia uma notificação para sua API, que então:

- Atualiza o status da transação para `succeeded`
- Cria a reunião (agendamento) no banco
- Atualiza o lead para `COMPRADO`

### 3.1. Webhook do Stripe (Cartão)

#### Configurar no Dashboard do Stripe

1. Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
2. Vá em **Developers** → **Webhooks**
3. Clique em **"Add endpoint"**
4. Configure:

| Campo | Valor |
|-------|-------|
| **Endpoint URL** | `https://seu-backend.vercel.app/api/checkout/webhook` |
| **Events to send** | Selecione os eventos abaixo |

**Eventos necessários:**
- `payment_intent.created`
- `payment_intent.processing`
- `payment_intent.succeeded` ⭐ (mais importante)
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `payment_intent.requires_action`

5. Após criar, copie o **Signing secret** (começa com `whsec_`)
6. Adicione no backend da Vercel:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

7. **Redeploy** o backend

#### Testar Webhook Localmente (Desenvolvimento)

```bash
# Instalar Stripe CLI
# Windows (via Scoop): scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Login
stripe login

# Encaminhar webhooks para localhost
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### 3.2. Webhook do OpenPix (PIX) - Se estiver usando

#### Configurar no Dashboard da OpenPix

1. Acesse [app.openpix.com.br](https://app.openpix.com.br)
2. Vá em **API/Plugins** → **Webhooks**
3. Clique em **"Novo Webhook"**
4. Configure:

| Campo | Valor |
|-------|-------|
| **URL** | `https://seu-backend.vercel.app/api/checkout/webhook-pix` |
| **Eventos** | `OPENPIX:CHARGE_COMPLETED`, `OPENPIX:CHARGE_EXPIRED` |

5. Se houver um webhook secret, adicione no backend:

```env
OPENPIX_WEBHOOK_SECRET=seu_secret
```

#### Como o Webhook PIX Funciona

```javascript
// Quando PIX é confirmado:
case 'OPENPIX:CHARGE_COMPLETED':
  // 1. Atualiza transação para 'succeeded'
  // 2. Cria a reunião no banco
  // 3. Atualiza lead para 'COMPRADO'
  break;

// Quando PIX expira (1 hora sem pagamento):
case 'OPENPIX:CHARGE_EXPIRED':
  // Atualiza transação para 'canceled'
  break;
```

### 3.3. Diagrama dos Webhooks

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUXO DE PAGAMENTO                          │
└─────────────────────────────────────────────────────────────────────┘

CARTÃO (Stripe):
================
[Cliente] → [Checkout Stripe] → [Stripe processa]
                                       ↓
              [Backend webhook.js] ← [Stripe envia payment_intent.succeeded]
                     ↓
        [Atualiza Transaction + Cria Meeting + Lead = COMPRADO]


PIX (OpenPix):
==============
[Cliente] → [QR Code PIX] → [Banco processa]
                                   ↓
         [Backend webhook-pix.js] ← [OpenPix envia CHARGE_COMPLETED]
                     ↓
        [Atualiza Transaction + Cria Meeting + Lead = COMPRADO]
```

---

## ✅ Passo 4: Verificar e Testar

### 4.1. Testar Backend

```bash
# Deve retornar 405 (Method Not Allowed) - significa que a rota existe
curl https://seu-backend.vercel.app/api/leads

# Testar horários disponíveis
curl "https://seu-backend.vercel.app/api/meetings/available-slots?date=2025-12-01"
```

### 4.2. Testar Frontend

1. Acesse `https://seu-frontend.vercel.app`
2. Verifique se a página carrega sem erros no console
3. Teste o formulário de lead
4. Teste o fluxo de agendamento

### 4.3. Testar Pagamentos (Modo Teste)

**Cartões de teste do Stripe:**

| Cenário | Número do Cartão |
|---------|------------------|
| ✅ Sucesso | `4242 4242 4242 4242` |
| 🔐 Requer autenticação | `4000 0025 0000 3155` |
| ❌ Recusado | `4000 0000 0000 9995` |

**Para PIX em sandbox**, o pagamento é simulado automaticamente.

### 4.4. Verificar Logs

Na Vercel: **Deployments** → Selecione o deployment → **Functions** → **View Function Logs**

Procure por logs como:
- `PaymentIntent succeeded: pi_...`
- `Meeting criada para transação ...`
- `Lead ... atualizado para COMPRADO`

---

## 🐛 Troubleshooting

### Erro: "Webhook não recebido"

**Causas comuns:**
1. URL do webhook incorreta
2. Webhook secret errado
3. Backend não fez redeploy após adicionar variáveis

**Solução:**
- Verifique a URL no dashboard do Stripe/OpenPix
- Confirme que `STRIPE_WEBHOOK_SECRET` está configurado
- Faça um redeploy do backend
- Verifique os logs de tentativa no dashboard do Stripe

### Erro: "Payment Intent não encontrado"

**Solução:**
- Verifique se o webhook está criando a transação antes do pagamento ser confirmado
- Confirme que `stripe_payment_intent` está sendo salvo corretamente

### Erro: "CORS policy"

**Solução:**
- `CORS_ALLOWED_ORIGIN` deve ter a URL **exata** do frontend (sem barra no final)
- Exemplo correto: `https://meu-app.vercel.app`
- Exemplo errado: `https://meu-app.vercel.app/`
- Faça redeploy após alterar

### Erro: "Prisma Client not generated"

**Solução:**
O `package.json` do backend já tem `"postinstall": "prisma generate"`. Se ainda assim falhar:

1. Verifique se `DATABASE_URL` está configurada
2. No build command, use: `npm install && npx prisma generate && npm run build`

### Erro: "Cannot connect to database"

**Solução:**
- Confirme que `DATABASE_URL` está correta
- Verifique se tem `?sslmode=require` no final
- Confirme que o banco aceita conexões externas

### PIX não está funcionando

**Soluções:**

1. **Se usando Stripe PIX:**
   - PIX precisa ser habilitado no dashboard do Stripe
   - Vá em **Settings** → **Payment methods** → Habilite **PIX**

2. **Se usando OpenPix:**
   - Verifique se `OPENPIX_APP_ID` está configurado
   - Confirme que o webhook está ativo

### Reunião não está sendo criada após pagamento

**Verificar:**
1. Webhook está recebendo o evento? (ver logs)
2. Transação existe no banco?
3. Status está sendo atualizado para `succeeded`?

**Solução:** Verifique os logs do webhook na Vercel para ver o erro específico.

---

## 📊 Variáveis de Ambiente - Resumo Completo

### Backend (`backend/`)

```env
# ==========================================
# OBRIGATÓRIAS
# ==========================================
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require
NODE_ENV=production

# ==========================================
# CORS E URLs
# ==========================================
CORS_ALLOWED_ORIGIN=https://seu-frontend.vercel.app
NEXT_PUBLIC_SITE_URL=https://seu-frontend.vercel.app
REFERRAL_BASE_URL=https://seu-frontend.vercel.app

# ==========================================
# STRIPE (Pagamentos com Cartão)
# ==========================================
STRIPE_SECRET_KEY=sk_live_...          # ou sk_test_... para testes
STRIPE_WEBHOOK_SECRET=whsec_...        # Do dashboard do Stripe

# ==========================================
# OPENPIX (Pagamentos PIX) - Opcional
# ==========================================
OPENPIX_APP_ID=sua_app_id              # Do dashboard da OpenPix
OPENPIX_WEBHOOK_SECRET=seu_secret      # Opcional

# ==========================================
# DISCORD (Notificações) - Opcional
# ==========================================
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_BOT_TOKEN=seu_bot_token
DISCORD_USER_ID=seu_user_id

# ==========================================
# ADMIN (Painel Administrativo) - Opcional
# ==========================================
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=sua_senha_segura
JWT_SECRET=sua_chave_jwt_secreta
```

### Frontend (`frontend/`)

```env
# API do Backend
VITE_API_BASE_URL=https://seu-backend.vercel.app/api

# Stripe (chave pública - seguro expor no frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...    # ou pk_test_... para testes
```

---

## 📝 Checklist Final

### Backend
- [ ] Deploy concluído com sucesso
- [ ] `DATABASE_URL` configurada
- [ ] `NODE_ENV=production` configurada
- [ ] `CORS_ALLOWED_ORIGIN` configurada com URL do frontend
- [ ] `STRIPE_SECRET_KEY` configurada
- [ ] `STRIPE_WEBHOOK_SECRET` configurada
- [ ] Migrações do Prisma aplicadas (`npx prisma migrate deploy`)
- [ ] Webhook do Stripe configurado e testado

### Frontend
- [ ] Deploy concluído com sucesso
- [ ] `VITE_API_BASE_URL` configurada com URL do backend + `/api`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` configurada
- [ ] Página carrega sem erros no console
- [ ] Sem erros de CORS

### Webhooks
- [ ] Webhook Stripe: `https://backend.../api/checkout/webhook`
- [ ] Eventos Stripe configurados (payment_intent.*)
- [ ] Webhook OpenPix (se usar): `https://backend.../api/checkout/webhook-pix`
- [ ] Testado com cartão de teste 4242 4242 4242 4242

### Testes
- [ ] Formulário de lead funcionando
- [ ] Agendamento de horários funcionando
- [ ] Pagamento com cartão funcionando
- [ ] Pagamento com PIX funcionando (se configurado)
- [ ] Reunião criada após pagamento confirmado
- [ ] Lead atualizado para COMPRADO após pagamento

---

## 🎉 Pronto!

Seu projeto está no ar!

**URLs finais:**
- Frontend: `https://seu-frontend.vercel.app`
- Backend: `https://seu-backend.vercel.app`
- Webhook Stripe: `https://seu-backend.vercel.app/api/checkout/webhook`
- Webhook PIX: `https://seu-backend.vercel.app/api/checkout/webhook-pix`

**Próximos passos:**
- Configure um domínio customizado (opcional)
- Ative as chaves de produção do Stripe (`sk_live_`, `pk_live_`)
- Monitore os logs e métricas no dashboard da Vercel
- Configure alertas de webhook no Stripe

---

## 📞 Documentação de Referência

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [OpenPix API](https://developers.openpix.com.br)
- [Vite Docs](https://vitejs.dev/guide/)
