<template>
  <div
    class="coming-soon-slideshow rounded-2xl border border-white/[0.06] bg-cinema-panel overflow-hidden shadow-cinema"
  >
    <h3 class="px-4 py-3 text-sm font-semibold text-white border-b border-white/[0.06]">Coming soon</h3>
    <div class="relative aspect-[3/4] min-h-[280px] bg-cinema-surface">
      <Transition name="slide" mode="out-in">
        <div :key="currentIndex" class="absolute inset-0 flex flex-col">
          <div class="flex-1 overflow-hidden">
            <img
              :src="items[currentIndex]?.posterUrl"
              :alt="items[currentIndex]?.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-3 bg-cinema-panel border-t border-white/[0.06]">
            <p class="font-medium text-white text-sm line-clamp-2">{{ items[currentIndex]?.title }}</p>
            <p class="text-xs text-cinema-muted mt-0.5">
              {{ items[currentIndex]?.genre }} · {{ items[currentIndex]?.releaseInfo }}
            </p>
          </div>
        </div>
      </Transition>
      <div class="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        <button
          v-for="(_, i) in items"
          :key="i"
          type="button"
          :class="[
            'w-1.5 h-1.5 rounded-full transition-colors',
            i === currentIndex ? 'bg-emerald-400' : 'bg-cinema-border',
          ]"
          :aria-label="`Slide ${i + 1}`"
          @click="currentIndex = i"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

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
  }>(),
  {
    items: () => [],
  }
)

const defaultItems: ComingItem[] = [
  {
    id: '1',
    title: 'Dune: Part Three',
    genre: 'Sci-Fi',
    posterUrl: 'https://placehold.co/400x600/14181f/34d399?text=Coming',
    releaseInfo: 'Dec 2025',
  },
  {
    id: '2',
    title: 'Avatar 3',
    genre: 'Adventure',
    posterUrl: 'https://placehold.co/400x600/14181f/22d3ee?text=Soon',
    releaseInfo: '2026',
  },
]

const items = computed(() => (props.items.length ? props.items : defaultItems))
const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % items.value.length
  }, 5000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.35s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
</style>
