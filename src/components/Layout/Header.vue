<template>
  <header class="sticky top-0 z-50 bg-cinema-panel/95 backdrop-blur-md border-b border-cinema-border shadow-sm transition-shadow duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
      <router-link to="/" class="font-display font-bold text-xl text-gray-800 hover:text-cinema-gold transition-colors duration-200">
        Reel Tickets
      </router-link>
      <nav class="flex items-center gap-6">
        <router-link
          to="/"
          class="text-sm font-medium text-cinema-muted hover:text-cinema-gold transition-colors duration-200"
          active-class="text-cinema-gold"
        >
          Movies
        </router-link>
        <template v-if="user">
          <router-link
            to="/cart"
            class="relative inline-flex items-center gap-1.5 text-sm font-medium text-cinema-muted hover:text-cinema-gold transition-colors duration-200"
            active-class="text-cinema-gold"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Cart
            <span
              v-if="cartItemCount"
              class="absolute -top-1.5 -right-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-cinema-gold text-white text-xs font-semibold"
            >
              {{ cartItemCount }}
            </span>
          </router-link>
          <router-link
            to="/profile"
            class="text-sm font-medium text-cinema-muted hover:text-cinema-gold transition-colors duration-200"
            active-class="text-cinema-gold"
          >
            Profile
          </router-link>
          <button
            type="button"
            class="text-sm font-medium text-cinema-muted hover:text-cinema-gold transition-colors duration-200"
            @click="handleLogout"
          >
            Log out
          </button>
        </template>
        <router-link
          v-else
          to="/login"
          class="text-sm font-medium text-cinema-muted hover:text-cinema-gold transition-colors duration-200"
        >
          Log in
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useCart } from '../../composables/useCart'
import { useRouter } from 'vue-router'

const { user, logout } = useAuth()
const cart = useCart()
const cartItemCount = computed(() => cart.itemCount.value)
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>
