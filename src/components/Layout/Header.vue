<template>
  <header
    class="sticky top-0 z-50 border-b border-white/[0.06] bg-cinema-panel/90 backdrop-blur-xl shadow-cinema transition-shadow duration-200"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
      <router-link
        to="/"
        class="font-display font-bold text-xl text-white hover:text-emerald-400 transition-colors duration-200"
      >
        <span
          class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"
          >Galaxy</span
        >
        Cinema
      </router-link>
      <nav class="flex items-center gap-6">
        <template v-if="user">
          <router-link
            to="/profile"
            class="text-sm font-medium text-cinema-muted hover:text-emerald-400 transition-colors duration-200"
            active-class="!text-emerald-400"
          >
            Profile
          </router-link>
          <button
            type="button"
            class="text-sm font-medium text-cinema-muted hover:text-emerald-400 transition-colors duration-200"
            @click="handleLogout"
          >
            Log out
          </button>
        </template>
        <router-link
          v-else
          to="/login"
          class="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
        >
          Log in
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuth } from '../../composables/useAuth'
import { useRouter } from 'vue-router'

const { user, logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>
