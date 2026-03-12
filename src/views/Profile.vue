<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
      <div class="mb-10">
        <h1 class="font-display font-bold text-3xl text-gray-800">Profile</h1>
        <p class="text-cinema-muted mt-1">Your account and booking history</p>
      </div>

      <div v-if="user" class="space-y-8">
        <Card class="animate-fade-in-up">
          <CardHeader title="Account" subtitle="Your details" />
          <div class="flex flex-wrap items-center gap-6">
            <div class="w-16 h-16 rounded-full bg-cinema-surface border-2 border-cinema-border flex items-center justify-center text-2xl font-display font-bold text-cinema-gold">
              {{ userInitial }}
            </div>
            <div>
              <p class="font-semibold text-gray-800">{{ user.name || 'Guest' }}</p>
              <p class="text-sm text-cinema-muted">{{ user.email }}</p>
              <p class="text-xs text-cinema-muted mt-1">Member since 2024 · {{ pastBookings.length }} past booking(s)</p>
            </div>
          </div>
        </Card>

        <Card class="transition-shadow duration-200 hover:shadow-md">
          <CardHeader title="Past bookings" subtitle="Your ticket history (demo data)" />
          <div class="space-y-3">
            <div
              v-for="(b, i) in pastBookings"
              :key="b.id"
              :style="{ animationDelay: `${i * 50}ms` }"
              class="flex flex-wrap items-center justify-between gap-4 py-4 px-4 rounded-lg border border-cinema-border bg-cinema-surface animate-fade-in-up opacity-0"
            >
              <div>
                <p class="font-medium text-gray-800">{{ b.movieTitle }}</p>
                <p class="text-sm text-cinema-muted mt-0.5">
                  {{ formatDateTime(b.startTime) }} · {{ b.theaterName }} · {{ b.screenName }}
                </p>
                <p class="text-xs text-cinema-muted mt-1">{{ b.seatCount }} seat(s)</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-cinema-gold">{{ b.currency }} {{ b.totalAmount.toFixed(2) }}</p>
                <span class="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">
                  {{ b.status }}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div v-else class="py-16 text-center text-cinema-muted">
        <p>Please log in to view your profile.</p>
        <router-link to="/login" class="text-cinema-gold hover:underline mt-4 inline-block">Log in</router-link>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PastBooking } from '../types'
import { useAuth } from '../composables/useAuth'
import Header from '../components/Layout/Header.vue'
import Footer from '../components/Layout/Footer.vue'
import Card from '../components/ui/Card.vue'
import CardHeader from '../components/ui/CardHeader.vue'

const { user } = useAuth()

const userInitial = computed(() => {
  const u = user.value
  if (!u?.name) return u?.email?.slice(0, 1).toUpperCase() ?? '?'
  return u.name.slice(0, 1).toUpperCase()
})

const pastBookings = computed<PastBooking[]>(() => [
  {
    id: 'past-1',
    movieTitle: 'Dune: Part Two',
    theaterName: 'Grand Cinema Downtown',
    screenName: 'Screen 1',
    startTime: '2024-02-15T19:00:00.000Z',
    seatCount: 2,
    totalAmount: 28.5,
    currency: 'USD',
    status: 'Completed',
  },
  {
    id: 'past-2',
    movieTitle: 'Oppenheimer',
    theaterName: 'Riverside Theater',
    screenName: 'Screen 2',
    startTime: '2024-01-20T14:30:00.000Z',
    seatCount: 1,
    totalAmount: 14.0,
    currency: 'USD',
    status: 'Completed',
  },
  {
    id: 'past-3',
    movieTitle: 'The Fall Guy',
    theaterName: 'Grand Cinema Downtown',
    screenName: 'Screen 3',
    startTime: '2024-03-01T20:00:00.000Z',
    seatCount: 3,
    totalAmount: 36.0,
    currency: 'USD',
    status: 'Completed',
  },
  {
    id: 'past-4',
    movieTitle: 'Kingdom of the Planet of the Apes',
    theaterName: 'Riverside Theater',
    screenName: 'Screen 1',
    startTime: '2024-03-10T18:00:00.000Z',
    seatCount: 2,
    totalAmount: 24.0,
    currency: 'USD',
    status: 'Completed',
  },
  {
    id: 'past-5',
    movieTitle: 'Furiosa: A Mad Max Saga',
    theaterName: 'Grand Cinema Downtown',
    screenName: 'Screen 2',
    startTime: '2024-05-25T21:00:00.000Z',
    seatCount: 1,
    totalAmount: 12.5,
    currency: 'USD',
    status: 'Completed',
  },
])

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}
</script>
