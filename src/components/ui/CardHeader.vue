<template>
  <div class="flex items-start justify-between mb-4">
    <div>
      <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm text-cinema-muted mt-0.5">{{ subtitle }}</p>
    </div>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>
