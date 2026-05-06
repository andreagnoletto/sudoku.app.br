<script setup lang="ts">
defineProps<{
  completedDigits: Set<number>
  remainingCounts: Record<number, number>
}>()

const emit = defineEmits<{
  digit: [num: number]
  erase: []
}>()

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]
</script>

<template>
  <div class="grid grid-cols-5 gap-2 w-full max-w-[min(90vw,520px)] mx-auto">
    <button
      v-for="n in digits"
      :key="n"
      :disabled="completedDigits.has(n)"
      class="relative flex items-center justify-center rounded-lg border aspect-square font-mono text-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :class="completedDigits.has(n)
        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 cursor-default opacity-80'
        : 'border-border bg-card text-card-foreground hover:bg-muted active:scale-95 cursor-pointer'"
      :aria-label="completedDigits.has(n) ? `${n} completo` : `Inserir número ${n} (${remainingCounts[n]} restantes)`"
      @click="!completedDigits.has(n) && emit('digit', n)"
    >
      <span :class="{ 'line-through opacity-50': completedDigits.has(n) }">{{ n }}</span>
      <!-- Completed badge -->
      <span
        v-if="completedDigits.has(n)"
        class="absolute top-0.5 right-1 text-[0.55rem] leading-none text-emerald-500 dark:text-emerald-400"
        aria-hidden="true"
      >✓</span>
      <!-- Remaining count -->
      <span
        v-else-if="remainingCounts[n] !== undefined"
        class="absolute bottom-0.5 right-1 text-[0.6rem] leading-none text-muted-foreground tabular-nums"
        aria-hidden="true"
      >{{ remainingCounts[n] }}</span>
    </button>

    <!-- Erase button -->
    <button
      class="col-span-1 flex items-center justify-center rounded-lg border border-border bg-card text-card-foreground aspect-square hover:bg-muted active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Apagar célula"
      @click="emit('erase')"
    >
      ⌫
    </button>
  </div>
</template>
