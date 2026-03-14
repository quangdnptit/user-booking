<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-cinema-dark">
    <div class="relative w-12 h-12">
      <div
        class="absolute inset-0 rounded-full border-r-[3px] border-t-[3px] border-emerald-400 animate-spin"
      />
      <div
        class="absolute inset-1.5 rounded-full border-l-[3px] border-b-[3px] border-emerald-400/30 animate-spin"
        style="animation-direction: reverse"
      />
    </div>
  </div>
  <div
    v-else
    class="min-h-screen flex items-center justify-center bg-cinema-dark px-4 relative overflow-hidden"
  >
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-10">
        <h1
          class="font-display font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2 tracking-tight"
        >
          Galaxy Cinema
        </h1>
        <p class="text-cinema-muted font-medium">Click. Book. Enjoy the Movie</p>
      </div>

      <div class="relative group">
        <div
          class="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/25 to-cyan-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-350 ease-out"
        />
        <form
          class="relative p-8 rounded-2xl bg-cinema-panel border border-white/[0.06] shadow-cinema space-y-6"
          @submit.prevent="handleSubmit"
        >
          <Transition name="fade">
            <div
              v-if="error"
              class="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm flex items-center gap-2"
              role="alert"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {{ error }}
            </div>
          </Transition>
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
                >Email</label
              >
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
              />
            </div>
            <div>
              <label
                for="password"
                class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
                >Password</label
              >
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
            </div>
          </div>
          <Button type="submit" class="w-full h-12 text-base" :loading="loading" :disabled="loading">
            Sign in
          </Button>
        </form>
      </div>

      <p class="text-center text-cinema-muted text-sm mt-8">
        New here?
        <router-link to="/register" class="text-emerald-400 hover:text-emerald-300 font-medium ml-1"
          >Create an account</router-link
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'

const email = ref((useRoute().query.email as string) || '')
const password = ref('')
const error = ref('')
const loading = ref(false)
const { user, isLoading, login } = useAuth()
const router = useRouter()
const route = useRoute()
const redirect = (route.query.redirect as string) || '/'

watch(
  [user, isLoading],
  ([u, loadingState]) => {
    if (!loadingState && u) router.replace(redirect)
  },
  { immediate: true }
)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    router.replace(redirect)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
