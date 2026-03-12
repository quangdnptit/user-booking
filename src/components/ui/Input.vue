<template>
  <input
    ref="inputRef"
    :value="modelValue"
    class="w-full px-4 py-3 rounded-xl bg-cinema-panel border border-cinema-border text-gray-800 placeholder:text-cinema-muted focus:outline-none focus:ring-2 focus:ring-cinema-gold/40 focus:border-cinema-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out shadow-sm"
    v-bind="$attrs"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ inheritAttrs: false })
defineProps<{ modelValue?: string | number }>()
defineEmits<{ 'update:modelValue': [value: string | number] }>()
const inputRef = ref<HTMLInputElement | null>(null)
defineExpose({ el: inputRef })
</script>
