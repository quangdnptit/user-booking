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
          <p class="mt-1 text-gray-800">
            <span class="text-cinema-muted font-normal">Standard </span>
            <span class="font-medium">{{ showtime.currency }} {{ seatPriceStandard.toFixed(2) }}</span>
            <span class="text-cinema-muted mx-1">·</span>
            <span class="text-cinema-muted font-normal">Premium </span>
            <span class="font-medium">{{ showtime.currency }} {{ seatPricePremium.toFixed(2) }}</span>
            <span class="text-cinema-muted mx-1">·</span>
            <span class="text-cinema-muted font-normal">Wheelchair </span>
            <span class="font-medium">{{ showtime.currency }} {{ seatPriceWheelchair.toFixed(2) }}</span>
          </p>
        </div>

        <Card class="mb-8 p-4 sm:p-6">
          <div v-if="seatsLoading" class="py-8 text-center text-cinema-muted">Loading seats...</div>
          <div v-else-if="seats.length === 0" class="py-8 text-center text-cinema-muted">No seats available.</div>
          <div v-else class="overflow-x-auto">
            <div class="inline-block p-4 bg-cinema-surface rounded-lg border border-cinema-border">
              <div v-for="row in rows" :key="row" class="flex gap-0.5 items-center mb-1">
                <span class="w-7 text-xs font-medium text-cinema-muted">{{ row }}</span>
                <div class="flex gap-0.5">
                  <template v-for="num in maxCol" :key="`${row}-${num}`">
                    <span
                      v-if="!seatAt(row, num)"
                      class="w-9 h-9 rounded-md bg-gray-100 border border-gray-200/80"
                      aria-hidden="true"
                    />
                    <!-- Only AVAILABLE seats are real buttons — nothing to click otherwise -->
                    <button
                      v-else-if="isSeatSelectable(seatAt(row, num)!)"
                      type="button"
                      :class="[
                        'w-9 h-9 rounded-md text-sm font-semibold shadow-sm transition-all duration-200 ease-smooth focus:outline-none focus:ring-2 focus:ring-cinema-gold focus:ring-offset-1',
                        getSelectableSeatClass(seatAt(row, num)!),
                      ]"
                      :title="getSeatTitle(row, num)"
                      :aria-label="getSeatTitle(row, num)"
                      @click="toggleSeat(seatAt(row, num)!.id)"
                    >
                      {{ num }}
                    </button>
                    <span
                      v-else
                      :class="[
                        'w-9 h-9 rounded-md inline-flex items-center justify-center text-sm font-semibold pointer-events-none select-none border-2',
                        getBlockedSeatClass(seatAt(row, num)!),
                      ]"
                      :title="getSeatTitle(row, num)"
                      role="img"
                      :aria-label="getSeatTitle(row, num)"
                    >
                      {{ num }}
                    </span>
                  </template>
                </div>
              </div>
            </div>
            <p class="mt-4 text-sm text-gray-600 mb-3">
              Tap a seat to select. <strong class="text-gray-800">Booked</strong>,
              <strong class="text-gray-800">locked</strong>, and
              <strong class="text-gray-800">unavailable</strong> seats cannot be chosen.
            </p>
            <div class="rounded-lg bg-gray-50 border border-gray-100 p-4 mb-4">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Can choose</p>
              <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700 mb-4">
                <span class="flex items-center gap-2"
                  ><span
                    class="w-6 h-6 rounded shrink-0 bg-gray-400 shadow-sm border border-gray-500"
                    aria-hidden="true"
                  />
                  Standard</span
                >
                <span class="flex items-center gap-2"
                  ><span
                    class="w-6 h-6 rounded shrink-0 bg-cinema-gold shadow-sm border border-amber-700/50"
                    aria-hidden="true"
                  />
                  Premium</span
                >
                <span class="flex items-center gap-2"
                  ><span
                    class="w-6 h-6 rounded shrink-0 bg-sky-500 shadow-sm border border-sky-700"
                    aria-hidden="true"
                  />
                  Wheelchair</span
                >
                <span class="flex items-center gap-2"
                  ><span
                    class="w-6 h-6 rounded shrink-0 bg-emerald-500 shadow ring-1 ring-emerald-700 ring-offset-1 border border-emerald-700"
                    aria-hidden="true"
                  />
                  Your selection</span
                >
              </div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Cannot choose</p>
              <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                <span class="flex items-center gap-2 max-w-[14rem]"
                  ><span
                    class="w-6 h-6 rounded shrink-0 border-2 border-red-800 bg-red-600 shadow-sm"
                    aria-hidden="true"
                  />
                  <span><strong class="text-red-800">Booked</strong> — already sold</span></span
                >
                <span class="flex items-center gap-2 max-w-[14rem]"
                  ><span
                    class="w-6 h-6 rounded shrink-0 border-2 border-amber-700 bg-amber-500 shadow-sm"
                    aria-hidden="true"
                  />
                  <span><strong class="text-amber-800">Locked</strong> — held / not for sale</span></span
                >
                <span class="flex items-center gap-2 max-w-[14rem]"
                  ><span
                    class="w-6 h-6 rounded shrink-0 border-2 border-dashed border-stone-600 bg-stone-500"
                    aria-hidden="true"
                  />
                  <span><strong class="text-stone-700">Unavailable</strong> — out of service</span></span
                >
              </div>
            </div>
          </div>
        </Card>

        <Transition name="fade">
          <Card v-if="selectedSeatIds.length > 0" class="transition-shadow duration-200">
            <CardHeader title="Confirm seats" :subtitle="`${selectedSeatIds.length} seat(s) · ${showtime.currency} ${total.toFixed(2)}`" />
            <form class="space-y-4" @submit.prevent="handleSubmit">
              <p v-if="!user" class="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <router-link to="/login" class="font-medium text-cinema-gold hover:underline">Log in</router-link>
                to complete your booking.
              </p>
              <div class="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  class="w-full sm:w-auto"
                  :loading="submitting"
                  :disabled="!user"
                >
                  Confirm booking
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
import type { Showtime, Seat, SeatStatus } from '../types'
import { api } from '../api/client'
import { useToast } from '../composables/useToast'
import Header from '../components/Layout/Header.vue'
import Footer from '../components/Layout/Footer.vue'
import Card from '../components/ui/Card.vue'
import CardHeader from '../components/ui/CardHeader.vue'
import Button from '../components/ui/Button.vue'
import { useAuth } from '../composables/useAuth'

