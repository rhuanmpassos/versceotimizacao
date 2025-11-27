<template>
  <section class="relative mx-auto flex min-h-[90vh] w-full max-w-6xl items-center px-4 sm:px-5 md:px-8 pb-12 sm:pb-16 pt-20 sm:pt-24 md:pt-28 lg:pt-32">
    <div class="grid w-full gap-8 sm:gap-10 md:gap-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="relative flex flex-col justify-center text-center lg:text-left w-full">
        <p
          class="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] bg-gradient-to-r from-cyan-400/90 to-blue-400/90 bg-clip-text text-transparent"
          v-motion
          :initial="motionBase"
          :enter="{ ...motionEnter, transition: { delay: 0 } }"
        >
          Versace Otimização
        </p>
        <h1
          class="mt-4 sm:mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-transparent"
          v-motion
          :initial="motionBase"
          :enter="{ ...motionEnter, transition: { delay: 0.1 } }"
        >
          Otimize Seu PC Para o Máximo Desempenho
        </h1>
        <p
          class="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/70 leading-relaxed"
          v-motion
          :initial="motionBase"
          :enter="{ ...motionEnter, transition: { delay: 0.2 } }"
        >
          Formatação, otimizações profissionais e ajustes avançados — tudo para deixar seu PC voando.
        </p>
        <div
          id="lead-form"
          class="mt-8 sm:mt-10 min-h-[200px] w-full"
          v-motion
          :initial="motionBase"
          :enter="{ ...motionEnter, transition: { delay: 0.3 } }"
        >
          <FormLead />
        </div>
      </div>
      <div class="relative flex items-center justify-center lg:justify-end w-full mt-8 lg:mt-0">
        <!-- Glow effect behind card -->
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center lg:justify-end">
          <div class="h-[80%] w-[80%] lg:max-w-md rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 blur-3xl"></div>
        </div>
        
        <div
          class="group relative w-full max-w-full lg:max-w-md rounded-[24px] sm:rounded-[28px] md:rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent p-6 sm:p-7 md:p-8 text-white shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl min-h-[350px] sm:min-h-[380px] md:min-h-[400px]"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1, transition: { delay: 0.4, type: 'spring', damping: 18 } }"
          style="will-change: transform, opacity;"
        >
          <!-- Top highlight line -->
          <div class="pointer-events-none absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div class="absolute -top-4 sm:-top-6 right-6 sm:right-10 text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] bg-gradient-to-r from-white/60 to-white/40 bg-clip-text text-transparent">100% Custom</div>
          <div class="space-y-5 sm:space-y-6">
            <div class="flex items-center justify-between">
              <p class="text-base sm:text-lg font-semibold text-white/90">Performance Boost</p>
              <span class="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent text-base sm:text-lg font-semibold">+72%</span>
            </div>
            <div class="flex flex-col gap-3 sm:gap-4">
              <div v-for="(item, index) in optimizations" :key="item.label" class="space-y-1.5">
                <div class="flex items-center justify-between text-xs sm:text-sm text-white/60">
                  <span>{{ item.label }}</span>
                  <span class="text-white/80">{{ item.value }}%</span>
                </div>
                <div class="h-1.5 sm:h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-1000"
                    :style="{ width: item.value + '%' }"
                    :class="index === 0 ? 'shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'shadow-[0_0_10px_rgba(99,102,241,0.3)]'"
                  ></div>
                </div>
              </div>
            </div>
            <div class="rounded-xl sm:rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-transparent p-3 sm:p-4">
              <p class="text-xs sm:text-sm text-white/50 uppercase tracking-wider">Checklist</p>
              <ul class="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/85">
                <li v-for="item in checklist" :key="item" class="flex items-center gap-2">
                  <span class="inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-green-500/20 text-emerald-300 text-xs shadow-lg shadow-emerald-500/10">✓</span>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
          <span class="pointer-events-none absolute -right-4 sm:-right-8 bottom-8 sm:bottom-10 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/20 blur-3xl"></span>
          <span class="pointer-events-none absolute -left-6 sm:-left-10 top-8 sm:top-10 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/15 blur-[70px]"></span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import FormLead from './FormLead.vue'

const motionBase = { opacity: 0, y: 20 }
const motionEnter = { opacity: 1, y: 0 }

const optimizations = [
  { label: 'Latência', value: 85 },
  { label: 'FPS Médio', value: 68 },
  { label: 'Estabilidade', value: 92 },
]

const checklist = ['Formatação limpa', 'Drivers atualizados', 'Políticas ajustadas']
</script>

