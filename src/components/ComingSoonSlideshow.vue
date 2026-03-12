<template>
  <div class="coming-soon-slideshow rounded-xl border border-cinema-border bg-cinema-panel overflow-hidden shadow-sm">
    <h3 class="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-cinema-border">Coming soon</h3>
    <div class="relative aspect-[3/4] min-h-[280px] bg-cinema-surface">
      <Transition name="slide" mode="out-in">
        <div
          :key="currentIndex"
          class="absolute inset-0 flex flex-col"
        >
          <div class="flex-1 overflow-hidden">
            <img
              :src="items[currentIndex]?.posterUrl"
              :alt="items[currentIndex]?.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-3 bg-cinema-panel border-t border-cinema-border">
            <p class="font-medium text-gray-800 text-sm line-clamp-2">{{ items[currentIndex]?.title }}</p>
            <p class="text-xs text-cinema-muted mt-0.5">{{ items[currentIndex]?.genre }} · {{ items[currentIndex]?.releaseInfo }}</p>
          </div>
        </div>
      </Transition>
      <div class="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        <button
          v-for="(_, i) in items"
          :key="i"
          type="button"
          :class="['w-1.5 h-1.5 rounded-full transition-colors', i === currentIndex ? 'bg-cinema-gold' : 'bg-cinema-border']"
          :aria-label="`Slide ${i + 1}`"
          @click="currentIndex = i"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface ComingItem {
  id: string
  title: string
  genre: string
  posterUrl: string
  releaseInfo: string
}

const props = withDefaults(
  defineProps<{
    items?: ComingItem[]
    intervalMs?: number
  }>(),
  {
    intervalMs: 4000,
    items: () => [
      {
        id: 'cs-1',
        title: 'Avatar: The Way of Water',
        genre: 'Sci-Fi',
        posterUrl: 'https://placehold.co/400x600/1a1a2e/cinema-gold?text=Coming+Soon',
        releaseInfo: 'Dec 2024',
      },
      {
        id: 'cs-2',
        title: 'Mission: Impossible 8',
        genre: 'Action',
        posterUrl: 'https://placehold.co/400x600/16213e/eee?text=Coming+Soon',
        releaseInfo: '2025',
      },
      {
        id: 'cs-3',
        title: 'Snow White',
        genre: 'Fantasy',
        posterUrl: 'https://placehold.co/400x600/0f3460/eee?text=Coming+Soon',
        releaseInfo: '2025',
      },
    ],
  }
)

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.items.length
}

onMounted(() => {
  if (props.items.length <= 1) return
  timer = setInterval(next, props.intervalMs)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.4s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
</style>
