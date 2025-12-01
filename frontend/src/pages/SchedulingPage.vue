<template>
  <section class="mx-auto flex min-h-[80vh] w-full max-w-4xl flex-col px-4 sm:px-5 md:px-8 pb-12 sm:pb-16 md:pb-20 pt-20 sm:pt-24 md:pt-28">
    <!-- Stepper -->
    <div class="flex items-center justify-center gap-4 mb-8" v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0 }">
      <div class="flex items-center gap-2">
        <div 
          class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all"
          :class="step === 1 ? 'bg-cyan-500 text-white' : 'bg-cyan-500/20 text-cyan-400'"
        >
          1
        </div>
        <span class="text-sm text-white/80" :class="step === 1 ? 'font-medium' : ''">Escolher Data</span>
      </div>
      <div class="h-px w-12 bg-white/20"></div>
      <div class="flex items-center gap-2">
        <div 
          class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all"
          :class="step === 2 ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/50'"
        >
          2
        </div>
        <span class="text-sm" :class="step === 2 ? 'text-white/80 font-medium' : 'text-white/50'">Pagamento</span>
      </div>
    </div>

    <!-- Título -->
    <div class="text-center mb-8" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }">
      <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
        {{ step === 1 ? 'Escolha sua Data e Horário' : 'Finalize seu Agendamento' }}
      </h1>
      <p class="mt-2 text-white/60">
        {{ step === 1 ? 'Selecione o melhor dia e horário para sua otimização' : 'Complete o pagamento para confirmar' }}
      </p>
    </div>

    <!-- Alerta: Precisa de lead_id -->
    <Card v-if="!leadId" class="w-full">
      <div class="flex flex-col items-center justify-center py-12 text-white text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 mb-4">
          <svg class="h-8 w-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold mb-2">Informações Necessárias</h2>
        <p class="text-white/70 mb-6">Por favor, preencha seus dados antes de agendar.</p>
        <router-link to="/">
          <Button>Voltar ao Início</Button>
        </router-link>
      </div>
    </Card>

    <!-- Step 1: Calendário -->
    <div v-else-if="step === 1" class="grid lg:grid-cols-2 gap-6" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }">
      <!-- Calendário -->
      <Card class="w-full">
        <div class="text-white">
          <div class="flex items-center justify-between mb-4">
            <button 
              type="button"
              class="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="!canGoPreviousMonth"
              @click="previousMonth"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 class="text-lg font-semibold capitalize">
              {{ currentMonthName }} {{ currentYear }}
            </h3>
            <button 
              type="button"
              class="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="!canGoNextMonth"
              @click="nextMonth"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Dias da semana -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="day in weekDays" :key="day" class="text-center text-xs text-white/50 py-2">
              {{ day }}
            </div>
          </div>

          <!-- Grid de dias -->
          <div class="grid grid-cols-7 gap-1">
            <div v-for="(day, index) in calendarDays" :key="index" class="aspect-square">
              <button
                v-if="day"
                type="button"
                class="w-full h-full rounded-lg text-sm font-medium transition-all flex items-center justify-center"
                :class="getDayClass(day)"
                :disabled="!isDaySelectable(day)"
                @click="selectDate(day)"
              >
                {{ day.getDate() }}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Seleção de Horário -->
      <Card class="w-full">
        <div class="text-white">
          <h3 class="text-lg font-semibold mb-4">
            {{ selectedDate ? `Horários para ${formatDateBR(selectedDate)}` : 'Selecione uma data' }}
          </h3>

          <div v-if="!selectedDate" class="flex flex-col items-center justify-center py-8 text-white/50">
            <svg class="h-12 w-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm">Escolha uma data no calendário</p>
          </div>

          <div v-else-if="loadingSlots" class="flex flex-col items-center justify-center py-8">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400"></div>
            <p class="mt-3 text-sm text-white/60">Carregando horários...</p>
          </div>

          <div v-else-if="availableSlots.length === 0" class="flex flex-col items-center justify-center py-8 text-white/50">
            <svg class="h-12 w-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm">Nenhum horário disponível nesta data</p>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              v-for="slot in availableSlots"
              :key="slot.time"
              type="button"
              class="py-3 px-4 rounded-xl text-sm font-medium transition-all"
              :class="getSlotClass(slot)"
              :disabled="!slot.available"
              @click="selectTime(slot.time)"
            >
              {{ slot.time }}
              <span v-if="!slot.available" class="block text-xs opacity-70">
                {{ slot.reason === 'past' ? 'Passou' : 'Ocupado' }}
              </span>
            </button>
          </div>
        </div>
      </Card>
    </div>

    <!-- Resumo da seleção e botão de continuar (Step 1) -->
    <div v-if="step === 1 && selectedDate && selectedTime && leadId" class="mt-6" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }">
      <Card class="w-full">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20">
              <svg class="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold">{{ formatDateBR(selectedDate) }} às {{ selectedTime }}</p>
              <p class="text-sm text-white/60">Otimização Windows - R$ 200,00</p>
            </div>
          </div>
          <Button @click="goToCheckout" class="w-full sm:w-auto">
            Continuar para Pagamento
          </Button>
        </div>
      </Card>
    </div>

    <!-- Step 2: Checkout -->
    <div v-if="step === 2 && leadId" class="grid lg:grid-cols-2 gap-6" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }">
      <!-- Resumo do Pedido -->
      <Card class="w-full h-fit">
        <div class="text-white">
          <h3 class="text-lg font-semibold mb-4">Resumo do Pedido</h3>
          
          <div class="space-y-4">
            <div class="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30">
                <svg class="h-6 w-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="font-semibold">Otimização Windows Premium</p>
                <p class="text-sm text-white/60">Formatação + Otimização completa</p>
              </div>
              <p class="font-bold text-lg">R$ 200</p>
            </div>

            <div class="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <svg class="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p class="text-sm text-white/60">Data e Horário</p>
                <p class="font-medium">{{ formatDateBR(selectedDate) }} às {{ selectedTime }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-white/10">
              <p class="text-white/60">Total</p>
              <p class="text-2xl font-bold text-cyan-400">R$ 200,00</p>
            </div>

            <p class="text-xs text-white/50 text-center">
              Parcelamento em até 4x sem juros no cartão
            </p>
          </div>

          <button 
            type="button"
            class="mt-4 text-sm text-white/60 hover:text-white flex items-center gap-2 transition-colors"
            @click="step = 1"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Alterar data/horário
          </button>
        </div>
      </Card>

      <!-- Formulário de Pagamento -->
      <Card class="w-full">
        <div class="text-white">
          <h3 class="text-lg font-semibold mb-4">Método de Pagamento</h3>

          <!-- Seleção do método -->
          <div class="flex gap-3 mb-6">
            <button
              type="button"
              class="flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2"
              :class="paymentMethod === 'card' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300' : 'border-white/10 text-white/60 hover:border-white/30'"
              @click="paymentMethod = 'card'"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Cartão
            </button>
            <button
              type="button"
              class="flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2"
              :class="paymentMethod === 'pix' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300' : 'border-white/10 text-white/60 hover:border-white/30'"
              @click="paymentMethod = 'pix'"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.66 8.34l-2.83 2.83c-.39.39-1.02.39-1.41 0l-2.83-2.83c-.39-.39-.39-1.02 0-1.41l2.83-2.83c.39-.39 1.02-.39 1.41 0l2.83 2.83c.39.39.39 1.02 0 1.41z"/>
                <path d="M6.34 19.66l2.83-2.83c.39-.39 1.02-.39 1.41 0l2.83 2.83c.39.39.39 1.02 0 1.41l-2.83 2.83c-.39.39-1.02.39-1.41 0l-2.83-2.83c-.39-.39-.39-1.02 0-1.41z"/>
                <path d="M6.34 8.34l2.83 2.83c.39.39.39 1.02 0 1.41l-2.83 2.83c-.39.39-1.02.39-1.41 0l-2.83-2.83c-.39-.39-.39-1.02 0-1.41l2.83-2.83c.39-.39 1.02-.39 1.41 0z"/>
                <path d="M17.66 19.66l-2.83-2.83c-.39-.39-.39-1.02 0-1.41l2.83-2.83c.39-.39 1.02-.39 1.41 0l2.83 2.83c.39.39.39 1.02 0 1.41l-2.83 2.83c-.39-.39-.39-1.02-.41 0z"/>
              </svg>
              PIX
            </button>
          </div>

          <!-- Campo de Email -->
          <div class="mb-4">
            <label class="block text-sm text-white/60 mb-2">E-mail para recibo</label>
            <Input
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              autocomplete="email"
            />
          </div>

          <!-- Stripe Elements Container (Cartão) -->
          <div v-if="paymentMethod === 'card'" class="mb-6">
            <label class="block text-sm text-white/60 mb-2">Dados do Cartão</label>
            <div 
              id="card-element"
              class="p-4 rounded-xl border border-white/10 bg-white/5 min-h-[50px]"
            ></div>
            <p v-if="cardError" class="mt-2 text-sm text-rose-400">{{ cardError }}</p>
          </div>

          <!-- Campos PIX -->
          <div v-else class="mb-6 space-y-4">
            <!-- Campo CPF -->
            <div>
              <label class="block text-sm text-white/60 mb-2">CPF (obrigatório para PIX)</label>
              <Input
                :value="cpf"
                @input="onCpfInput"
                type="text"
                placeholder="000.000.000-00"
                autocomplete="off"
                maxlength="14"
              />
            </div>

            <!-- Info PIX -->
            <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div class="flex items-start gap-3">
                <svg class="h-5 w-5 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="font-medium text-emerald-300">Pagamento via PIX</p>
                  <p class="text-sm text-emerald-300/70 mt-1">
                    Após clicar em "Pagar", você receberá um QR Code para escanear 
                    e o código PIX copia e cola. O código expira em 1 hora.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Erro geral -->
          <div v-if="checkoutError" class="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <p class="text-sm text-rose-400">{{ checkoutError }}</p>
          </div>

          <!-- Botão de Pagar -->
          <Button 
            @click="processPayment"
            :disabled="processing || !email || (paymentMethod === 'pix' && cpf.replace(/\D/g, '').length !== 11)"
            class="w-full"
          >
            <span v-if="processing" class="flex items-center justify-center gap-2">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              Processando...
            </span>
            <span v-else>
              Pagar R$ 200,00
            </span>
          </Button>

          <!-- Selos de segurança -->
          <div class="mt-4 flex items-center justify-center gap-4 text-xs text-white/40">
            <div class="flex items-center gap-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pagamento seguro
            </div>
            <div class="flex items-center gap-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Stripe
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Step 3: Sucesso -->
    <Card v-if="step === 3" class="w-full max-w-lg mx-auto" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1 }">
      <div class="flex flex-col items-center justify-center py-8 text-white text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 mb-6">
          <svg class="h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold mb-2">Agendamento Confirmado!</h2>
        <p class="text-white/70 mb-6">
          Sua otimização está marcada para<br>
          <span class="font-semibold text-cyan-400">{{ formatDateBR(selectedDate) }} às {{ selectedTime }}</span>
        </p>
        <div class="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 w-full">
          <p class="text-sm text-white/60 mb-2">Um e-mail de confirmação foi enviado para:</p>
          <p class="font-medium">{{ email }}</p>
        </div>
        <p class="text-sm text-white/50 mb-6">
          Entraremos em contato pelo WhatsApp para confirmar os detalhes.
        </p>
        <router-link to="/">
          <Button>Voltar ao Início</Button>
        </router-link>
      </div>
    </Card>

    <!-- Step 4: QR Code PIX -->
    <Card v-if="step === 4 && pixData" class="w-full max-w-lg mx-auto" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1 }">
      <div class="flex flex-col items-center justify-center py-6 text-white text-center">
        <!-- Ícone PIX -->
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mb-4">
          <svg class="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.66 8.34l-2.83 2.83c-.39.39-1.02.39-1.41 0l-2.83-2.83c-.39-.39-.39-1.02 0-1.41l2.83-2.83c.39-.39 1.02-.39 1.41 0l2.83 2.83c.39.39.39 1.02 0 1.41z"/>
            <path d="M6.34 19.66l2.83-2.83c.39-.39 1.02-.39 1.41 0l2.83 2.83c.39.39.39 1.02 0 1.41l-2.83 2.83c-.39.39-1.02.39-1.41 0l-2.83-2.83c-.39-.39-.39-1.02 0-1.41z"/>
            <path d="M6.34 8.34l2.83 2.83c.39.39.39 1.02 0 1.41l-2.83 2.83c-.39.39-1.02.39-1.41 0l-2.83-2.83c-.39-.39-.39-1.02 0-1.41l2.83-2.83c.39-.39 1.02-.39 1.41 0z"/>
            <path d="M17.66 19.66l-2.83-2.83c-.39-.39-.39-1.02 0-1.41l2.83-2.83c.39-.39 1.02-.39 1.41 0l2.83 2.83c.39.39.39 1.02 0 1.41l-2.83 2.83c-.39-.39-.39-1.02-.41 0z"/>
          </svg>
        </div>

        <h2 class="text-2xl font-bold mb-2">Pague com PIX</h2>
        <p class="text-white/60 mb-4">Escaneie o QR Code ou copie o código abaixo</p>

        <!-- Valor -->
        <div class="text-3xl font-bold text-emerald-400 mb-6">
          R$ {{ pixData.value?.toFixed(2).replace('.', ',') }}
        </div>

        <!-- QR Code -->
        <div class="bg-white p-2 rounded-lg mb-4 inline-block">
          <img 
            :src="pixData.qrCodeImage" 
            alt="QR Code PIX"
            style="width: 140px; height: 140px;"
          />
        </div>

        <!-- Código PIX Copia e Cola -->
        <div class="w-full mb-6">
          <p class="text-sm text-white/50 mb-2">Ou copie o código PIX:</p>
          <div class="relative">
            <input
              type="text"
              :value="pixData.brCode"
              readonly
              class="w-full px-4 py-3 pr-24 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-mono truncate"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              :class="pixCopied ? 'bg-emerald-500 text-white' : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'"
              @click="copyPixCode"
            >
              {{ pixCopied ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>

        <!-- Informações -->
        <div class="w-full p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
          <div class="flex items-start gap-3 text-left">
            <svg class="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm">
              <p class="font-medium text-amber-300">Aguardando pagamento</p>
              <p class="text-amber-300/70 mt-1">
                O código expira em 1 hora. Após o pagamento, seu agendamento será confirmado automaticamente.
              </p>
            </div>
          </div>
        </div>

        <!-- Resumo do agendamento -->
        <div class="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-left">
          <p class="text-sm text-white/50 mb-2">Agendamento para:</p>
          <p class="font-medium text-cyan-400">{{ formatDateBR(selectedDate) }} às {{ selectedTime }}</p>
        </div>

        <button 
          type="button"
          class="text-sm text-white/60 hover:text-white flex items-center gap-2 transition-colors"
          @click="step = 2; pixData = null"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar e escolher outro método
        </button>
      </div>
    </Card>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { loadStripe } from '@stripe/stripe-js'
import Card from '../components/Card.vue'
import Button from '../components/Button.vue'
import Input from '../components/Input.vue'
import api, { STRIPE_PUBLISHABLE_KEY } from '../utils/api'

const route = useRoute()

// Estado da aplicação
const step = ref(1)
const leadId = ref(null)
const leadName = ref('')

// Estado do calendário
const currentDate = ref(new Date())
const selectedDate = ref(null)
const selectedTime = ref(null)

// Estado dos slots
const loadingSlots = ref(false)
const availableSlots = ref([])

// Estado do checkout
const paymentMethod = ref('card')
const email = ref('')
const cpf = ref('')
const processing = ref(false)
const checkoutError = ref(null)
const cardError = ref(null)

// Estado do PIX (OpenPix)
const pixData = ref(null)
const pixCopied = ref(false)

// Formatar CPF enquanto digita
const formatCpf = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`
}

const onCpfInput = (e) => {
  cpf.value = formatCpf(e.target.value)
}

// Stripe
let stripe = null
let elements = null
let cardElement = null

// Dias da semana
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Mês atual em texto
const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('pt-BR', { month: 'long' })
})

const currentYear = computed(() => {
  return currentDate.value.getFullYear()
})

// Limites de navegação do calendário
const today = new Date()
today.setHours(0, 0, 0, 0)

const maxDate = new Date(today)
maxDate.setMonth(maxDate.getMonth() + 3)

const canGoPreviousMonth = computed(() => {
  const firstOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  const firstOfToday = new Date(today.getFullYear(), today.getMonth(), 1)
  return firstOfMonth > firstOfToday
})

const canGoNextMonth = computed(() => {
  const lastOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
  return lastOfMonth < maxDate
})

// Gerar dias do calendário
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  
  // Dias vazios antes do primeiro dia
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null)
  }
  
  // Dias do mês
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }
  
  return days
})

// Verificar se um dia é selecionável
const isDaySelectable = (day) => {
  if (!day) return false
  const dayStart = new Date(day)
  dayStart.setHours(0, 0, 0, 0)
  return dayStart >= today && dayStart <= maxDate
}

// Classe CSS para cada dia
const getDayClass = (day) => {
  if (!day) return ''
  
  const isSelected = selectedDate.value && 
    day.toDateString() === selectedDate.value.toDateString()
  
  const isToday = day.toDateString() === today.toDateString()
  const isSelectable = isDaySelectable(day)
  
  if (isSelected) {
    return 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
  }
  
  if (!isSelectable) {
    return 'text-white/20 cursor-not-allowed'
  }
  
  if (isToday) {
    return 'border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20'
  }
  
  return 'text-white/80 hover:bg-white/10'
}

// Classe CSS para cada slot de horário
const getSlotClass = (slot) => {
  if (!slot.available) {
    return 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
  }
  
  if (selectedTime.value === slot.time) {
    return 'bg-cyan-500 text-white border border-cyan-400 shadow-lg shadow-cyan-500/30'
  }
  
  return 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10 hover:border-white/20'
}

// Navegação do calendário
const previousMonth = () => {
  if (canGoPreviousMonth.value) {
    const newDate = new Date(currentDate.value)
    newDate.setMonth(newDate.getMonth() - 1)
    currentDate.value = newDate
    selectedDate.value = null
    selectedTime.value = null
    availableSlots.value = []
  }
}

const nextMonth = () => {
  if (canGoNextMonth.value) {
    const newDate = new Date(currentDate.value)
    newDate.setMonth(newDate.getMonth() + 1)
    currentDate.value = newDate
    selectedDate.value = null
    selectedTime.value = null
    availableSlots.value = []
  }
}

// Selecionar data
const selectDate = async (day) => {
  if (!isDaySelectable(day)) return
  
  selectedDate.value = day
  selectedTime.value = null
  
  // Carregar slots disponíveis
  loadingSlots.value = true
  try {
    const dateStr = formatDateISO(day)
    const response = await api.getAvailableSlots(dateStr)
    availableSlots.value = response.data.slots
  } catch (error) {
    console.error('Erro ao carregar slots:', error)
    availableSlots.value = []
  } finally {
    loadingSlots.value = false
  }
}

// Selecionar horário
const selectTime = (time) => {
  selectedTime.value = time
}

// Formatar data para exibição
const formatDateBR = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// Formatar data para API (YYYY-MM-DD)
const formatDateISO = (date) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Ir para o checkout
const goToCheckout = async () => {
  if (!selectedDate.value || !selectedTime.value) return
  
  step.value = 2
  
  // Inicializar Stripe após montar o componente
  await nextTick()
  
  if (paymentMethod.value === 'card') {
    await initializeStripeCard()
  }
}

// Inicializar Stripe Elements para cartão
const initializeStripeCard = async () => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    checkoutError.value = 'Chave do Stripe não configurada. Verifique VITE_STRIPE_PUBLISHABLE_KEY no .env'
    console.error('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY não está definida')
    return
  }

  if (!stripe) {
    try {
      stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY)
    } catch (e) {
      console.error('[Stripe] Erro ao carregar:', e)
      checkoutError.value = 'Erro ao carregar Stripe: ' + e.message
      return
    }
  }
  
  if (!stripe) {
    checkoutError.value = 'Erro ao carregar sistema de pagamento. Verifique sua conexão.'
    return
  }
  
  elements = stripe.elements({
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#06b6d4',
        colorBackground: 'rgba(255, 255, 255, 0.05)',
        colorText: '#ffffff',
        colorDanger: '#f87171',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '12px',
      },
    },
  })
  
  cardElement = elements.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
    hidePostalCode: true, // Oculta o campo de CEP
  })
  
  const cardContainer = document.getElementById('card-element')
  if (cardContainer) {
    cardElement.mount('#card-element')
    
    cardElement.on('change', (event) => {
      if (event.error) {
        cardError.value = event.error.message
      } else {
        cardError.value = null
      }
    })
  }
}

// Processar pagamento
const processPayment = async () => {
  if (!email.value || processing.value) return
  
  processing.value = true
  checkoutError.value = null
  
  try {
    if (paymentMethod.value === 'card') {
      // Pagamento com cartão via Stripe
      const response = await api.createPaymentIntent({
        lead_id: leadId.value,
        email: email.value,
        scheduled_date: formatDateISO(selectedDate.value),
        scheduled_time: selectedTime.value,
        payment_method_type: 'card',
      })
      
      const { clientSecret } = response.data
      
      // Confirmar pagamento com cartão
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: email.value,
          },
        },
      })
      
      if (error) {
        checkoutError.value = error.message
      } else if (paymentIntent.status === 'succeeded') {
        step.value = 3
      } else if (paymentIntent.status === 'requires_action') {
        checkoutError.value = 'Ação adicional necessária. Siga as instruções do banco.'
      }
    } else {
      // Validar CPF
      const cpfNumbers = cpf.value.replace(/\D/g, '')
      if (cpfNumbers.length !== 11) {
        checkoutError.value = 'CPF inválido. Digite os 11 números.'
        return
      }

      // Pagamento via PIX (OpenPix)
      const response = await api.createPixCharge({
        lead_id: leadId.value,
        email: email.value,
        cpf: cpfNumbers,
        scheduled_date: formatDateISO(selectedDate.value),
        scheduled_time: selectedTime.value,
      })
      
      // Guardar dados do PIX e ir para tela do QR Code
      pixData.value = response.data.pix
      step.value = 4 // Tela do QR Code PIX
    }
  } catch (error) {
    console.error('Erro no checkout:', error)
    checkoutError.value = error.message || 'Erro ao processar pagamento. Tente novamente.'
  } finally {
    processing.value = false
  }
}

// Copiar código PIX
const copyPixCode = async () => {
  if (!pixData.value?.brCode) return
  try {
    await navigator.clipboard.writeText(pixData.value.brCode)
    pixCopied.value = true
    setTimeout(() => { pixCopied.value = false }, 3000)
  } catch (e) {
    console.error('Erro ao copiar:', e)
  }
}

// Watch para reinicializar Stripe quando mudar método de pagamento
watch(paymentMethod, async (newMethod) => {
  if (step.value === 2 && newMethod === 'card') {
    await nextTick()
    await initializeStripeCard()
  }
})

// Inicialização
onMounted(() => {
  // Pegar lead_id da query string
  leadId.value = route.query.lead || localStorage.getItem('lead_id')
  leadName.value = route.query.name || localStorage.getItem('lead_name') || ''
  
  // Debug
  console.log('[SchedulingPage] Lead ID:', leadId.value)
})
</script>

