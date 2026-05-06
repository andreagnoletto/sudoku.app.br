<script setup lang="ts">
export interface Toast {
  id: number
  message: string
}

defineProps<{
  toasts: Toast[]
}>()
</script>

<template>
  <div class="no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="px-5 py-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white text-sm font-semibold shadow-lg whitespace-nowrap"
        role="status"
        aria-live="polite"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.85);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.9);
}
</style>
