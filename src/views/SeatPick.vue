<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
      <Transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="py-20 flex justify-center">
          <div class="w-10 h-10 border-2 border-cinema-gold border-t-transparent rounded-full animate-spin" />
        </div>

        <template v-else-if="showtime">
          <div key="content">
            <div class="mb-8">
              <router-link :to="`/movie/${showtime.movieId}`" class="text-sm text-cinema-gold hover:underline mb-2 inline-block transition-colors duration-200">
                ← Back to showtime
              </router-link>
          <h1 class="font-display font-bold text-2xl text-gray-800">{{ showtime.movie?.title }}</h1>
          <p class="text-cinema-muted mt-1">
            {{ formatDateTime(showtime.startTime) }} · {{ showtime.theater?.name }} · {{ showtime.screen?.name }}
          </p>
          <p class="mt-1 font-medium text-gray-800">{{ showtime.currency }} {{ showtime.price.toFixed(2) }} per seat</p>
        </div>

        <Card class="mb-8">
          <CardHeader title="Choose your seats" :subtitle="`Selected: ${selectedSeatIds.length}`" />
          <div v-if="seatsLoading" class="py-8 text-center text-cinema-muted">Loading seats...</div>
          <div v-else-if="seats.length === 0" class="py-8 text-center text-cinema-muted">No seats available.</div>
          <div v-else class="overflow-x-auto">
            <div class="inline-block p-4 bg-cinema-surface rounded-lg border border-cinema-border">
              <div class="flex gap-0.5 mb-2">
                <span class="w-7 text-xs text-cinema-muted" />
                <span
                  v-for="i in maxCol"
                  :key="i"
                  class="w-8 text-center text-xs text-cinema-muted"
                >
                  {{ i }}
                </span>
              </div>
              <div v-for="row in rows" :key="row" class="flex gap-0.5 items-center mb-1">
                <span class="w-7 text-xs font-medium text-cinema-muted">{{ row }}</span>
                <div class="flex gap-0.5">
                  <template v-for="num in maxCol" :key="`${row}-${num}`">
                    <span
                      v-if="!seatMap.get(`${row}-${num}`)"
                      class="w-8 h-8 rounded bg-gray-200"
                    />
                    <button
                      v-else
                      type="button"
                      :disabled="!seatMap.get(`${row}-${num}`)?.isActive"
                      :class="[
                        'w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all duration-200 ease-smooth',
                        getSeatClass(seatMap.get(`${row}-${num}`)!),
                      ]"
                      :title="getSeatTitle(row, num)"
                      @click="toggleSeat(seatMap.get(`${row}-${num}`)!.id)"
                    >
                      {{ num }}
                    </button>
                  </template>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-4 mt-4 mb-4 text-xs text-cinema-muted">
              <span class="flex items-center gap-1"><span class="w-4 h-4 rounded bg-gray-400" /> Standard</span>
              <span class="flex items-center gap-1"><span class="w-4 h-4 rounded bg-cinema-gold" /> Premium</span>
              <span class="flex items-center gap-1"><span class="w-4 h-4 rounded bg-sky-500" /> Wheelchair</span>
              <span class="flex items-center gap-1"><span class="w-4 h-4 rounded bg-emerald-500 ring-2 ring-offset-1 ring-emerald-500" /> Selected</span>
              <span class="flex items-center gap-1"><span class="w-4 h-4 rounded bg-gray-400 opacity-40" /> Unavailable</span>
            </div>
          </div>
        </Card>

        <Transition name="fade">
          <Card v-if="selectedSeatIds.length > 0" class="transition-shadow duration-200">
            <CardHeader title="Confirm seats" :subtitle="`${selectedSeatIds.length} seat(s) · ${showtime.currency} ${total.toFixed(2)}`" />
            <form class="space-y-4" @submit.prevent="handleSubmit">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input id="name" v-model="customerName" placeholder="Your name" />
              </div>
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input id="email" v-model="customerEmail" type="email" placeholder="your@email.com" />
              </div>
              <div class="flex flex-wrap gap-3">
                <Button type="submit" class="w-full sm:w-auto" :loading="submitting">
                  Confirm booking
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  @click="addToCart"
                >
                  Add to cart
                </Button>
              </div>
            </form>
          </Card>
        </Transition>
          </div>
        </template>

        <div v-else key="empty" class="py-20 text-center text-cinema-muted">
          <p>Showtime not found.</p>
          <router-link to="/" class="text-cinema-gold hover:underline mt-2 inline-block transition-colors duration-200">Back to movies</router-link>
        </div>
      </Transition>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Showtime, Seat } from '../types'
