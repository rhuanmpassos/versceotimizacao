<template>
  <footer class="border-t border-white/5">
    <div class="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-center text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between sm:text-left">
      <p>© {{ currentYear }} Versace Otimização. Todos os direitos reservados.</p>
      <div class="flex justify-center gap-4 text-white/60">
        <a href="#servicos" class="transition hover:text-white">Serviços</a>
        <a href="/referral" class="transition hover:text-white">Programa de Indicação</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

