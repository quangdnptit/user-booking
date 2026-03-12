<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      <Transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="py-20 flex justify-center">
          <div class="w-10 h-10 border-2 border-cinema-gold border-t-transparent rounded-full animate-spin" />
        </div>

        <template v-else-if="movie">
          <div key="content" class="animate-fade-in-up">
            <div class="flex flex-col md:flex-row gap-8 mb-10">
              <div class="shrink-0 w-full md:w-72 aspect-[2/3] rounded-xl overflow-hidden border border-cinema-border bg-cinema-surface shadow-sm">
                <img
                  :src="movie.posterUrl || 'https://placehold.co/400x600/f5f4f0/6b6560?text=No+poster'"
                  :alt="movie.title"
                  class="w-full h-full object-cover transition-transform duration-350 hover:scale-[1.02]"
                />
              </div>
              <div class="flex-1">
                <h1 class="font-display font-bold text-3xl text-gray-800">{{ movie.title }}</h1>
                <p class="text-cinema-muted mt-2">{{ movie.genre }} · {{ movie.durationMinutes }} min · {{ movie.rating }}</p>
                <p class="mt-4 text-gray-700 leading-relaxed">{{ movie.description }}</p>
              </div>
            </div>

            <Card class="transition-shadow duration-200 hover:shadow-md">
              <CardHeader title="Showtimes" subtitle="Select a time and theater" />
              <div v-if="showtimesForMovie.length === 0" class="py-12 text-center text-cinema-muted">
                No showtimes scheduled for this movie.
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="(s, i) in showtimesForMovie"
                  :key="s.id"
                  :style="{ animationDelay: `${i * 30}ms` }"
                  class="flex flex-col gap-3 py-4 px-4 rounded-lg border border-cinema-border bg-cinema-surface hover:border-cinema-gold/50 hover:shadow-sm transition-all duration-250 ease-smooth animate-fade-in-up opacity-0"
                >
                  <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="min-w-0">
                      <span class="font-medium text-gray-800">{{ formatDateTime(s.startTime) }}</span>
                      <span class="text-cinema-muted ml-3">{{ s.theater?.name }} · {{ s.screen?.name }}</span>
                      <p v-if="s.theater?.address" class="text-xs text-cinema-muted mt-1 truncate">{{ s.theater.address }}</p>
                      <button
                        v-if="s.theater?.address"
                        type="button"
                        class="inline-flex items-center gap-1 mt-1.5 text-sm font-medium text-cinema-gold hover:underline"
                        @click="toggledMapId = toggledMapId === s.id ? null : s.id"
                      >
                        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {{ toggledMapId === s.id ? 'Hide map' : 'Map & directions' }}
                      </button>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="font-semibold text-cinema-gold">{{ s.currency }} {{ s.price.toFixed(2) }}</span>
                      <router-link :to="`/showtime/${s.id}/seats`">
                        <Button>Select seats</Button>
                      </router-link>
                    </div>
                  </div>
                  <Transition name="fade">
                    <div v-if="s.theater?.address && toggledMapId === s.id" class="pt-2 border-t border-cinema-border">
                      <TheaterMap
                        :name="s.theater.name"
                        :address="s.theater.address"
                      />
                    </div>
                  </Transition>
                </div>
              </div>
            </Card>
          </div>
        </template>

        <div v-else key="empty" class="py-20 text-center text-cinema-muted">
          <p>Movie not found.</p>
          <router-link to="/" class="text-cinema-gold hover:underline mt-2 inline-block transition-colors duration-200">Back to movies</router-link>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Movie, Showtime } from '../types'
import { api } from '../api/client'
import Header from '../components/Layout/Header.vue'
import Card from '../components/ui/Card.vue'
import CardHeader from '../components/ui/CardHeader.vue'
import Button from '../components/ui/Button.vue'
import TheaterMap from '../components/TheaterMap.vue'

const props = defineProps<{ id: string }>()
const toggledMapId = ref<string | null>(null)

const movie = ref<Movie | null>(null)
const showtimes = ref<Showtime[]>([])
const loading = ref(true)

const showtimesForMovie = computed(() =>
  showtimes.value.filter((s) => s.movieId === props.id)
)

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(async () => {
  const [movieData, showtimesList] = await Promise.all([
    api.getMovie(props.id),
    api.getShowtimes(),
  ])
  movie.value = movieData
  showtimes.value = showtimesList
  loading.value = false
})
</script>
