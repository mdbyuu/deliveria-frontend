import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Remove tokens left by the previous sessionStorage implementation.
for (const key of ['access_token', 'user', 'expires_at']) sessionStorage.removeItem(key)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
