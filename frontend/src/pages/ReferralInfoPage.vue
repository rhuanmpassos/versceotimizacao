<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <Card>
      <h1 class="text-2xl font-bold mb-4">Referral Info Page</h1>
      <form @submit.prevent="submit" v-if="!referralLink">
        <div class="mb-4">
          <Input v-model="form.name" placeholder="Name" />
        </div>
        <div class="mb-4">
          <Input v-model="form.whatsapp" placeholder="WhatsApp" />
        </div>
        <Button>Get Referral Link</Button>
      </form>
      <div v-else>
        <p>Your referral link:</p>
        <a :href="referralLink" target="_blank">{{ referralLink }}</a>
      </div>
      <p v-if="loading">Loading...</p>
      <p v-if="error">{{ error }}</p>
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