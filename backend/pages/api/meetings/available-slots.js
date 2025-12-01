import { z } from 'zod'
import prisma from '../../../lib/prisma'
import { applyCors } from '../../../utils/cors'
import {
  setSecurityHeaders,
  rateLimit,
  sanitizeError,
} from '../../../utils/security'

// Rate limiter
const slotsRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 30,
})

// Validação da query
const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
})

// Duração de cada sessão em horas
const SESSION_DURATION_HOURS = 4

// Horários disponíveis (a partir das 14:00, de hora em hora até 20:00)
const ALL_TIME_SLOTS = [
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
]

// Converte string "HH:MM" para minutos desde meia-noite
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Verifica se um horário está bloqueado por uma sessão que começa em outro horário
const isBlockedBySession = (slotTime, occupiedStartTimes) => {
  const slotMinutes = timeToMinutes(slotTime)
  
  for (const startTime of occupiedStartTimes) {
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = startMinutes + (SESSION_DURATION_HOURS * 60)
    
    // Se o slot está dentro do período de uma sessão existente
    if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
      return true
    }
  }
  
  return false
}

// Verifica se uma sessão começando neste horário conflita com sessões existentes
const wouldConflictWithExisting = (slotTime, occupiedStartTimes) => {
  const slotMinutes = timeToMinutes(slotTime)
  const slotEndMinutes = slotMinutes + (SESSION_DURATION_HOURS * 60)
  
  for (const startTime of occupiedStartTimes) {
    const existingStartMinutes = timeToMinutes(startTime)
    const existingEndMinutes = existingStartMinutes + (SESSION_DURATION_HOURS * 60)
    
    // Verifica se há sobreposição
    if (slotMinutes < existingEndMinutes && slotEndMinutes > existingStartMinutes) {
      return true
    }
  }
  
  return false
}

export default async function handler(req, res) {
  setSecurityHeaders(req, res)
  
  if (applyCors(req, res)) {
    return
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (slotsRateLimit(req, res)) {
    return
  }

  try {
    const { date } = querySchema.parse({ date: req.query.date })
    
    // Verificar se a data está no range permitido (hoje até 3 meses à frente)
    const targetDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const maxDate = new Date(today)
    maxDate.setMonth(maxDate.getMonth() + 3)
    
    if (targetDate < today) {
      return res.status(400).json({ error: 'Data inválida. Não é possível agendar no passado.' })
    }
    
    if (targetDate > maxDate) {
      return res.status(400).json({ error: 'Data inválida. Máximo de 3 meses à frente.' })
    }

    // Buscar reuniões já agendadas para esta data
    const meetings = await prisma.meeting.findMany({
      where: {
        meeting_date: targetDate,
        status: { not: 'cancelled' },
      },
      select: {
        meeting_time: true,
      },
    })

    // Buscar transações em andamento para esta data (reservas temporárias)
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        scheduled_date: targetDate,
        status: { in: ['processing', 'requires_action', 'requires_confirmation'] },
      },
      select: {
        scheduled_time: true,
      },
    })

    // Horários de INÍCIO de sessões ocupadas
    const occupiedStartTimes = []

    meetings.forEach(meeting => {
      if (meeting.meeting_time) {
        const time = new Date(meeting.meeting_time)
        const hours = time.getUTCHours().toString().padStart(2, '0')
        const minutes = time.getUTCMinutes().toString().padStart(2, '0')
        occupiedStartTimes.push(`${hours}:${minutes}`)
      }
    })

    pendingTransactions.forEach(tx => {
      if (tx.scheduled_time) {
        const time = new Date(tx.scheduled_time)
        const hours = time.getUTCHours().toString().padStart(2, '0')
        const minutes = time.getUTCMinutes().toString().padStart(2, '0')
        occupiedStartTimes.push(`${hours}:${minutes}`)
      }
    })

    // Se for hoje, remover horários que já passaram
    const now = new Date()
    const isToday = targetDate.toDateString() === today.toDateString()
    
    // Mapear slots disponíveis (considerando duração de 4 horas)
    const slots = ALL_TIME_SLOTS.map(time => {
      const [hours, minutes] = time.split(':').map(Number)
      
      // Se for hoje e o horário já passou
      if (isToday) {
        const slotTime = new Date(today)
        slotTime.setHours(hours, minutes, 0, 0)
        
        // Adicionar 30 minutos de margem
        const marginTime = new Date(now)
        marginTime.setMinutes(marginTime.getMinutes() + 30)
        
        if (slotTime <= marginTime) {
          return { time, available: false, reason: 'past' }
        }
      }
      
      // Verifica se este horário conflita com alguma sessão existente
      // (uma sessão de 4h bloqueia os próximos horários)
      if (wouldConflictWithExisting(time, occupiedStartTimes)) {
        return { time, available: false, reason: 'booked' }
      }
      
      return { time, available: true }
    })

    return res.status(200).json({
      date,
      slots,
      sessionDurationHours: SESSION_DURATION_HOURS,
      timezone: 'America/Sao_Paulo',
    })
  } catch (error) {
    const isProduction = process.env.NODE_ENV === 'production'
    
    console.error('Erro em /api/meetings/available-slots:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        issues: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    const errorResponse = sanitizeError(error, isProduction)
    return res.status(500).json(errorResponse)
  }
}