const props = defineProps<{ showtimeId: string }>()
const router = useRouter()
const { showSuccess, showError } = useToast()
const { user } = useAuth()

const showtime = ref<Showtime | null>(null)
const seats = ref<Seat[]>([])
const loading = ref(true)
const seatsLoading = ref(true)
const selectedSeatIds = ref<string[]>([])
const submitting = ref(false)

const rows = computed(() => [...new Set(seats.value.map((s) => s.row))].sort())
const maxCol = computed(() => Math.max(0, ...seats.value.map((s) => s.seatNumber)))
const seatMap = computed(() => new Map(seats.value.map((s) => [`${s.row}-${s.seatNumber}`, s])))
const PREMIUM_EXTRA = 5
const WHEELCHAIR_EXTRA = 10

const seatPriceStandard = computed(() => showtime.value?.price ?? 0)
const seatPricePremium = computed(() => (showtime.value?.price ?? 0) + PREMIUM_EXTRA)
const seatPriceWheelchair = computed(() => (showtime.value?.price ?? 0) + WHEELCHAIR_EXTRA)

function priceForSeat(seat: Seat): number {
  const base = showtime.value?.price ?? 0
  if (seat.type === 'PREMIUM') return base + PREMIUM_EXTRA
  if (seat.type === 'WHEELCHAIR') return base + WHEELCHAIR_EXTRA
  return base
}

