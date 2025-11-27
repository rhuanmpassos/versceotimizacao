<template>
  <div class="flex flex-col items-center justify-center min-h-screen px-4 sm:px-5 md:px-8 py-12 sm:py-16">
    <Card class="w-full max-w-2xl">
      <div class="space-y-4 sm:space-y-6 text-white">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center sm:text-left">Referral Dashboard</h1>
        <div class="space-y-3 sm:space-y-4">
          <div class="break-words">
            <p class="text-sm sm:text-base text-white/70 mb-1">Seu link de indicação:</p>
            <p class="text-sm sm:text-base font-semibold text-cyan-300 break-all">{{ referralLink }}</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <div>
              <p class="text-sm sm:text-base text-white/70 mb-1">Total de acessos:</p>
              <p class="text-lg sm:text-xl font-semibold text-white">{{ totalHits }}</p>
            </div>
            <div>
              <p class="text-sm sm:text-base text-white/70 mb-1">IPs únicos:</p>
              <p class="text-lg sm:text-xl font-semibold text-white">{{ totalUniqueIps }}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Card from '../components/Card.vue'

const referralLink = ref('https://seusite.com/?ref=abc123')
const totalHits = ref(100)
const totalUniqueIps = ref(50)
</script>
