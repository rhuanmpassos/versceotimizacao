<template>
  <section class="py-12 sm:py-16 md:py-20 px-4 sm:px-5 md:px-8">
    <div class="group relative mx-auto max-w-5xl w-full">
      <!-- Gradient glow behind card -->
      <div class="absolute -inset-1 rounded-[26px] sm:rounded-[30px] md:rounded-[34px] bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 opacity-60 blur-xl transition-all duration-500 group-hover:opacity-80"></div>
      
      <!-- Card -->
      <div class="relative flex flex-col items-center gap-4 sm:gap-6 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent px-6 sm:px-8 py-8 sm:py-10 md:py-12 text-center text-white shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
        <!-- Inner gradient accents -->
        <div class="pointer-events-none absolute top-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <p class="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Programa de Indicação</p>
        <h3 class="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight px-2 sm:px-0 bg-gradient-to-br from-white via-white to-white/80 bg-clip-text text-transparent">Quer Ganhar Dinheiro Indicando?</h3>
        <p class="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed px-2 sm:px-0 max-w-2xl">
          Participe do nosso programa de indicação e receba por cada cliente que vier pelo seu link.
        </p>
        <Button as="a" href="/referral" class="mt-2 sm:mt-4 w-full sm:w-auto">Saiba mais</Button>
      </div>
    </div>
  </section>
</template>

<script setup>
import Button from './Button.vue'
</script>

