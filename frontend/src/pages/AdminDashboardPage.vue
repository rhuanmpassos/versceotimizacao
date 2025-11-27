<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="text-lg sm:text-xl font-bold text-white">Admin</span>
          </div>
          
          <div class="flex items-center gap-2 sm:gap-4">
            <span class="hidden sm:block text-sm text-white/60">{{ userEmail }}</span>
            <button
              @click="handleLogout"
              class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Mensagens -->
      <div v-if="error" class="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
        {{ error }}
      </div>
      <div v-if="success" class="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm">
        {{ success }}
      </div>

      <!-- Criar Influencer -->
      <section class="mb-6 sm:mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <h2 class="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
          <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Criar Link de Influencer
        </h2>

        <form @submit.prevent="handleCreate" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-white/70 mb-1.5">Nome</label>
              <input
                v-model="createForm.nome"
                type="text"
                required
                placeholder="Nome do influencer"
                class="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-white/70 mb-1.5">WhatsApp</label>
              <input
                v-model="createForm.whatsapp"
                type="text"
                required
                placeholder="11999999999"
                class="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-white/70 mb-1.5">Slug do Link</label>
              <input
                v-model="createForm.slug"
                type="text"
                required
                placeholder="joaogamer"
                @input="createForm.slug = createForm.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '')"
                class="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 text-sm"
              />
              <p class="mt-1 text-xs text-white/40">Link: /?ref={{ createForm.slug || 'slug' }}</p>
            </div>
          </div>

          <button
            type="submit"
            :disabled="createLoading"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <svg v-if="createLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ createLoading ? 'Criando...' : 'Criar Influencer' }}
          </button>
        </form>
      </section>

      <!-- Lista de Influencers -->
      <section class="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Influencers ({{ influencers.length }})
          </h2>
          <button
            @click="loadInfluencers"
            :disabled="loading"
            class="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <svg :class="['w-4 h-4', loading && 'animate-spin']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="influencers.length === 0 && !loading" class="text-center py-12">
          <svg class="w-12 h-12 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p class="text-white/50">Nenhum influencer cadastrado ainda</p>
        </div>

        <!-- Loading -->
        <div v-else-if="loading && influencers.length === 0" class="text-center py-12">
          <svg class="w-8 h-8 text-cyan-400 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>

        <!-- Desktop Table -->
        <div v-else class="hidden lg:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-xs font-medium text-white/50 uppercase tracking-wider border-b border-white/10">
                <th class="pb-3 pr-4">Nome</th>
                <th class="pb-3 pr-4">Slug</th>
                <th class="pb-3 pr-4">Cliques</th>
                <th class="pb-3 pr-4">Leads</th>
                <th class="pb-3 pr-4">Status</th>
                <th class="pb-3">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="inf in influencers" :key="inf.id" :class="['transition-opacity', !inf.ativo && 'opacity-50']">
                <td class="py-4 pr-4">
                  <span class="text-white font-medium">{{ inf.nome }}</span>
                </td>
                <td class="py-4 pr-4">
                  <code class="px-2 py-1 rounded bg-white/10 text-cyan-300 text-sm">{{ inf.slug }}</code>
                </td>
                <td class="py-4 pr-4">
                  <span class="text-cyan-400 font-semibold">{{ inf.stats.totalClicks }}</span>
                  <span class="text-white/40 text-xs ml-1">IPs únicos</span>
                </td>
                <td class="py-4 pr-4">
                  <span class="text-green-400 font-semibold">{{ inf.stats.totalLeads }}</span>
                </td>
                <td class="py-4 pr-4">
                  <span :class="[
                    'px-2.5 py-1 rounded-full text-xs font-medium',
                    inf.ativo 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  ]">
                    {{ inf.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="py-4">
                  <div class="flex items-center gap-2">
                    <button
                      @click="copyLink(inf.referralLink)"
                      class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                      title="Copiar link"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                    <button
                      @click="handleToggle(inf.id)"
                      :class="[
                        'p-2 rounded-lg transition-colors',
                        inf.ativo 
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' 
                          : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                      ]"
                      :title="inf.ativo ? 'Desativar' : 'Ativar'"
                    >
                      <svg v-if="inf.ativo" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div v-if="influencers.length > 0" class="lg:hidden space-y-4">
          <div 
            v-for="inf in influencers" 
            :key="inf.id"
            :class="[
              'rounded-xl border border-white/10 bg-white/5 p-4 transition-opacity',
              !inf.ativo && 'opacity-50'
            ]"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="text-white font-medium">{{ inf.nome }}</h3>
                <code class="text-cyan-300 text-sm">{{ inf.slug }}</code>
              </div>
              <span :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium',
                inf.ativo 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              ]">
                {{ inf.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-xs text-white/50 mb-1">Cliques (IPs únicos)</p>
                <p class="text-cyan-400 font-semibold">{{ inf.stats.totalClicks }}</p>
              </div>
              <div>
                <p class="text-xs text-white/50 mb-1">Leads</p>
                <p class="text-green-400 font-semibold">{{ inf.stats.totalLeads }}</p>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                @click="copyLink(inf.referralLink)"
                class="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Copiar Link
              </button>
              <button
                @click="handleToggle(inf.id)"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  inf.ativo 
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' 
                    : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                ]"
              >
                {{ inf.ativo ? 'Desativar' : 'Ativar' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/api'

const router = useRouter()

const userEmail = ref('')
const influencers = ref([])
const loading = ref(false)
const createLoading = ref(false)
const error = ref(null)
const success = ref(null)

const createForm = reactive({
  nome: '',
  whatsapp: '',
  slug: '',
})

// Verificar autenticação
onMounted(async () => {
  try {
    const response = await api.adminVerify()
    userEmail.value = response.data?.user?.email || 'Admin'
    await loadInfluencers()
  } catch {
    router.push('/admin')
  }
})

const loadInfluencers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.adminListInfluencers()
    influencers.value = response.data?.influencers || []
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  createLoading.value = true
  error.value = null
  success.value = null

  try {
    const response = await api.adminCreateInfluencer(createForm)
    success.value = `Influencer "${response.data?.influencer?.nome}" criado com sucesso!`
    
    // Limpar form
    createForm.nome = ''
    createForm.whatsapp = ''
    createForm.slug = ''
    
    // Recarregar lista
    await loadInfluencers()
    
    // Limpar sucesso após 5s
    setTimeout(() => { success.value = null }, 5000)
  } catch (e) {
    error.value = e.message
  } finally {
    createLoading.value = false
  }
}

const handleToggle = async (id) => {
  try {
    await api.adminToggleInfluencer(id)
    await loadInfluencers()
  } catch (e) {
    error.value = e.message
  }
}

const copyLink = async (link) => {
  try {
    await navigator.clipboard.writeText(link)
    success.value = 'Link copiado!'
    setTimeout(() => { success.value = null }, 2000)
  } catch {
    error.value = 'Erro ao copiar link'
  }
}

const handleLogout = () => {
  api.adminLogout()
  router.push('/admin')
}
</script>