const total = computed(() => {
  if (!showtime.value || selectedSeatIds.value.length === 0) return 0
  let sum = 0
  for (const id of selectedSeatIds.value) {
    const seat = seats.value.find((s) => s.id === id)
    if (seat) sum += priceForSeat(seat)
    else sum += showtime.value.price
  }
  return sum
})

// Match CMS: same colors per seat type (only when AVAILABLE)
const SEAT_TYPE_STYLE: Record<Seat['type'], string> = {
  STANDARD: 'bg-gray-400 text-white',
  PREMIUM: 'bg-cinema-gold text-white',
  WHEELCHAIR: 'bg-sky-500 text-white',
}

const STATUS_LABEL: Record<SeatStatus, string> = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Unavailable',
  BOOKED: 'Booked',
  LOCKED: 'Locked',
}

function seatStatusOf(seat: Seat): SeatStatus {
  if (seat.status) return seat.status
  return seat.isActive ? 'AVAILABLE' : 'UNAVAILABLE'
}

function isSeatSelectable(seat: Seat): boolean {
  return !isSeatBlocked(seat)
}

/** Locked, booked, unavailable, or inactive — never clickable */
function isSeatBlocked(seat: Seat): boolean {
  const st = seatStatusOf(seat)
  if (st === 'BOOKED' || st === 'LOCKED' || st === 'UNAVAILABLE') return true
  if (!seat.isActive) return true
  return false
}

function seatAt(row: string, num: number): Seat | undefined {
  return seatMap.value.get(`${row}-${num}`)
}

/** Styles only for selectable (AVAILABLE) seats */
function getSelectableSeatClass(seat: Seat): string {
  const selected = selectedSeatIds.value.includes(seat.id)
  if (selected) {
    return 'bg-emerald-500 text-white ring-2 ring-emerald-600 ring-offset-1 shadow-md hover:bg-emerald-600'
  }
  return `${SEAT_TYPE_STYLE[seat.type]} text-white hover:brightness-110 hover:ring-2 hover:ring-cinema-gold hover:ring-offset-1 cursor-pointer`
}

/** Blocked seats: not clickable — booked / locked / unavailable */
function getBlockedSeatClass(seat: Seat): string {
  const st = seatStatusOf(seat)
  if (st === 'BOOKED') return 'text-white border-red-800 bg-red-600'
  if (st === 'LOCKED') return 'text-amber-950 border-amber-700 bg-amber-500'
  if (st === 'UNAVAILABLE' || !seat.isActive) {
    return 'text-stone-100 border-dashed border-stone-600 bg-stone-500'
  }
  return 'text-white border-stone-600 bg-stone-500'
}

function getSeatTitle(row: string, num: number): string {
  const seat = seatMap.value.get(`${row}-${num}`)
  if (!seat) return `${row}${num}`
  const st = seatStatusOf(seat)
  return `${row}${num} — ${seat.type} — ${STATUS_LABEL[st]}`
}

function toggleSeat(seatId: string) {
  const seat = seats.value.find((s) => s.id === seatId)
  if (!seat || !isSeatSelectable(seat)) return
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

  try {
    seats.value = await api.getSeatsByShowtime(props.showtimeId, st.screenId)
  } catch (e) {
    showError(e instanceof Error ? e.message : 'Failed to load seats')
    seats.value = []
  } finally {
    seatsLoading.value = false
  }
})

async function handleSubmit() {
  if (!showtime.value || selectedSeatIds.value.length === 0) return
  const uid = user.value?.id
  if (!uid) {
    showError('Please log in to book seats.')
    return
  }
  submitting.value = true
  try {
    const booking = await api.createSeatsBooking({
      showtime_id: showtime.value.id,
      seat_keys: [...selectedSeatIds.value],
      user_id: uid,
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
