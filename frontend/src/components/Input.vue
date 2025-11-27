<template>
  <div class="group relative w-full">
    <!-- Gradient border on focus -->
    <div class="absolute -inset-[1px] rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-indigo-500/0 opacity-0 transition-all duration-300 group-focus-within:from-cyan-500/50 group-focus-within:via-blue-500/50 group-focus-within:to-indigo-500/50 group-focus-within:opacity-100 blur-[2px]"></div>
    <input
      class="relative w-full rounded-lg sm:rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-white/40 transition-all duration-300 focus:border-cyan-400/60 focus:bg-gradient-to-br focus:from-white/10 focus:to-white/[0.05] focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
      :value="modelValue"
      v-bind="$attrs"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>