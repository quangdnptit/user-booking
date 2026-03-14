<template>
  <div
    :class="[
      'rounded-2xl border border-white/[0.06] bg-cinema-panel p-6 shadow-cinema transition-shadow duration-200',
      $attrs.class,
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>
