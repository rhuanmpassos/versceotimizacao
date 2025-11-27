<template>
  <div class="flex flex-col items-center justify-center min-h-screen px-4 sm:px-5 md:px-8 py-12 sm:py-16">
    <Card class="w-full max-w-2xl">
      <div class="space-y-4 sm:space-y-6 text-white">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center sm:text-left">Referral Info Page</h1>
        <form @submit.prevent="submit" v-if="!referralLink" class="space-y-4 sm:space-y-5">
          <div>
            <Input v-model="form.name" placeholder="Nome" />
          </div>
          <div>
            <Input v-model="form.whatsapp" placeholder="WhatsApp" />
          </div>
          <Button type="submit" :disabled="loading">
            <span v-if="!loading">Obter Link de Indicação</span>
            <span v-else>Gerando...</span>
          </Button>
        </form>
        <div v-else class="space-y-4">
          <div>
            <p class="text-sm sm:text-base text-white/70 mb-2">Seu link de indicação:</p>
            <a :href="referralLink" target="_blank" class="text-sm sm:text-base font-semibold text-cyan-300 break-all hover:underline">{{ referralLink }}</a>
          </div>
        </div>
        <div class="min-h-[24px]">
          <p v-if="loading" class="text-sm text-white/70">Carregando...</p>
          <p v-if="error" class="text-sm text-rose-300">{{ error }}</p>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Input from '../components/Input.vue'
import Button from '../components/Button.vue'
import Card from '../components/Card.vue'
import api from '../utils/api'

const form = ref({
  name: '',
  whatsapp: '',
})

const loading = ref(false)
const error = ref(null)
const referralLink = ref(null)

const submit = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.createReferrer(form.value)
    referralLink.value = response.data.referralLink
  } catch (e) {
    error.value = 'An error occurred.'
  } finally {
    loading.value = false
  }
}
</script>