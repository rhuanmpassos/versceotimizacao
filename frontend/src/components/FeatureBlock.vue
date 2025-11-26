<template>
  <div class="space-y-6">
    <p class="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">{{ eyebrow }}</p>
    <div>
      <h3 class="text-3xl font-semibold text-white sm:text-4xl">{{ title }}</h3>
      <p class="mt-4 text-base text-white/80 sm:text-lg">{{ description }}</p>
    </div>
    <ul class="space-y-4">
      <li
        v-for="item in items"
        :key="item"
        class="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-white/90"
      >
        <span class="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm text-white">
          ⚡
        </span>
        <span>{{ item }}</span>
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

