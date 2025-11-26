<template>
  <section class="py-16 sm:py-20">
    <div
      class="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-[32px] border border-white/10 bg-white/5 px-8 py-12 text-center text-white shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
    >
      <p class="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Programa de Indicação</p>
      <h3 class="text-3xl font-semibold sm:text-4xl">Quer Ganhar Dinheiro Indicando?</h3>
      <p class="text-base text-white/80 sm:text-lg">
        Participe do nosso programa de indicação e receba por cada cliente que vier pelo seu link.
      </p>
      <Button as="a" href="/referral" class="mt-4">Saiba mais</Button>
    </div>
  </section>
</template>

<script setup>
import Button from './Button.vue'
</script>

