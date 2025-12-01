<template>
  <section
    :class="[
      'relative py-12 sm:py-16 md:py-20',
      borderTop ? 'border-t border-white/5' : '',
    ]"
  >
    <div class="mx-auto grid max-w-6xl items-center gap-6 sm:gap-8 md:gap-10 lg:grid-cols-2 lg:gap-16 px-4 sm:px-5 md:px-8">
      <div
        :class="imageOrderClass"
        class="group relative flex items-center justify-center w-full"
        v-motion
        :initial="{ opacity: 0, x: reverse ? 40 : -40 }"
        :enter="{ opacity: 1, x: 0, transition: { delay: 0.2 } }"
        style="will-change: transform, opacity;"
      >
        <div class="relative w-full max-w-full overflow-hidden rounded-[20px] sm:rounded-[24px] md:rounded-[28px] border border-white/8 bg-[#0a0f1f] shadow-[0_20px_60px_rgba(0,0,0,0.55)]" style="aspect-ratio: 1200/646;">
          <img 
            :src="image" 
            :alt="imageAlt" 
            class="absolute inset-0 w-full h-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
          <div class="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent via-transparent to-black/30"></div>
        </div>
        <span class="pointer-events-none absolute -left-5 sm:-left-10 top-5 sm:top-10 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-cyan-500/20 blur-3xl"></span>
        <span class="pointer-events-none absolute -bottom-4 sm:-bottom-8 right-0 h-20 w-20 sm:h-28 sm:w-28 rounded-full bg-orange-500/20 blur-3xl"></span>
      </div>
      <div
        :class="textOrderClass"
        class="w-full"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
        style="will-change: transform, opacity;"
      >
        <FeatureBlock :eyebrow="eyebrow" :title="title" :description="description" :items="items" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import FeatureBlock from './FeatureBlock.vue'

const props = defineProps({
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
  image: {
    type: String,
    required: true,
  },
  imageAlt: {
    type: String,
    default: '',
  },
  reverse: {
    type: Boolean,
    default: false,
  },
  mobileTextFirst: {
    type: Boolean,
    default: false,
  },
  borderTop: {
    type: Boolean,
    default: true,
  },
})

const textOrderClass = computed(() => {
  const mobileOrder = props.mobileTextFirst ? 'order-1' : 'order-2'
  const desktopOrder = props.reverse ? 'lg:order-1' : 'lg:order-2'
  return `${mobileOrder} ${desktopOrder}`
})

const imageOrderClass = computed(() => {
  const mobileOrder = props.mobileTextFirst ? 'order-2' : 'order-1'
  const desktopOrder = props.reverse ? 'lg:order-2' : 'lg:order-1'
  return `${mobileOrder} ${desktopOrder}`
})
</script>

