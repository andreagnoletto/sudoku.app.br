<script setup lang="ts">
defineProps<{
  value: number
  notes: number[]
  isClue: boolean
  isSelected: boolean
  isHighlightedCross: boolean
  isHighlightedBlock: boolean
  isSameDigit: boolean
  isConflict: boolean
  isCorrect: boolean
  row: number
  col: number
}>()

const emit = defineEmits<{
  select: [row: number, col: number]
}>()

/** Border classes — thicker, darker on 3×3 block boundaries */
function borderClass(row: number, col: number): string {
  return [
    row % 3 === 0 ? 'border-t-2 border-t-foreground/60' : 'border-t border-t-border/50',
    col % 3 === 0 ? 'border-l-2 border-l-foreground/60' : 'border-l border-l-border/50',
    'border-r border-r-border/50',
    'border-b border-b-border/50',
  ].join(' ')
}
</script>

<template>
  <button
    :aria-label="`Célula linha ${row + 1}, coluna ${col + 1}, ${value === 0 ? 'vazia' : `número ${value}`}`"
    role="gridcell"
    :aria-selected="isSelected"
    :class="[
      'relative flex items-center justify-center',
      'w-full aspect-square',
      'font-mono text-lg sm:text-xl font-semibold focus:outline-none',
      'select-none transition-colors',
      isCorrect && !isSelected ? 'cursor-default' : 'cursor-pointer',
      borderClass(row, col),
      isSelected
        ? 'bg-primary text-primary-foreground'
        : isConflict
          ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
          : isSameDigit
            ? 'bg-primary/20 text-foreground'
            : isHighlightedCross
              ? 'bg-primary/10 text-foreground'
              : isHighlightedBlock
                ? 'bg-muted/50 text-foreground'
                : (isCorrect && !isClue)
                  ? 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400'
                  : 'bg-background text-foreground',
      isClue ? 'font-bold' : 'font-normal',
    ]"
    @click="emit('select', row, col)"
    @keydown.prevent
  >
    <!-- Digit display -->
    <span v-if="value !== 0">{{ value }}</span>

    <!-- Pencil-mark notes — 3×3 mini grid -->
    <span
      v-else-if="notes.length > 0"
      class="absolute inset-0 grid grid-cols-3 grid-rows-3 p-px"
      aria-hidden="true"
    >
      <span
        v-for="n in 9"
        :key="n"
        class="flex items-center justify-center text-[0.45rem] sm:text-[0.5rem] leading-none"
        :class="isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'"
      >
        {{ notes.includes(n) ? n : '' }}
      </span>
    </span>
  </button>
</template>
