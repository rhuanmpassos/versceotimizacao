<template>
  <GradientBackground />
  <div class="relative flex min-h-screen flex-col text-white">
    <Navbar />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
  <Analytics />
  <SpeedInsights />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import GradientBackground from './components/GradientBackground.vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import api from './utils/api'

const route = useRoute()

onMounted(() => {
  const refCode = route.query.ref

  if (refCode) {
    api.trackReferral({ referral_code: refCode })
  }
})
</script>
