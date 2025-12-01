# 💳 Configuração de Pagamentos

Este guia explica como configurar o Stripe (cartão) e OpenPix (PIX) para processar pagamentos.

## 📋 Pré-requisitos

1. Conta no Stripe (https://stripe.com)
2. Acesso ao Dashboard do Stripe

## 🔧 Configuração

### 1. Obter as Chaves de API

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá para **Developers** > **API keys**
3. Copie as chaves:
   - **Publishable key** (começa com `pk_test_` ou `pk_live_`)
   - **Secret key** (começa com `sk_test_` ou `sk_live_`)

### 2. Configurar Variáveis de Ambiente

**Backend (`backend/.env`):**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Frontend (`frontend/.env`):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Configurar Webhook

Para receber notificações de pagamento (essencial para confirmar agendamentos):

1. Vá para **Developers** > **Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/checkout/webhook`
   - **Events to send**:
     - `payment_intent.created`
     - `payment_intent.processing`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
     - `payment_intent.requires_action`

4. Após criar, copie o **Signing secret** (começa com `whsec_`)
5. Adicione ao backend:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 4. Webhook Local (Desenvolvimento)

Para testar webhooks localmente, use o Stripe CLI:

```bash
# Instalar Stripe CLI
# Windows (via Scoop):
scoop install stripe

# Mac:
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Encaminhar webhooks para localhost
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

O CLI fornecerá um webhook secret temporário para usar em desenvolvimento.

## 💰 Configuração de Pagamentos

### Valores

Os valores são configurados em `backend/utils/stripe.js`:

```javascript
export const AMOUNT_PRODUCT = 20000  // R$ 200,00 (em centavos)
export const AMOUNT_AFFILIATE = 6000 // R$ 60,00 (em centavos)
```

### Métodos de Pagamento

O sistema suporta:

1. **Cartão de Crédito**
   - Parcelamento em até 4x sem juros
   - 3D Secure quando necessário

2. **PIX**
   - Pagamento instantâneo
   - QR Code expira em 1 hora

### Liberação para Afiliados

- **Cartão**: Pagamento liberado em 31 dias corridos
- **PIX**: Pagamento liberado em 7 dias

## 🧪 Testes

Use os cartões de teste do Stripe:

| Cartão | Número |
|--------|--------|
| Sucesso | 4242 4242 4242 4242 |
| Requer autenticação | 4000 0025 0000 3155 |
| Recusado | 4000 0000 0000 9995 |

Para PIX em sandbox, o pagamento é simulado automaticamente.

## 🚀 Produção

1. Ative sua conta Stripe (verify business)
2. Troque as chaves de teste (`sk_test_`, `pk_test_`) pelas de produção (`sk_live_`, `pk_live_`)
3. Configure o webhook de produção com a URL real
4. Teste o fluxo completo antes de divulgar

## 📊 Dashboard de Pagamentos

Acompanhe pagamentos em:
- **Stripe Dashboard** > **Payments**
- **Relatórios** > **Balance** (para reconciliação)

## ⚠️ Importante

- **NUNCA** exponha a `STRIPE_SECRET_KEY` no frontend
- **SEMPRE** valide webhooks com a assinatura
- Use HTTPS em produção
- Mantenha logs de transações

---

# 💚 Configuração do OpenPix (PIX)

O PIX é processado via OpenPix, uma plataforma brasileira especializada em pagamentos instantâneos.

## 📋 Pré-requisitos

1. Conta na OpenPix (https://openpix.com.br)
2. Empresa verificada

## 🔧 Configuração

### 1. Obter as Credenciais

1. Acesse o [Dashboard da OpenPix](https://app.openpix.com.br)
2. Vá para **API/Plugins** > **Nova API**
3. Crie uma nova API e copie o **App ID**

### 2. Configurar Variáveis de Ambiente

**Backend (`backend/.env`):**
```env
OPENPIX_APP_ID=sua_app_id_aqui
OPENPIX_WEBHOOK_SECRET=seu_webhook_secret (opcional)
```

### 3. Configurar Webhook

Para receber confirmações de pagamento:

1. No Dashboard da OpenPix, vá para **API/Plugins** > **Webhooks**
2. Clique em **Novo Webhook**
3. Configure:
   - **URL**: `https://seu-dominio.com/api/checkout/webhook-pix`
   - **Eventos**: 
     - `OPENPIX:CHARGE_COMPLETED`
     - `OPENPIX:CHARGE_EXPIRED`

### 4. Testar Localmente

Para testar webhooks localmente, você pode usar o **ngrok**:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor localhost
ngrok http 3000
```

Use a URL gerada pelo ngrok no webhook da OpenPix.

## 🧪 Modo Sandbox

A OpenPix tem um modo sandbox para testes:
- Use o App ID de sandbox
- Pagamentos são simulados automaticamente

## 📊 Dashboard

Acompanhe pagamentos em:
- **OpenPix Dashboard** > **Cobranças**
- Relatórios de transações em tempo real

