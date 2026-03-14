<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-[#0c0e12]">
    <div class="relative w-12 h-12">
      <div
        class="absolute inset-0 rounded-full border-r-[3px] border-t-[3px] border-emerald-400 animate-spin"
      />
      <div
        class="absolute inset-1.5 rounded-full border-l-[3px] border-b-[3px] border-emerald-400/25 animate-spin"
        style="animation-direction: reverse"
      />
    </div>
  </div>
  <div
    v-else
    class="min-h-screen flex flex-col lg:flex-row bg-[#0c0e12] text-gray-100 relative overflow-hidden"
  >
    <!-- Left panel — brand / visual -->
    <div
      class="lg:w-[42%] min-h-[220px] lg:min-h-screen relative flex flex-col justify-between p-10 lg:p-14 shrink-0"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-[#0a1628] to-[#0c0e12]"
      />
      <div
        class="absolute top-0 right-0 w-[80%] h-[70%] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"
      />
      <div
        class="absolute bottom-0 left-0 w-[60%] h-[50%] bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none"
      />

      <div class="relative z-10">
        <router-link
          to="/login"
          class="inline-flex items-center gap-2 text-sm text-emerald-400/90 hover:text-emerald-300 transition-colors mb-10"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to sign in
        </router-link>
        <h1
          class="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight max-w-md"
        >
          Join
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"
          >
            Galaxy Cinema
          </span>
        </h1>
        <p class="mt-4 text-gray-400 text-sm sm:text-base max-w-sm leading-relaxed">
          Create your account in seconds. Book seats, save your history, and never miss a premiere.
        </p>
      </div>

      <div class="relative z-10 hidden sm:flex items-end gap-6 text-xs text-gray-500">
        <div class="flex items-center gap-2">
          <span class="w-8 h-px bg-emerald-500/40" />
          Secure registration
        </div>
        <div class="flex items-center gap-2">
          <span class="w-8 h-px bg-emerald-500/40" />
          Same login as bookings
        </div>
      </div>
    </div>

    <!-- Right panel — form -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 relative">
      <div
        class="absolute top-20 right-10 w-72 h-72 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none"
      />
      <div class="w-full max-w-[420px] relative z-10">
        <div class="lg:hidden text-center mb-8">
          <h2 class="font-display font-bold text-2xl text-white">Create account</h2>
          <p class="text-gray-500 text-sm mt-1">Fill in your details below</p>
        </div>

        <div class="hidden lg:block mb-8">
          <h2 class="font-display font-bold text-2xl text-white">Create your account</h2>
          <p class="text-gray-500 text-sm mt-1">We’ll use this for bookings and receipts</p>
        </div>

        <div class="relative group">
          <div
            class="absolute -inset-px bg-gradient-to-r from-emerald-500/20 via-cyan-500/15 to-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
          />
          <form
            class="relative rounded-2xl bg-[#14181f] border border-white/[0.06] shadow-2xl shadow-black/40 p-8 sm:p-9 space-y-5"
            @submit.prevent="handleSubmit"
          >
            <Transition name="fade">
              <div
                v-if="error"
                class="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-3"
                role="alert"
              >
                <svg
                  class="w-5 h-5 shrink-0 mt-0.5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{{ error }}</span>
              </div>
            </Transition>

            <div class="space-y-4">
              <div>
                <label for="fullName" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
                  >Full name</label
                >
                <Input
                  id="fullName"
                  v-model="fullName"
                  type="text"
                  placeholder="Alex Johnson"
                  autocomplete="name"
                  required
                  class="!bg-[#0c0e12]/80 !border-white/10 focus:!border-emerald-500/50"
                />
              </div>
              <div>
                <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
                  >Email</label
                >
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  required
                  class="!bg-[#0c0e12]/80 !border-white/10 focus:!border-emerald-500/50"
                />
              </div>
              <div>
                <label
                  for="password"
                  class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
                  >Password</label
                >
                <Input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="At least 8 characters"
                  autocomplete="new-password"
                  required
                  minlength="8"
                  class="!bg-[#0c0e12]/80 !border-white/10 focus:!border-emerald-500/50"
                />
                <p class="text-[11px] text-gray-600 mt-1.5">Use 8+ characters for a stronger account.</p>
              </div>
              <div>
                <label
                  for="confirm"
                  class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
                  >Confirm password</label
                >
                <Input
                  id="confirm"
                  v-model="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  autocomplete="new-password"
                  required
                  class="!bg-[#0c0e12]/80 !border-white/10 focus:!border-emerald-500/50"
                />
              </div>
            </div>

            <label class="flex items-start gap-3 cursor-pointer group/tos">
              <input
                v-model="acceptTerms"
                type="checkbox"
                required
                class="mt-1 w-4 h-4 rounded border-white/20 bg-[#0c0e12] text-emerald-500 focus:ring-emerald-500/30"
              />
              <span class="text-xs text-gray-500 leading-snug group-hover/tos:text-gray-400 transition-colors">
                I agree to the terms of service and understand how my data is used for bookings and
                account access.
              </span>
            </label>

            <button
              type="submit"
              :disabled="loading"
              class="w-full h-12 rounded-xl font-semibold text-[#0c0e12] bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span v-if="loading" class="w-5 h-5 border-2 border-[#0c0e12]/30 border-t-[#0c0e12] rounded-full animate-spin" />
              <span v-else>Create account</span>
            </button>
          </form>
        </div>

        <p class="text-center text-gray-500 text-sm mt-8">
          Already have an account?
          <router-link
            to="/login"
            class="text-emerald-400 hover:text-emerald-300 font-medium ml-1 transition-colors"
            >Sign in</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import Input from '../components/ui/Input.vue'

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const acceptTerms = ref(false)
const error = ref('')
const loading = ref(false)
const { user, isLoading, register } = useAuth()
const { showSuccess } = useToast()
const router = useRouter()
const route = useRoute()
const redirect = (route.query.redirect as string) || '/'

watch(
  [user, isLoading],
  ([u, loadingState]) => {
    if (!loadingState && u) router.replace(redirect)
  },
  { immediate: true }
)

async function handleSubmit() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  loading.value = true
  try {
    const { loggedIn } = await register(fullName.value.trim(), email.value.trim(), password.value)
    if (loggedIn) {
      showSuccess('Welcome! You’re signed in.')
      router.replace(redirect)
    } else {
      showSuccess('Account created. Please sign in.')
      router.push({ path: '/login', query: { email: email.value } })
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
