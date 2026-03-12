<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 w-full mx-auto px-4 sm:px-6 py-8">
      <div class="flex flex-col xl:flex-row xl:gap-8 max-w-[1600px] mx-auto">
        <!-- Left panel: Coming soon slideshow -->
        <aside class="xl:w-72 shrink-0 order-2 xl:order-1 mb-8 xl:mb-0">
          <ComingSoonSlideshow class="xl:sticky xl:top-24" />
        </aside>

        <!-- Center: Now showing -->
        <div class="flex-1 min-w-0 order-1 xl:order-2">
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
            <div v-else key="grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>

        <!-- Right panel: Contact -->
        <aside class="xl:w-64 shrink-0 order-3">
          <ContactCard class="xl:sticky xl:top-24" />
        </aside>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Movie } from '../types'
import { api } from '../api/client'
import Header from '../components/Layout/Header.vue'
import Footer from '../components/Layout/Footer.vue'
import ComingSoonSlideshow from '../components/ComingSoonSlideshow.vue'
import ContactCard from '../components/ContactCard.vue'

const movies = ref<Movie[]>([])
const loading = ref(true)

onMounted(async () => {
  movies.value = await api.getMovies()
  loading.value = false
})
</script>
