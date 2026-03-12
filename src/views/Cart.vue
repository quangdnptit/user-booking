<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
      <div class="mb-8">
        <h1 class="font-display font-bold text-3xl text-gray-800">Your cart</h1>
        <p class="text-cinema-muted mt-1">{{ cartItemCount }} item(s) · {{ cartCurrency }} {{ cartTotal.toFixed(2) }} total</p>
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="cartItems.length === 0" key="empty" class="py-16 text-center text-cinema-muted">
          <p>Your cart is empty.</p>
          <router-link to="/" class="text-cinema-gold hover:underline mt-4 inline-block transition-colors duration-200">Browse movies</router-link>
        </div>

        <div v-else key="list" class="space-y-4">
          <Card
            v-for="(item, i) in cartItems"
            :key="item.id"
            :style="{ animationDelay: `${i * 40}ms` }"
            class="animate-fade-in-up opacity-0 transition-shadow duration-200 hover:shadow-md"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h2 class="font-semibold text-gray-800">{{ item.movieTitle }}</h2>
                <p class="text-sm text-cinema-muted mt-1">
                  {{ formatDateTime(item.startTime) }} · {{ item.theaterName }} · {{ item.screenName }}
                </p>
                <p class="text-sm text-cinema-muted mt-0.5">
                  {{ item.seatIds.length }} seat(s) · {{ item.currency }} {{ item.total.toFixed(2) }}
                </p>
                <button
                  v-if="item.theaterAddress"
                  type="button"
                  class="inline-flex items-center gap-1 mt-2 text-sm font-medium text-cinema-gold hover:underline"
                  @click="toggledMapId = toggledMapId === item.id ? null : item.id"
                >
                  {{ toggledMapId === item.id ? 'Hide map' : 'Map & directions' }}
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </button>
              </div>
              <div class="flex items-center gap-3">
                <router-link :to="`/showtime/${item.showtimeId}/seats`">
                  <Button variant="secondary" class="text-sm">Edit seats</Button>
                </router-link>
                <button
                  type="button"
                  class="text-sm text-red-600 hover:underline transition-colors duration-200"
                  @click="cart.removeItem(item.id)"
                >
                  Remove
                </button>
              </div>
            </div>
            <Transition name="fade">
              <div v-if="item.theaterAddress && toggledMapId === item.id" class="mt-4 pt-4 border-t border-cinema-border">
                <TheaterMap
                  :name="item.theaterName"
                  :address="item.theaterAddress"
                />
              </div>
            </Transition>
          </Card>

          <Card class="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p class="text-lg font-semibold text-gray-800">
              Total: <span class="text-cinema-gold">{{ cartCurrency }} {{ cartTotal.toFixed(2) }}</span>
            </p>
            <Button @click="handleCheckout">
              Checkout
            </Button>
          </Card>
        </div>
      </Transition>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'
import Header from '../components/Layout/Header.vue'
import Footer from '../components/Layout/Footer.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import TheaterMap from '../components/TheaterMap.vue'

const cart = useCart()
const toggledMapId = ref<string | null>(null)
const cartItems = computed(() => cart.items.value)
const cartItemCount = computed(() => cart.itemCount.value)
const cartTotal = computed(() => cart.totalAmount.value)
const cartCurrency = computed(() => cart.currency.value)

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

const router = useRouter()

function handleCheckout() {
  const first = cart.getItems()[0]
  if (!first) return
  sessionStorage.setItem(
    'booking-confirmation',
    JSON.stringify({
      booking: {
        id: `checkout-${Date.now()}`,
        showtimeId: first.showtimeId,
        seatIds: first.seatIds,
        totalAmount: cart.totalAmount.value,
        currency: cart.currency.value,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
      },
      showtime: {
        movieId: first.movieId,
        movie: { title: first.movieTitle },
        startTime: first.startTime,
        theater: { name: first.theaterName },
        screen: { name: first.screenName },
      },
      seatCount: first.seatIds.length,
    })
  )
  cart.removeItem(first.id)
  router.push({ name: 'BookingConfirmation' })
}
</script>
