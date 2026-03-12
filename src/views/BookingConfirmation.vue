<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-12">
      <div v-if="booking" class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6 animate-fade-in-up">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="font-display font-bold text-2xl text-gray-800 animate-fade-in-up" style="animation-delay: 50ms">Booking confirmed</h1>
        <p class="text-cinema-muted mt-2 animate-fade-in-up opacity-0" style="animation-delay: 100ms">Thank you for your order.</p>

        <Card class="mt-8 text-left transition-shadow duration-200 hover:shadow-md animate-fade-in-up opacity-0" style="animation-delay: 150ms">
          <CardHeader title="Booking details" :subtitle="`Ref: ${booking.id}`" />
          <dl class="space-y-3 text-sm">
            <div v-if="showtime" class="flex justify-between">
              <dt class="text-cinema-muted">Movie</dt>
              <dd class="font-medium text-gray-800">{{ showtime.movie?.title }}</dd>
            </div>
            <div v-if="showtime" class="flex justify-between">
              <dt class="text-cinema-muted">Date & time</dt>
              <dd class="font-medium text-gray-800">{{ formatDateTime(showtime.startTime) }}</dd>
            </div>
            <div v-if="showtime" class="flex justify-between">
              <dt class="text-cinema-muted">Theater</dt>
              <dd class="font-medium text-gray-800">{{ showtime.theater?.name }} · {{ showtime.screen?.name }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-cinema-muted">Seats</dt>
              <dd class="font-medium text-gray-800">{{ seatCount }} seat(s)</dd>
            </div>
            <div class="flex justify-between pt-3 border-t border-cinema-border">
              <dt class="text-cinema-muted">Total</dt>
              <dd class="font-semibold text-cinema-gold">{{ booking.currency }} {{ booking.totalAmount.toFixed(2) }}</dd>
            </div>
          </dl>
        </Card>

        <router-link to="/" class="inline-block mt-8 animate-fade-in-up opacity-0" style="animation-delay: 200ms">
          <Button>Book another movie</Button>
        </router-link>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-cinema-muted">No booking data. Your session may have expired.</p>
        <router-link to="/" class="text-cinema-gold hover:underline mt-4 inline-block transition-colors duration-200">Back to movies</router-link>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Booking, Showtime } from '../types'
import Header from '../components/Layout/Header.vue'
import Footer from '../components/Layout/Footer.vue'
import Card from '../components/ui/Card.vue'
import CardHeader from '../components/ui/CardHeader.vue'
import Button from '../components/ui/Button.vue'

const booking = ref<Booking | null>(null)
const showtime = ref<Showtime | null>(null)
const seatCount = ref(0)

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(() => {
  try {
    const raw = sessionStorage.getItem('booking-confirmation')
    if (raw) {
      const data = JSON.parse(raw) as { booking: Booking; showtime?: Showtime; seatCount?: number }
      booking.value = data.booking
      showtime.value = data.showtime ?? null
      seatCount.value = data.seatCount ?? 0
      sessionStorage.removeItem('booking-confirmation')
    }
  } catch {
    // ignore
  }
})
</script>
