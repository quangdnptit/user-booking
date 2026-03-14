<template>
  <button
    :type="props.type"
    :disabled="props.disabled || props.loading"
    :class="[
      'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cinema-dark disabled:opacity-50 disabled:cursor-not-allowed',
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
    'bg-gradient-to-r from-emerald-400 to-cyan-400 text-cinema-dark shadow-lg shadow-emerald-500/10 hover:from-emerald-300 hover:to-cyan-300 focus:ring-emerald-400/50 active:scale-[0.98]',
  secondary:
    'bg-cinema-surface border border-cinema-border text-gray-200 hover:border-emerald-500/30 hover:bg-white/[0.03] focus:ring-emerald-500/30',
  danger:
    'bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 focus:ring-red-400/40',
  ghost: 'text-cinema-muted hover:text-emerald-400 hover:bg-white/[0.04] focus:ring-emerald-500/20',
}
</script>
