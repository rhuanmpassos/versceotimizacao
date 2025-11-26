<template>
  <div class="space-y-10">
    <HeroSection />
    <div id="servicos" class="space-y-6">
      <FeatureSection
        v-for="(section, index) in sections"
        :key="section.id"
        :id="section.id"
        :eyebrow="section.eyebrow"
        :title="section.title"
        :description="section.description"
        :items="section.items"
        :image="section.image"
        :image-alt="section.imageAlt"
        :reverse="section.reverse"
        :mobile-text-first="section.mobileTextFirst"
        :border-top="index !== 0"
      />
    </div>
    <div id="referral">
      <ReferralCTA />
    </div>
  </div>
</template>

<script setup>
import HeroSection from '../components/HeroSection.vue'
import FeatureSection from '../components/FeatureSection.vue'
import ReferralCTA from '../components/ReferralCTA.vue'

const sections = [
  {
    id: 'formatacao',
    eyebrow: 'Otimização e Formatação',
    title: 'Windows limpo, seguro e pronto para performar',
    description:
      'Formatamos e configuramos seu Windows com ajustes profissionais, eliminando processos lentos e configurando tudo para velocidade máxima.',
    items: ['Formatação premium e sem bloatware', 'Drivers e BIOS atualizados', 'Perfis de energia otimizados'],
    image: 'https://res.cloudinary.com/dj1xydrsi/image/upload/w_1200,h_675,c_limit,q_auto,f_auto/v1764184038/Captura_de_tela_2025-11-26_160115_kn9laz.png',
    imageAlt: 'Desktop otimizado apresentando dashboard',
    reverse: false,
    mobileTextFirst: false,
  },
  {
    id: 'politicas',
    eyebrow: 'Políticas do Windows',
    title: 'Controle total das políticas e serviços',
    description:
      'Ajustamos políticas de energia, serviços, execução e removemos bloatware para que nada atrapalhe seu fluxo de trabalho.',
    items: ['Políticas de energia agressivas', 'Remoção total de bloatware', 'Desativação de serviços inúteis'],
    image: 'https://res.cloudinary.com/dj1xydrsi/image/upload/w_1200,h_675,c_limit,q_auto,f_auto/v1764184300/Captura_de_tela_2025-11-26_161111_wz4e5r.png',
    imageAlt: 'Console mostrando políticas do Windows',
    reverse: true,
    mobileTextFirst: true,
  },
  {
    id: 'nvidia',
    eyebrow: 'Painel NVIDIA',
    title: 'Ajustes finos para placas NVIDIA',
    description:
      'Entregamos perfis personalizados que priorizam estabilidade, baixa latência e máximo FPS para o seu setup.',
    items: ['Controle avançado de energia', 'Modo de latência ultra baixo', 'Configurações exclusivas para cada jogo'],
    image: 'https://res.cloudinary.com/dj1xydrsi/image/upload/w_1200,h_675,c_limit,q_auto,f_auto/v1764184235/Captura_de_tela_2025-11-26_161012_bcrk7g.png',
    imageAlt: 'Painel NVIDIA otimizado',
    reverse: false,
    mobileTextFirst: true,
  },
  {
    id: 'jogos',
    eyebrow: 'Otimização para Jogos',
    title: 'FPS alto e consistente em qualquer game',
    description:
      'Configuramos prioridades de processos, moldes para jogos populares e otimizações de rede para reduzir lag e travamentos.',
    items: ['Perfis para os principais jogos', 'Prioridade de processos crítica', 'Rede ajustada para ping menor'],
    image: 'https://res.cloudinary.com/dj1xydrsi/image/upload/w_1200,h_675,c_limit,q_auto,f_auto/v1764184359/346190abf755e3883d1353fbc8d8ccb7e1acf076f1138d6b_bxisc4.avif',
    imageAlt: 'Gameplay com alta taxa de quadros',
    reverse: true,
    mobileTextFirst: true,
  },
]
</script>
