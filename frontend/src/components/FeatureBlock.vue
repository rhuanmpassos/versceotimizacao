<template>
  <div class="space-y-4 sm:space-y-5 md:space-y-6 w-full">
    <p class="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] bg-gradient-to-r from-cyan-400/80 to-blue-400/80 bg-clip-text text-transparent">{{ eyebrow }}</p>
    <div>
      <h3 class="text-2xl sm:text-3xl md:text-4xl font-semibold bg-gradient-to-br from-white via-white to-white/80 bg-clip-text text-transparent leading-tight">{{ title }}</h3>
      <p class="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-white/70 leading-relaxed">{{ description }}</p>
    </div>
    <ul class="space-y-3 sm:space-y-4">
      <li
        v-for="item in items"
        :key="item"
        class="group flex items-start gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white/85 transition-all duration-300 hover:border-white/10 hover:from-white/[0.08]"
      >
        <span class="mt-0.5 sm:mt-1 inline-flex h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 text-xs sm:text-sm text-white shadow-lg shadow-cyan-500/20">
          ⚡
        </span>
        <span class="leading-relaxed">{{ item }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

