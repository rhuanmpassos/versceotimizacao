/**
 * Stripe configuration and utilities
 */
import Stripe from 'stripe'

// Inicializa o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
})

// Valores do produto em centavos
export const AMOUNT_PRODUCT = 20000  // R$ 200,00
export const AMOUNT_AFFILIATE = 6000 // R$ 60,00

// Configuração de parcelamento (até 4x sem juros)
export const INSTALLMENT_CONFIG = {
  enabled: true,
  plan: {
    count: 4, // Até 4x
    interval: 'month',
    type: 'fixed_count',
  },
}

export default stripe

