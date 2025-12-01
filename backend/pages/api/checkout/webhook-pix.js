import prisma from '../../../lib/prisma'
import { validateWebhook } from '../../../utils/openpix'

/**
 * Webhook da OpenPix para receber notificações de pagamento PIX
 * Documentação: https://developers.openpix.com.br/docs/webhook/webhook-overview
 */
export default async function handler(req, res) {
  // Aceitar GET para validação manual (retornar status ok)
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'Webhook endpoint is active' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const signature = req.headers['x-webhook-signature']
    const payload = req.body

    console.log('[OpenPix Webhook] Evento recebido:', payload.event)
    console.log('[OpenPix Webhook] Payload completo:', JSON.stringify(payload, null, 2))

    // Detectar webhook de teste da OpenPix
    // O webhook de teste tem apenas: { "data_criacao": "...", "event": "OPENPIX:CHARGE_COMPLETED" }
    const isTestWebhook = payload.event && payload.data_criacao && !payload.charge

    if (isTestWebhook) {
      console.log('[OpenPix Webhook] Webhook de teste recebido - retornando 200')
      return res.status(200).json({})
    }

    // Validar webhook apenas para webhooks reais (não de teste)
    if (!validateWebhook(payload, signature)) {
      console.error('[OpenPix Webhook] Assinatura inválida')
      // Retornar 200 mesmo com assinatura inválida para não quebrar o fluxo
      // Mas logar o erro para investigação
      return res.status(200).json({ received: true, warning: 'Assinatura não validada' })
    }

    // A OpenPix envia diferentes tipos de eventos
    // Principais: OPENPIX:CHARGE_COMPLETED, OPENPIX:CHARGE_EXPIRED
    const { event, charge } = payload

    if (!charge || !charge.correlationID) {
      console.warn('[OpenPix Webhook] Payload sem correlationID - retornando 200')
      return res.status(200).json({ received: true })
    }

    const transactionId = charge.correlationID

    // Buscar transação
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      console.error('[OpenPix Webhook] Transação não encontrada:', transactionId)
      return res.status(200).json({ received: true })
    }

    switch (event) {
      case 'OPENPIX:CHARGE_COMPLETED':
        await handleChargeCompleted(transaction, charge)
        break

      case 'OPENPIX:CHARGE_EXPIRED':
        await handleChargeExpired(transaction)
        break

      case 'OPENPIX:CHARGE_CREATED':
        // Apenas log, não precisa fazer nada
        console.log('[OpenPix Webhook] Cobrança criada:', transactionId)
        break

      default:
        console.log('[OpenPix Webhook] Evento não tratado:', event)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    // Sempre retornar 200 para webhooks, mesmo em caso de erro
    // Isso evita retentativas desnecessárias da OpenPix
    // Mas logar o erro para investigação
    console.error('[OpenPix Webhook] Erro ao processar:', error)
    console.error('[OpenPix Webhook] Stack:', error.stack)
    return res.status(200).json({ received: true, error: 'Erro processado internamente' })
  }
}

/**
 * Handler para pagamento PIX confirmado
 */
async function handleChargeCompleted(transaction, charge) {
  console.log('[OpenPix] Pagamento confirmado:', transaction.id)

  // Atualizar status da transação
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: 'succeeded',
    },
  })

  // Verificar se a reunião já existe
  const existingMeeting = await prisma.meeting.findUnique({
    where: { transaction_id: transaction.id },
  })

  if (!existingMeeting) {
    // Criar a reunião
    await prisma.meeting.create({
      data: {
        transaction_id: transaction.id,
        lead_id: transaction.lead_id,
        affiliate_id: transaction.affiliate_id,
        meeting_date: transaction.scheduled_date,
        meeting_time: transaction.scheduled_time,
        status: 'scheduled',
      },
    })

    console.log('[OpenPix] Meeting criada para transação', transaction.id)
  }

  // Atualizar lead para COMPRADO
  await prisma.lead.update({
    where: { id: transaction.lead_id },
    data: { stage: 'COMPRADO' },
  })

  console.log('[OpenPix] Lead atualizado para COMPRADO:', transaction.lead_id)
}

/**
 * Handler para cobrança expirada
 */
async function handleChargeExpired(transaction) {
  console.log('[OpenPix] Cobrança expirada:', transaction.id)

  // Atualizar status para cancelado
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: 'canceled',
    },
  })
}

