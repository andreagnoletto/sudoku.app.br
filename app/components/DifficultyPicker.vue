<script setup lang="ts">
import type { Difficulty } from '~~/shared/types/sudoku'

defineProps<{
  modelValue: Difficulty
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Difficulty]
}>()

const difficulties: { value: Difficulty; label: string; description: string }[] = [
  { value: 'super-easy', label: 'Super Fácil', description: '50 pistas' },
  { value: 'easy', label: 'Fácil', description: '42 pistas' },
  { value: 'medium', label: 'Médio', description: '34 pistas' },
  { value: 'hard', label: 'Difícil', description: '30 pistas' },
  { value: 'expert', label: 'Expert', description: '26 pistas' },
]
</script>

<template>
  <div role="radiogroup" aria-label="Dificuldade" class="grid grid-cols-3 gap-2 sm:grid-cols-5">
    <button
      v-for="d in difficulties"
      :key="d.value"
      role="radio"
      :aria-checked="modelValue === d.value"
      class="flex flex-col items-center rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :class="
        modelValue === d.value
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-card-foreground hover:border-primary/60'
      "
      @click="emit('update:modelValue', d.value)"
    >
      <span>{{ d.label }}</span>
      <span class="text-xs opacity-70">{{ d.description }}</span>
    </button>
  </div>
</template>
