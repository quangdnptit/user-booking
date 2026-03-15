<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
      <div class="mb-10">
        <h1 class="font-display font-bold text-3xl text-white">Profile</h1>
        <p class="text-cinema-muted mt-1">Your account and booking history</p>
      </div>

      <div v-if="user" class="space-y-8">
        <Card class="animate-fade-in-up">
          <CardHeader title="Account" subtitle="Your details" />
          <div v-if="meLoading" class="py-6 flex justify-center">
            <div
              class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"
            />
          </div>
          <div v-else-if="meError" class="py-4 text-sm text-red-300">
            {{ meError }}
            <button
              type="button"
              class="mt-2 text-emerald-400 font-medium hover:underline"
              @click="loadMe"
            >
              Try again
            </button>
          </div>
          <div v-else class="flex flex-wrap items-center gap-6">
            <div
              class="w-16 h-16 rounded-full bg-cinema-surface border-2 border-white/[0.08] flex items-center justify-center text-2xl font-display font-bold text-emerald-400"
            >
              {{ userInitial }}
            </div>
            <div>
              <p class="font-semibold text-white">{{ displayName }}</p>
              <p class="text-sm text-cinema-muted">{{ displayEmail }}</p>
              <p v-if="displayBalance != null" class="text-sm text-emerald-400 mt-1">
                Balance: {{ formatBalance(displayBalance) }}
              </p>
              <p class="text-xs text-cinema-muted mt-1">
                {{ pastBookings.length }} booking(s) in history
              </p>
            </div>
          </div>
        </Card>

        <Card class="transition-shadow duration-200 hover:shadow-md">
          <CardHeader
            title="Past bookings"
            subtitle="Loaded from your bookings API"
          />
          <div v-if="historyLoading" class="py-12 flex justify-center">
            <div
              class="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"
            />
          </div>
          <div
            v-else-if="historyError"
            class="py-8 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300"
          >
            {{ historyError }}
            <button
              type="button"
              class="mt-2 text-emerald-400 font-medium hover:underline"
              @click="loadHistory"
            >
              Try again
            </button>
          </div>
          <div
            v-else-if="pastBookings.length === 0"
            class="py-10 text-center text-cinema-muted text-sm"
          >
            No bookings yet. Book a showtime to see them here.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(b, i) in pastBookings"
              :key="b.id"
              :style="{ animationDelay: `${i * 50}ms` }"
              class="flex flex-wrap items-center justify-between gap-4 py-4 px-4 rounded-lg border border-cinema-border bg-cinema-surface animate-fade-in-up opacity-0"
            >
              <div>
                <p class="font-medium text-white">{{ b.movieTitle }}</p>
                <p class="text-sm text-cinema-muted mt-0.5">
                  {{ formatDateTime(b.startTime) }} · {{ b.theaterName }} · {{ b.screenName }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-emerald-400">
                  {{ b.currency }} {{ b.totalAmount.toFixed(2) }}
                </p>
                <span
                  class="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700"
                >
                  {{ b.status }}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div v-else class="py-16 text-center text-cinema-muted">
        <p>Please log in to view your profile.</p>
        <router-link to="/login" class="text-emerald-400 hover:underline mt-4 inline-block"
          >Log in</router-link
        >
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PastBooking } from '../types'
import { api } from '../api/client'
import { useAuth } from '../composables/useAuth'
import Header from '../components/Layout/Header.vue'
import Footer from '../components/Layout/Footer.vue'
import Card from '../components/ui/Card.vue'
import CardHeader from '../components/ui/CardHeader.vue'

const { user } = useAuth()

const pastBookings = ref<PastBooking[]>([])
const historyLoading = ref(false)
const historyError = ref<string | null>(null)

const me = ref<{ name: string; email: string; walletAmount?: number } | null>(null)
const meLoading = ref(false)
const meError = ref<string | null>(null)

const userInitial = computed(() => {
  const u = user.value
  if (!u?.name) return u?.email?.slice(0, 1).toUpperCase() ?? '?'
  return u.name.slice(0, 1).toUpperCase()
})

const displayName = computed(() => me.value?.name ?? user.value?.name ?? 'Guest')
const displayEmail = computed(() => me.value?.email ?? user.value?.email ?? '')
const displayBalance = computed(() => me.value?.walletAmount ?? user.value?.walletAmount ?? null)

function formatBalance(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

async function loadMe() {
  meLoading.value = true
  meError.value = null
  try {
    const data = await api.getMe()
    me.value = {
      name: data.name,
      email: data.email,
      walletAmount: data.walletAmount,
    }
  } catch (e) {
    meError.value = e instanceof Error ? e.message : 'Failed to load profile'
    me.value = null
  } finally {
    meLoading.value = false
  }
}

async function loadHistory() {
  const uid = user.value?.id
  if (!uid) {
    pastBookings.value = []
    return
  }
  historyLoading.value = true
  historyError.value = null
  try {
    pastBookings.value = await api.getBookingHistory(uid)
  } catch (e) {
    historyError.value = e instanceof Error ? e.message : 'Failed to load history'
    pastBookings.value = []
  } finally {
    historyLoading.value = false
  }
}

watch(
  () => user.value?.id,
  (id) => {
    if (id) {
      loadHistory()
      loadMe()
    } else {
      pastBookings.value = []
      historyError.value = null
      me.value = null
      meError.value = null
    }
  },
  { immediate: true }
)

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
</script>
