# Documentação do Banco de Dados - Versace Otimização

## Visão Geral

O sistema utiliza **PostgreSQL** como banco de dados, gerenciado através do **Prisma ORM**.

**String de conexão:** Configurada na variável de ambiente `DATABASE_URL`

---

## Modelos (Tabelas)

### 1. Lead

Armazena informações dos leads (potenciais clientes).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (PK) |
| `nome` | String | Nome do lead |
| `whatsapp` | String | WhatsApp normalizado (só dígitos) |
| `email` | String? | E-mail (opcional) |
| `referral_code` | String? | Código de indicação usado (FK para Referrer) |
| `tracking_id` | String? | Cookie ID para correlacionar sessões |
| `ip` | String? | IP do lead no momento do cadastro |
| `user_agent` | String? | User-Agent do navegador |
| `stage` | LeadStage | Estágio do funil (enum) |
| `created_at` | DateTime | Data de criação |

**Enum LeadStage:**
- `NA_BASE` - Lead novo, ainda não contatado
- `EM_CONTATO` - Em processo de contato
- `COMPRADO` - Realizou a compra
- `REJEITADO` - Não converteu

**Relações:**
- `transactions` → Transaction[] (1:N)
- `meetings` → Meeting[] (1:N)

---

### 2. Referrer (Afiliado/Indicador)

Armazena informações dos afiliados do programa de indicação.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (PK) |
| `nome` | String | Nome do afiliado |
| `whatsapp` | String | WhatsApp normalizado |
| `referral_code` | String | Código único de indicação (UNIQUE) |
| `access_token` | String? | Token para acessar dashboard (64 chars hex, UNIQUE) |
| `pix_key` | String? | Chave PIX para receber pagamentos |
| `tipo` | ReferrerType | Tipo de afiliado (enum) |
| `ativo` | Boolean | Se o afiliado está ativo |
| `created_by` | String? | E-mail de quem criou (para influencers) |
| `created_at` | DateTime | Data de criação |

**Enum ReferrerType:**
- `NORMAL` - Afiliado comum (auto-cadastro)
- `INFLUENCER` - Influencer (criado pelo admin)

**Relações:**
- `transactions` → Transaction[] (1:N)
- `meetings` → Meeting[] (1:N)

---

### 3. ReferralHit (Clique no Link de Indicação)

Registra cada clique em links de indicação para analytics.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (PK) |
| `referral_code` | String | Código de indicação clicado |
| `ip` | String | IP do visitante |
| `user_agent` | String | User-Agent do navegador |
| `referrer` | String? | De onde veio (ex: google.com) |
| `utm_source` | String? | Fonte da campanha UTM |
| `utm_medium` | String? | Meio da campanha UTM |
| `utm_campaign` | String? | Nome da campanha UTM |
| `device_type` | String? | mobile, desktop, tablet |
| `os` | String? | Sistema operacional |
| `browser` | String? | Navegador |
| `screen_width` | Int? | Largura da tela |
| `screen_height` | Int? | Altura da tela |
| `country` | String? | País (via IP) |
| `city` | String? | Cidade (via IP) |
| `region` | String? | Estado/Região (via IP) |
| `language` | String? | Idioma do navegador |
| `timezone` | String? | Timezone |
| `created_at` | DateTime | Data do clique |

---

### 4. Transaction (Pagamento)

Armazena todas as transações de pagamento.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (PK) |
| `lead_id` | UUID | Lead que fez o pagamento (FK) |
| `affiliate_id` | UUID? | Afiliado que indicou (FK, opcional) |
| `amount_product` | Int | Valor do produto em **centavos** (default: 20000 = R$200) |
| `amount_affiliate` | Int | Comissão do afiliado em **centavos** (default: 6000 = R$60) |
| `payment_method` | PaymentMethod? | Método de pagamento (enum) |
| `stripe_payment_intent` | String? | ID do PaymentIntent do Stripe |
| `status` | TransactionStatus | Status da transação (enum) |
| `scheduled_date` | Date? | Data agendada da reunião |
| `scheduled_time` | Time? | Horário agendado da reunião |
| `created_at` | DateTime | Data de criação |
| `updated_at` | DateTime | Última atualização |

**Enum PaymentMethod:**
- `card` - Cartão de crédito
- `pix` - PIX

**Enum TransactionStatus:**
- `requires_payment_method` - Aguardando método de pagamento
- `requires_confirmation` - Aguardando confirmação
- `processing` - Processando
- `requires_action` - Requer ação (ex: 3DS)
- `requires_capture` - Aguardando captura
- `canceled` - Cancelado/Expirado
- `succeeded` - Aprovado ✅

**Relações:**
- `lead` → Lead (N:1)
- `affiliate` → Referrer (N:1, opcional)
- `meeting` → Meeting (1:1)

---

### 5. Meeting (Reunião Agendada)

Armazena reuniões confirmadas (só criada após pagamento aprovado).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (PK) |
| `transaction_id` | UUID | Transação vinculada (FK, UNIQUE) |
| `lead_id` | UUID | Lead da reunião (FK) |
| `affiliate_id` | UUID? | Afiliado que indicou (FK, opcional) |
| `meeting_date` | Date | Data da reunião |
| `meeting_time` | Time | Horário da reunião |
| `status` | MeetingStatus | Status da reunião (enum) |
| `created_at` | DateTime | Data de criação |
| `updated_at` | DateTime | Última atualização |

