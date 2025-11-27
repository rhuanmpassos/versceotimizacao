<template>
  <header class="sticky top-0 z-20 backdrop-blur-xl bg-black/20">
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-5 md:px-8 py-4 sm:py-5">
      <a href="/" class="flex items-center gap-2 sm:gap-3 text-white">
        <span class="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-base sm:text-lg font-bold text-cyan-300">V</span>
        <div class="leading-tight">
          <p class="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/50">Versace</p>
          <p class="text-base sm:text-lg font-semibold text-white">Otimização</p>
        </div>
      </a>
      <nav 
        :class="[
          'fixed top-16 sm:top-20 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 sm:static sm:bg-transparent sm:border-0 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm text-white/70 py-4 sm:py-0 px-4 sm:px-0',
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none sm:opacity-100 sm:translate-y-0 sm:pointer-events-auto'
        ]"
      >
        <a href="/#servicos" @click="closeMobileMenu" class="transition hover:text-white w-full sm:w-auto text-center sm:text-left py-2 sm:py-0">Serviços</a>
        <a href="/#referral" @click="closeMobileMenu" class="transition hover:text-white w-full sm:w-auto text-center sm:text-left py-2 sm:py-0">Indicação</a>
        <a href="/referral" @click="closeMobileMenu" class="transition hover:text-white w-full sm:w-auto text-center sm:text-left py-2 sm:py-0">Programa</a>
      </nav>
      <div class="flex items-center gap-2 sm:gap-4">
        <a href="/referral" class="hidden text-xs sm:text-sm text-white/70 transition hover:text-white md:block">Acessar Referral</a>
        <Button as="a" href="/#lead-form" class="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] px-3 sm:px-4 py-1.5 sm:py-2">Começar</Button>
        <button
          @click="toggleMobileMenu"
          class="sm:hidden flex items-center justify-center w-10 h-10 text-white/70 hover:text-white transition"
          aria-label="Toggle menu"
        >
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import Button from './Button.vue'

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

