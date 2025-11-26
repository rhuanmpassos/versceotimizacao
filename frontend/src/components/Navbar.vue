<template>
  <header class="sticky top-0 z-20 backdrop-blur-xl">
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <a href="/" class="flex items-center gap-3 text-white">
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold text-cyan-300">V</span>
        <div class="leading-tight">
          <p class="text-sm uppercase tracking-[0.4em] text-white/50">Versace</p>
          <p class="text-lg font-semibold text-white">Otimização</p>
        </div>
      </a>
      <nav class="hidden items-center gap-6 text-sm text-white/70 sm:flex">
        <a href="/#servicos" class="transition hover:text-white">Serviços</a>
        <a href="/#referral" class="transition hover:text-white">Indicação</a>
        <a href="/referral" class="transition hover:text-white">Programa</a>
      </nav>
      <div class="flex items-center gap-4">
        <a href="/referral" class="hidden text-sm text-white/70 transition hover:text-white sm:block">Acessar Referral</a>
        <Button as="a" href="/#lead-form" class="text-xs uppercase tracking-[0.3em]">Começar</Button>
      </div>
    </div>
  </header>
</template>

<script setup>
import Button from './Button.vue'
</script>

