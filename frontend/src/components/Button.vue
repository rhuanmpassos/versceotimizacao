<template>
  <component
    :is="props.as"
    :type="props.as === 'button' ? props.type : null"
    class="group relative inline-flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-white transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:pointer-events-none disabled:opacity-60 w-full sm:w-auto"
    v-bind="$attrs"
  >
    <!-- Main gradient background -->
    <span class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 opacity-90 transition-all duration-300 group-hover:opacity-100"></span>
    
    <!-- Shimmer effect on hover -->
    <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full"></span>
    
    <!-- Glow effect -->
    <span class="pointer-events-none absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-indigo-500/50 opacity-0 blur-lg transition-all duration-300 group-hover:opacity-60"></span>
    
    <!-- Top highlight -->
    <span class="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></span>
    
    <span class="relative flex items-center gap-2 text-xs sm:text-sm tracking-wide uppercase drop-shadow-sm">
      <slot />
    </span>
  </component>
</template>

<script setup>
const props = defineProps({
  as: {
    type: String,
    default: 'button',
  },
  type: {
    type: String,
    default: 'button',
  },
})
</script>