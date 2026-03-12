import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    toasts.value.push(newToast)

    const duration = toast.duration ?? 3000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    return id
  }

  const showSuccess = (message: string, duration?: number) => addToast({ message, type: 'success', duration })
  const showError = (message: string, duration?: number) => addToast({ message, type: 'error', duration })
  const showInfo = (message: string, duration?: number) => addToast({ message, type: 'info', duration })
  const showWarning = (message: string, duration?: number) => addToast({ message, type: 'warning', duration })

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}
