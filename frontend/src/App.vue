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
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import GradientBackground from './components/GradientBackground.vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import api from './utils/api'

onMounted(() => {
  // Usar URLSearchParams diretamente para garantir que os params são capturados
  const urlParams = new URLSearchParams(window.location.search)
  let refCode = urlParams.get('ref')

  console.info('[App] URL params:', window.location.search)
  console.info('[App] Ref code encontrado:', refCode)

  if (refCode) {
    // Limpa o ref caso o usuário tenha usado ? em vez de & na URL
    // Ex: ?ref=opplex?utm_source=... → pega só "opplex"
    if (refCode.includes('?')) {
      refCode = refCode.split('?')[0]
      console.warn('[App] URL malformada detectada, ref limpo para:', refCode)
    }
    
    // Só rastreia se for válido (alfanumérico, hífen, underscore)
    if (refCode && /^[a-zA-Z0-9_-]+$/.test(refCode)) {
      // Coletar dados de tracking adicionais
      const trackingData = {
        referral_code: refCode,
        screen_width: window.screen?.width || null,
        screen_height: window.screen?.height || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        utm_source: urlParams.get('utm_source') || null,
        utm_medium: urlParams.get('utm_medium') || null,
        utm_campaign: urlParams.get('utm_campaign') || null,
      }
      
      console.info('[App] Enviando tracking:', trackingData)
      
      api.trackReferral(trackingData)
        .then((response) => {
          console.info('[App] Tracking registrado:', response.data)
        })
        .catch((error) => {
          console.error('[App] Erro no tracking:', error.message, error.response?.data)
        })
    } else {
      console.warn('[App] Referral code inválido ignorado:', refCode)
    }
  }
})
</script>
