import { ref, computed, watch } from 'vue'
import type { CartItem } from '../types'

const STORAGE_KEY = 'reel-cart'
const FAKE_SEEN_KEY = 'reel-cart-fake-seen'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as CartItem[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function createFakeCartItems(): CartItem[] {
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return [
    {
      id: 'fake-cart-1',
      showtimeId: 'fake-show-1',
      movieId: 'fake-movie-1',
      movieTitle: 'Dune: Part Two',
      theaterName: 'Grand Cinema Downtown',
      theaterAddress: '123 Main St, City Center',
      screenName: 'Screen 1',
      startTime: nextWeek.toISOString(),
      seatIds: ['s1', 's2'],
      pricePerSeat: 12.5,
      total: 25,
      currency: 'USD',
    },
    {
      id: 'fake-cart-2',
      showtimeId: 'fake-show-2',
      movieId: 'fake-movie-2',
      movieTitle: 'The Fall Guy',
      theaterName: 'Riverside Theater',
      theaterAddress: '456 River Rd',
      screenName: 'Screen 3',
      startTime: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      seatIds: ['s3'],
      pricePerSeat: 10,
      total: 10,
      currency: 'USD',
    },
  ]
}

const items = ref<CartItem[]>(loadCart())

function seedFakeIfEmpty() {
  if (items.value.length > 0) return
  try {
    if (localStorage.getItem(FAKE_SEEN_KEY)) return
  } catch {
    // ignore
  }
  items.value = createFakeCartItems()
  saveCart(items.value)
  try {
    localStorage.setItem(FAKE_SEEN_KEY, '1')
  } catch {
    // ignore
  }
}

seedFakeIfEmpty()

watch(
  items,
  (val) => {
    saveCart(val)
  },
  { deep: true }
)

export function useCart() {
  const count = computed(() => items.value.reduce((acc, it) => acc + it.seatIds.length, 0))
  const itemCount = computed(() => items.value.length)
  const totalAmount = computed(() =>
    items.value.reduce((acc, it) => acc + it.total, 0)
  )
  const currency = computed(() => items.value[0]?.currency ?? 'USD')

  function addItem(item: Omit<CartItem, 'id'>) {
    const id = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    items.value = [...items.value, { ...item, id }]
  }

  function removeItem(id: string) {
    items.value = items.value.filter((it) => it.id !== id)
  }

  function clear() {
    items.value = []
  }

  function getItems() {
    return items.value
  }

  return {
    items: computed(() => items.value),
    count,
    itemCount,
    totalAmount,
    currency,
    addItem,
    removeItem,
    clear,
    getItems,
  }
}
