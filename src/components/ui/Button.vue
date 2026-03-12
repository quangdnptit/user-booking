<template>
  <button
    :type="props.type"
    :disabled="props.disabled || props.loading"
    :class="[
      'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cinema-panel disabled:opacity-50 disabled:cursor-not-allowed',
      variants[props.variant],
      $attrs.class,
    ]"
  >
    <template v-if="props.loading">
      <span class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      Loading...
    </template>
    <template v-else>
      <slot />
    </template>
  </button>
</template>

<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disabled?: boolean
  }>(),
  { variant: 'primary', type: 'button', loading: false, disabled: false }
)

const variants: Record<Variant, string> = {
  primary:
    'bg-cinema-gold text-white shadow-sm hover:bg-cinema-goldDim focus:ring-cinema-gold/50 active:scale-[0.98] transition-all duration-200',
  secondary:
    'bg-cinema-surface border border-cinema-border text-gray-700 hover:bg-cinema-border/50 focus:ring-gray-400/50 transition-all duration-200',
  danger:
    'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 focus:ring-red-400/50 transition-all duration-200',
  ghost:
    'text-cinema-muted hover:bg-cinema-surface hover:text-gray-800 transition-colors duration-200',
}
</script>
