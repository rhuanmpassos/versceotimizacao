<template>
  <GradientBackground />
  <div class="relative flex min-h-screen flex-col text-white w-full">
    <Navbar />
    <main class="flex-1 w-full">
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
    // Coletar dados de tracking adicionais
    const trackingData = {
      referral_code: refCode,
      screen_width: window.screen?.width || null,
      screen_height: window.screen?.height || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      utm_source: route.query.utm_source || null,
      utm_medium: route.query.utm_medium || null,
      utm_campaign: route.query.utm_campaign || null,
    }
    
    api.trackReferral(trackingData)
  }
})
</script>
