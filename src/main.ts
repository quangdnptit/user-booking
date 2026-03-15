import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store'
import { initAuth } from './composables/useAuth'
import './index.css'

const app = createApp(App)
app.use(store)
app.use(router)
initAuth()
app.mount('#app')
