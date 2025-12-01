import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import { MotionPlugin } from '@vueuse/motion'

// Router básico para o Analytics funcionar
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      component: () => import('./pages/LandingPage.vue'),
      name: 'landing'
    },
    { 
      path: '/agendamento', 
      component: () => import('./pages/SchedulingPage.vue'),
      name: 'scheduling'
    },
    { 
      path: '/referral', 
      component: () => import('./pages/ReferralPage.vue'),
      name: 'referral'
    },
    { 
      path: '/referral/dashboard', 
      component: () => import('./pages/ReferralDashboardPage.vue'),
      name: 'referral-dashboard'
    },
    { 
      path: '/referral/info', 
      component: () => import('./pages/ReferralInfoPage.vue'),
      name: 'referral-info'
    },
    { 
      path: '/admin', 
      component: () => import('./pages/AdminLoginPage.vue'),
      name: 'admin-login'
    },
    { 
      path: '/admin/dashboard', 
      component: () => import('./pages/AdminDashboardPage.vue'),
      name: 'admin-dashboard'
    },
    { 
      path: '/:pathMatch(.*)*', 
      component: () => import('./pages/LandingPage.vue'),
      name: 'catch-all'
    },
  ],
})

const app = createApp(App)
app.use(router)
app.use(MotionPlugin)
app.mount('#app')