<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      <div class="mb-8">
        <h1 class="font-display font-bold text-3xl text-gray-800">Now showing</h1>
        <p class="text-cinema-muted mt-1 transition-colors duration-200">Pick a movie and book your seats</p>
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="py-20 flex justify-center">
          <div class="w-10 h-10 border-2 border-cinema-gold border-t-transparent rounded-full animate-spin" />
        </div>
        <div v-else-if="movies.length === 0" key="empty" class="py-20 text-center text-cinema-muted">
          <p>No movies available at the moment.</p>
        </div>
        <div v-else key="grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <router-link
            v-for="(m, index) in movies"
            :key="m.id"
            :to="`/movie/${m.id}`"
            :style="{ animationDelay: `${index * 50}ms` }"
            class="group block bg-cinema-panel rounded-xl border border-cinema-border overflow-hidden shadow-sm hover:shadow-lg hover:border-cinema-gold/50 transition-all duration-300 ease-smooth animate-fade-in-up opacity-0"
          >
            <div class="aspect-[2/3] overflow-hidden bg-cinema-surface">
              <img
                :src="m.posterUrl || 'https://placehold.co/400x600/f5f4f0/6b6560?text=No+poster'"
                :alt="m.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350 ease-out"
              />
            </div>
            <div class="p-4">
              <h2 class="font-semibold text-gray-800 group-hover:text-cinema-gold transition-colors duration-200 line-clamp-2">
                {{ m.title }}
              </h2>
              <p class="text-sm text-cinema-muted mt-1">{{ m.genre }} · {{ m.durationMinutes }} min</p>
              <span class="inline-block mt-2 text-sm font-medium text-cinema-gold transition-transform duration-200 group-hover:translate-x-0.5">Book tickets →</span>
            </div>
          </router-link>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Movie } from '../types'
import { api } from '../api/client'
import Header from '../components/Layout/Header.vue'

const movies = ref<Movie[]>([])
const loading = ref(true)

onMounted(async () => {
  movies.value = await api.getMovies()
  loading.value = false
})
</script>
