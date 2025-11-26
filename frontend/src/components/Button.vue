<template>
  <component
    :is="props.as"
    :type="props.as === 'button' ? props.type : null"
    class="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-6 py-3 font-semibold text-white transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:pointer-events-none disabled:opacity-60"
    v-bind="$attrs"
  >
    <span
      class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-90 transition duration-300 group-hover:opacity-100"
    ></span>
    <span
      class="absolute inset-0 opacity-0 blur-3xl transition duration-300 group-hover:opacity-70"
      style="background: radial-gradient(circle, rgba(255,255,255,0.6), transparent 60%)"
    ></span>
    <span class="relative flex items-center gap-2 text-sm tracking-wide uppercase">
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