import { api } from '../api/client'
import { useToast } from '../composables/useToast'
import { useCart } from '../composables/useCart'
import Header from '../components/Layout/Header.vue'
import Footer from '../components/Layout/Footer.vue'
import Card from '../components/ui/Card.vue'
import CardHeader from '../components/ui/CardHeader.vue'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'

const props = defineProps<{ showtimeId: string }>()
const router = useRouter()
const { showSuccess, showError } = useToast()
const cart = useCart()

const showtime = ref<Showtime | null>(null)
const seats = ref<Seat[]>([])
const loading = ref(true)
const seatsLoading = ref(true)
const selectedSeatIds = ref<string[]>([])
const customerName = ref('')
const customerEmail = ref('')
const submitting = ref(false)

const rows = computed(() => [...new Set(seats.value.map((s) => s.row))].sort())
const maxCol = computed(() => Math.max(0, ...seats.value.map((s) => s.seatNumber)))
const seatMap = computed(() => new Map(seats.value.map((s) => [`${s.row}-${s.seatNumber}`, s])))
const total = computed(() => {
  if (!showtime.value) return 0
  return showtime.value.price * selectedSeatIds.value.length
})

// Match CMS: same colors per seat type
const SEAT_TYPE_STYLE: Record<Seat['type'], string> = {
  STANDARD: 'bg-gray-400 text-white',
  PREMIUM: 'bg-cinema-gold text-white',
  WHEELCHAIR: 'bg-sky-500 text-white',
}

function getSeatClass(seat: Seat): string {
  if (!seat.isActive) return 'bg-gray-400 opacity-40 cursor-not-allowed'
  const selected = selectedSeatIds.value.includes(seat.id)
  if (selected) return 'bg-emerald-500 text-white ring-2 ring-offset-1 ring-emerald-500 cursor-pointer'
  const base = SEAT_TYPE_STYLE[seat.type]
  return `${base} cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-cinema-gold`
}

function getSeatTitle(row: string, num: number): string {
  const seat = seatMap.value.get(`${row}-${num}`)
  if (!seat) return `${row}${num}`
  const status = !seat.isActive ? ' (Unavailable)' : ''
  return `${row}${num} — ${seat.type}${status}`
}

function toggleSeat(seatId: string) {
  const idx = selectedSeatIds.value.indexOf(seatId)
  if (idx === -1) {
    selectedSeatIds.value = [...selectedSeatIds.value, seatId]
  } else {
    selectedSeatIds.value = selectedSeatIds.value.filter((id) => id !== seatId)
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(async () => {
  const [showtimesList] = await Promise.all([
    api.getShowtimes(),
  ])
  const st = showtimesList.find((s) => s.id === props.showtimeId)
  if (!st) {
    loading.value = false
    return
  }
  showtime.value = st
  loading.value = false

  const screenId = st.screenId
  if (!screenId) {
    seatsLoading.value = false
    return
  }
  seats.value = await api.getSeatsByScreen(screenId)
  seatsLoading.value = false
})

function addToCart() {
  if (!showtime.value || selectedSeatIds.value.length === 0) return
  cart.addItem({
    showtimeId: showtime.value.id,
    movieId: showtime.value.movieId,
    movieTitle: showtime.value.movie?.title ?? 'Movie',
    theaterName: showtime.value.theater?.name ?? '',
    theaterAddress: showtime.value.theater?.address,
    screenName: showtime.value.screen?.name ?? '',
    startTime: showtime.value.startTime,
    seatIds: [...selectedSeatIds.value],
    pricePerSeat: showtime.value.price,
    total: total.value,
    currency: showtime.value.currency,
  })
  showSuccess('Added to cart')
  router.push({ name: 'Cart' })
}

async function handleSubmit() {
  if (!showtime.value || selectedSeatIds.value.length === 0) return
  submitting.value = true
  try {
    const booking = await api.createBooking({
      showtimeId: showtime.value.id,
      seatIds: selectedSeatIds.value,
      customerName: customerName.value || undefined,
      customerEmail: customerEmail.value || undefined,
    })
    const payload = {
      booking,
      showtime: showtime.value,
      seatCount: selectedSeatIds.value.length,
    }
    sessionStorage.setItem('booking-confirmation', JSON.stringify(payload))
    router.push({ name: 'BookingConfirmation' })
    showSuccess('Booking confirmed!')
  } catch (e) {
    showError(e instanceof Error ? e.message : 'Booking failed')
  } finally {
    submitting.value = false
  }
}
</script>
