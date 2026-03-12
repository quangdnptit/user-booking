import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initAuth } from './composables/useAuth'
import './index.css'

initAuth()
createApp(App).use(router).mount('#app')
