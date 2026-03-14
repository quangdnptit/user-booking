<template>
  <input
    ref="inputRef"
    :value="modelValue"
    class="ui-input w-full px-4 py-3 rounded-xl bg-cinema-surface border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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

<!-- Global: preflight uses input { color: inherit } so text matched placeholder/parent. Force readable value vs dim placeholder. -->
<style>
.ui-input {
  color: #ffffff !important;
  caret-color: #34d399;
}
.ui-input::placeholder {
  color: #64748b !important; /* slate-500 — clearly not white */
  opacity: 1 !important;
  font-weight: 400 !important;
}
.ui-input:focus::placeholder {
  color: #475569 !important; /* slate-600 */
}
.ui-input:-webkit-autofill,
.ui-input:-webkit-autofill:hover,
.ui-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #ffffff !important;
  box-shadow: 0 0 0px 1000px #0f1218 inset !important;
}
</style>
