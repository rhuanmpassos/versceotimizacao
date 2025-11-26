<template>
  <form class="flex flex-col gap-5" @submit.prevent="submit">
    <Input v-model="form.nome" name="ref-nome" placeholder="Nome" autocomplete="name" />
    <Input v-model="form.whatsapp" name="ref-whatsapp" placeholder="WhatsApp" autocomplete="tel" />
    <Button type="submit" :disabled="loading">
      <span v-if="!loading">Gerar Link de Indicação</span>
      <span v-else>Gerando...</span>
    </Button>
    <p v-if="error" class="text-sm text-rose-300">{{ error }}</p>
    <div v-if="referralLink" class="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <p class="text-sm text-white/70">Seu link:</p>
      <p class="break-all text-lg font-semibold text-white">{{ referralLink }}</p>
      <div class="flex flex-col gap-3 sm:flex-row">
        <Button type="button" class="w-full sm:w-auto" @click="copyLink">Copiar</Button>
        <a :href="referralLink" target="_blank" rel="noreferrer" class="w-full">
          <Button as="span" class="w-full">Abrir</Button>
        </a>
      </div>
      <p v-if="copied" class="text-sm text-emerald-300">Link copiado!</p>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import Input from './Input.vue'
import Button from './Button.vue'
import api from '../utils/api'

const form = reactive({
  nome: '',
  whatsapp: '',
})

const loading = ref(false)
const error = ref(null)
const referralLink = ref('')
const copied = ref(false)

const submit = async () => {
  if (!form.nome.trim() || !form.whatsapp.trim()) {
    error.value = 'Informe nome e WhatsApp para gerar seu link.'
    console.warn('[FormReferral] Campos obrigatórios ausentes', { ...form })
    return
  }

  loading.value = true
  error.value = null
  copied.value = false
  console.info('[FormReferral] Gerando referral', { ...form })

  try {
    const response = await api.createReferrer({
      nome: form.nome,
      whatsapp: form.whatsapp,
    })
    referralLink.value = response.data?.referralLink ?? 'https://seusite.com/?ref=XXXXXX'
    console.info('[FormReferral] Link gerado', { referralLink: referralLink.value })
    form.nome = ''
    form.whatsapp = ''
  } catch (e) {
    console.error('[FormReferral] Falha ao gerar link', e)
    error.value = e.message || 'Não foi possível gerar agora. Tente mais tarde.'
  } finally {
    loading.value = false
  }
}

const copyLink = async () => {
  if (!referralLink.value) return
  try {
    await navigator.clipboard.writeText(referralLink.value)
    copied.value = true
  } catch (e) {
    copied.value = false
  }
}
</script>

