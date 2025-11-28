<template>
  <form class="flex flex-col gap-5" @submit.prevent="submit">
    <Input v-model="form.nome" name="ref-nome" placeholder="Nome" autocomplete="name" />
    <Input v-model="form.whatsapp" name="ref-whatsapp" placeholder="WhatsApp" autocomplete="tel" />
    <Button type="submit" :disabled="loading">
      <span v-if="!loading">Gerar Link de Indicação</span>
      <span v-else>Gerando...</span>
    </Button>
    <p v-if="error" class="text-sm text-rose-300">{{ error }}</p>
    <div v-if="referralLink" class="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <!-- Link de Indicação -->
      <div class="space-y-2">
        <p class="text-sm font-medium text-white/70">🔗 Seu link de indicação:</p>
        <p class="break-all text-lg font-semibold text-white">{{ referralLink }}</p>
        <div class="flex flex-col gap-3 sm:flex-row">
          <Button type="button" class="w-full sm:w-auto" @click="copyLink('referral')">Copiar Link</Button>
          <a :href="referralLink" target="_blank" rel="noreferrer" class="w-full sm:w-auto">
            <Button as="span" class="w-full">Abrir</Button>
          </a>
        </div>
        <p v-if="copiedReferral" class="text-sm text-emerald-300">Link copiado!</p>
      </div>

      <!-- Separador -->
      <div class="border-t border-white/10"></div>

      <!-- Link do Dashboard -->
      <div class="space-y-2">
        <p class="text-sm font-medium text-white/70">📊 Seu painel de estatísticas:</p>
        <p class="break-all text-sm text-cyan-300">{{ dashboardLink }}</p>
        <div class="flex flex-col gap-3 sm:flex-row">
          <Button type="button" class="w-full sm:w-auto" @click="copyLink('dashboard')">Copiar Link</Button>
          <router-link :to="dashboardRoute" class="w-full sm:w-auto">
            <Button as="span" class="w-full">Ver Estatísticas</Button>
          </router-link>
        </div>
        <p v-if="copiedDashboard" class="text-sm text-emerald-300">Link do painel copiado!</p>
      </div>

      <!-- Aviso importante -->
      <div class="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
        <p class="text-xs text-amber-200">
          <strong>⚠️ Importante:</strong> Guarde o link do painel! Ele é único e privado - apenas você pode acessá-lo para ver suas indicações.
        </p>
      </div>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
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
const dashboardLink = ref('')
const accessToken = ref('')
const copiedReferral = ref(false)
const copiedDashboard = ref(false)

// Rota para o dashboard com o token
const dashboardRoute = computed(() => ({
  path: '/referral/dashboard',
  query: { token: accessToken.value },
}))

const submit = async () => {
  if (!form.nome.trim() || !form.whatsapp.trim()) {
    error.value = 'Informe nome e WhatsApp para gerar seu link.'
    console.warn('[FormReferral] Campos obrigatórios ausentes', { ...form })
    return
  }

  loading.value = true
  error.value = null
  copiedReferral.value = false
  copiedDashboard.value = false
  console.info('[FormReferral] Gerando referral', { ...form })

  try {
    const response = await api.createReferrer({
      nome: form.nome,
      whatsapp: form.whatsapp,
    })
    referralLink.value = response.data?.referralLink ?? ''
    dashboardLink.value = response.data?.dashboardLink ?? ''
    accessToken.value = response.data?.access_token ?? ''
    console.info('[FormReferral] Link gerado', { 
      referralLink: referralLink.value,
      dashboardLink: dashboardLink.value,
    })
    form.nome = ''
    form.whatsapp = ''
  } catch (e) {
    console.error('[FormReferral] Falha ao gerar link', e)
    error.value = e.message || 'Não foi possível gerar agora. Tente mais tarde.'
  } finally {
    loading.value = false
  }
}

const copyLink = async (type) => {
  const link = type === 'dashboard' ? dashboardLink.value : referralLink.value
  if (!link) return
  try {
    await navigator.clipboard.writeText(link)
    if (type === 'dashboard') {
      copiedDashboard.value = true
      setTimeout(() => { copiedDashboard.value = false }, 3000)
    } else {
      copiedReferral.value = true
      setTimeout(() => { copiedReferral.value = false }, 3000)
    }
  } catch (e) {
    // Falha silenciosa
  }
}
</script>

