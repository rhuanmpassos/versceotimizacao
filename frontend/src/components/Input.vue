<template>
  <div class="relative w-full">
    <input
      class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/50 transition focus:border-cyan-400/80 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
      :value="modelValue"
      v-bind="$attrs"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span class="pointer-events-none absolute inset-0 rounded-xl border border-white/5 opacity-0 blur-md transition duration-300 focus-within:opacity-70"></span>
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