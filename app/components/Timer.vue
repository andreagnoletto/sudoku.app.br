<script setup lang="ts">
defineProps<{
  time: string
  isPaused: boolean
}>()

const emit = defineEmits<{
  togglePause: []
}>()
</script>

<template>
  <div class="flex items-center gap-3">
    <span class="font-mono text-2xl tabular-nums select-none">{{ isPaused ? '--:--' : time }}</span>
    <button
      class="p-1 rounded hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :aria-label="isPaused ? 'Retomar cronômetro' : 'Pausar cronômetro'"
      @click="emit('togglePause')"
    >
      <span aria-hidden="true">{{ isPaused ? '▶' : '⏸' }}</span>
    </button>
  </div>
</template>
