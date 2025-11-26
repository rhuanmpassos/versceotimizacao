<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <Card>
      <h1 class="text-2xl font-bold mb-4">Referral Dashboard</h1>
      <p>Your referral link: {{ referralLink }}</p>
      <p>Total hits: {{ totalHits }}</p>
      <p>Total unique IPs: {{ totalUniqueIps }}</p>
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
