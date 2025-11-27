<template>
  <footer class="relative border-t border-white/[0.06]">
    <!-- Subtle gradient line at top -->
    <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    
    <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:px-5 md:px-8 py-8 sm:py-10 text-center text-xs sm:text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between sm:text-left">
      <p class="break-words">© {{ currentYear }} Versace Otimização. Todos os direitos reservados.</p>
      <div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 text-white/50">
        <a href="#servicos" class="transition-all duration-300 hover:text-cyan-400">Serviços</a>
        <a href="/referral" class="transition-all duration-300 hover:text-cyan-400">Programa de Indicação</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

