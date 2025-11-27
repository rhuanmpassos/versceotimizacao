<template>
  <section class="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 sm:px-5 md:px-8 pb-12 sm:pb-16 md:pb-20 pt-20 sm:pt-24 md:pt-28">
    <Card class="w-full">
      <div class="space-y-6 sm:space-y-8 text-center text-white" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0 }">
        <div class="space-y-3 sm:space-y-4">
          <p class="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/60">Programa de Indicação</p>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">Ganhe indicando novos clientes</h1>
          <p class="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed px-2 sm:px-0">
            Receba uma comissão toda vez que alguém contratar nosso serviço através do seu link personalizado. Cadastre-se abaixo e acompanhe tudo pelo painel.
          </p>
        </div>

        <!-- Informações sobre o programa -->
        <div class="mx-auto max-w-3xl space-y-4 sm:space-y-6 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 sm:p-6 md:p-8 text-left">
          <h2 class="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Como funciona o programa</h2>
          
          <div class="space-y-3 sm:space-y-4">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="flex-shrink-0 mt-0.5 sm:mt-1">
                <div class="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                  <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-base sm:text-lg mb-1 leading-tight">Você ganha quando sua indicação compra</h3>
                <p class="text-sm sm:text-base text-white/70 leading-relaxed">A comissão é creditada apenas quando a pessoa indicada por você efetivamente contrata o serviço de otimização.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 sm:gap-4">
              <div class="flex-shrink-0 mt-0.5 sm:mt-1">
                <div class="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                  <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-base sm:text-lg mb-1 leading-tight">R$ 60,00 por cada indicação</h3>
                <p class="text-sm sm:text-base text-white/70 leading-relaxed">Para cada pessoa que você indicar e que contratar nosso serviço, você recebe R$ 60,00 de comissão.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 sm:gap-4">
              <div class="flex-shrink-0 mt-0.5 sm:mt-1">
                <div class="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-base sm:text-lg mb-1 leading-tight">5 indicações = Otimização gratuita</h3>
                <p class="text-sm sm:text-base text-white/70 leading-relaxed">Além das comissões, ao atingir 5 indicações que contrataram o serviço, você ganha uma otimização completa gratuita para seu próprio PC!</p>
              </div>
            </div>

            <div class="mt-4 sm:mt-6 rounded-lg sm:rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 sm:p-4">
              <p class="text-xs sm:text-sm text-yellow-200 leading-relaxed">
                <strong>Importante:</strong> Cada pessoa só pode ser indicada uma vez. O sistema detecta automaticamente tentativas de fraude usando o mesmo número de WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <div class="mx-auto max-w-xl space-y-4 sm:space-y-6 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6 text-left">
          <h2 class="text-xl sm:text-2xl font-semibold">Crie seu link agora</h2>
          <p class="text-sm sm:text-base text-white/70">Informe seus dados para gerar um link exclusivo e compartilhar com sua rede.</p>
          <FormReferral />
        </div>
      </div>
    </Card>
  </section>
</template>

<script setup>
import Card from '../components/Card.vue'
import FormReferral from '../components/FormReferral.vue'
</script>