**Enum MeetingStatus:**
- `scheduled` - Agendada
- `completed` - Realizada
- `no_show` - Não compareceu
- `cancelled` - Cancelada

---

## Fluxo de Dados

### Fluxo de Lead → Compra

```
1. Lead se cadastra (POST /api/leads)
   → Cria Lead com stage=NA_BASE
   → Se tem referral_code, vincula ao Referrer

2. Lead escolhe data/horário e inicia pagamento (POST /api/checkout/create-payment-intent)
   → Cria Transaction com status=requires_payment_method
   → Retorna clientSecret do Stripe

3. Pagamento processado (webhook)
   → Atualiza Transaction.status para 'succeeded'
   → Cria Meeting
   → Atualiza Lead.stage para 'COMPRADO'
```

### Fluxo de Afiliado

```
1. Pessoa se cadastra como afiliado (POST /api/referral/create)
   → Cria Referrer com referral_code único
   → Retorna access_token para acessar dashboard

2. Afiliado compartilha link (?ref=CODIGO)
   → Cada clique registra ReferralHit (POST /api/referral/track)

3. Lead usa link de indicação
   → Lead.referral_code = código do afiliado
   → Transaction.affiliate_id = id do afiliado

4. Pagamento aprovado
   → Afiliado ganha amount_affiliate (R$60 por venda)
```

---

## Webhooks

### Webhook Stripe (Cartão)

**Endpoint:** `POST /api/checkout/webhook`

**Eventos tratados:**

| Evento | Ação |
|--------|------|
| `payment_intent.created` | Atualiza status → `requires_payment_method` |
| `payment_intent.processing` | Atualiza status → `processing` |
| `payment_intent.requires_action` | Atualiza status → `requires_action` |
| `payment_intent.succeeded` | ✅ Atualiza status → `succeeded`, cria Meeting, Lead → COMPRADO |
| `payment_intent.payment_failed` | Mantém status → `requires_payment_method` |
| `payment_intent.canceled` | Atualiza status → `canceled` |

**Headers necessários:**
- `stripe-signature` - Assinatura do webhook

**Configuração:**
- `STRIPE_WEBHOOK_SECRET` - Secret do webhook no Stripe

---

### Webhook OpenPix (PIX)

**Endpoint:** `POST /api/checkout/webhook-pix`

**Eventos tratados:**

| Evento | Ação |
|--------|------|
| `OPENPIX:CHARGE_CREATED` | Apenas log |
| `OPENPIX:CHARGE_COMPLETED` | ✅ Atualiza status → `succeeded`, cria Meeting, Lead → COMPRADO |
| `OPENPIX:CHARGE_EXPIRED` | Atualiza status → `canceled` |

**Headers necessários:**
- `x-webhook-signature` - Assinatura do webhook

**Identificação:**
- `charge.correlationID` = `transaction.id` (UUID da transação)

---

## Prazos de Liberação (Comissão Afiliado)

| Método | Prazo |
|--------|-------|
| **Cartão** | 31 dias após a compra |
| **PIX** | 7 dias após a compra |

A liberação é calculada no frontend/dashboard, não armazenada no banco.

---

## Índices

| Tabela | Campo(s) | Motivo |
|--------|----------|--------|
| Lead | `tracking_id` | Busca rápida por cookie |
| Transaction | `lead_id` | Buscar transações do lead |
| Transaction | `affiliate_id` | Buscar transações do afiliado |
| Transaction | `status` | Filtrar por status |
| Transaction | `stripe_payment_intent` | Busca por webhook |
| Meeting | `lead_id` | Buscar reuniões do lead |
| Meeting | `affiliate_id` | Buscar reuniões do afiliado |
| Meeting | `meeting_date` | Filtrar por data |

---

## Queries Úteis

### Leads de um afiliado
```sql
SELECT * FROM "Lead" 
WHERE referral_code = 'CODIGO_DO_AFILIADO'
ORDER BY created_at DESC;
```

### Transações aprovadas de um afiliado
```sql
SELECT t.*, l.nome as lead_nome, l.whatsapp as lead_whatsapp
FROM "Transaction" t
JOIN "Lead" l ON t.lead_id = l.id
WHERE t.affiliate_id = 'UUID_DO_AFILIADO'
AND t.status = 'succeeded'
ORDER BY t.created_at DESC;
```

### Total de ganhos de um afiliado
```sql
SELECT 
  COUNT(*) as total_vendas,
  SUM(amount_affiliate) / 100.0 as total_reais
FROM "Transaction"
WHERE affiliate_id = 'UUID_DO_AFILIADO'
AND status = 'succeeded';
```

### Reuniões de hoje
```sql
SELECT m.*, l.nome, l.whatsapp
FROM "Meeting" m
JOIN "Lead" l ON m.lead_id = l.id
WHERE m.meeting_date = CURRENT_DATE
AND m.status = 'scheduled'
ORDER BY m.meeting_time;
```

### Cliques por afiliado (últimos 30 dias)
```sql
SELECT 
  referral_code,
  COUNT(*) as cliques,
  COUNT(DISTINCT ip) as cliques_unicos
FROM "ReferralHit"
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY referral_code
ORDER BY cliques DESC;
```

---

## Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL="postgresql://user:password@host:5432/database"

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OpenPix (opcional, para PIX)
OPENPIX_APP_ID="..."
OPENPIX_WEBHOOK_SECRET="..."
```

