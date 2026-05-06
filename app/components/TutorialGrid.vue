<script setup lang="ts">
export interface TutorialCell {
  value: number
  isClue?: boolean
  highlight?: 'row' | 'col' | 'block' | 'target' | 'solved' | 'conflict' | 'eliminate'
  candidates?: number[]
}

export interface TutorialStep {
  cells: TutorialCell[][]
  caption: string
}

const props = defineProps<{
  steps: TutorialStep[]
  rows?: number   // default 9
  cols?: number   // default 9
}>()

const stepIndex = ref(0)

const currentStep = computed(() => props.steps[stepIndex.value]!)
const totalSteps = computed(() => props.steps.length)

function prev() {
  if (stepIndex.value > 0) stepIndex.value--
}
function next() {
  if (stepIndex.value < totalSteps.value - 1) stepIndex.value++
}

// Reset when steps data changes (different section reopened)
watch(() => props.steps, () => { stepIndex.value = 0 })

const numRows = computed(() => props.rows ?? props.steps[0]?.cells.length ?? 9)
const numCols = computed(() => props.cols ?? props.steps[0]?.cells[0]?.length ?? 9)

function cellBg(cell: TutorialCell): string {
  switch (cell.highlight) {
    case 'row':      return 'bg-blue-100 dark:bg-blue-950/60'
    case 'col':      return 'bg-purple-100 dark:bg-purple-950/60'
    case 'block':    return 'bg-amber-100 dark:bg-amber-950/60'
    case 'target':   return 'bg-emerald-200 dark:bg-emerald-900/80 animate-pulse'
    case 'solved':   return 'bg-emerald-100 dark:bg-emerald-950/60'
    case 'conflict': return 'bg-red-100 dark:bg-red-950/60'
    case 'eliminate': return 'bg-gray-200 dark:bg-gray-800/60 opacity-60'
    default:         return cell.isClue ? 'bg-muted/50' : 'bg-card'
  }
}

function cellText(cell: TutorialCell): string {
  if (cell.highlight === 'solved') return 'text-emerald-700 dark:text-emerald-400 font-bold'
  if (cell.highlight === 'target') return 'text-emerald-700 dark:text-emerald-300 font-bold'
  if (cell.highlight === 'conflict') return 'text-red-600 dark:text-red-400 font-bold'
  if (cell.isClue) return 'text-foreground font-semibold'
  return 'text-primary font-medium'
}

function borderClass(r: number, c: number): string {
  const t = r % 3 === 0 ? 'border-t-2 border-t-foreground/60' : 'border-t border-t-border/50'
  const l = c % 3 === 0 ? 'border-l-2 border-l-foreground/60' : 'border-l border-l-border/50'
  return `border-b border-r border-border/50 ${t} ${l}`
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <!-- Grid -->
    <div
      class="inline-grid border-2 border-foreground/60 rounded overflow-hidden"
      :style="`grid-template-columns: repeat(${numCols}, minmax(0, 1fr)); width: min(${numCols * 36}px, 90vw)`"
    >
    <template
      v-for="(row, r) in currentStep.cells"
      :key="r"
    >
      <div
        v-for="(cell, c) in row"
        :key="`${r}-${c}`"
        :class="[
          cellBg(cell),
          borderClass(r, c),
          'relative flex items-center justify-center transition-all duration-300',
        ]"
        :style="`aspect-ratio:1; font-size: clamp(10px, ${numCols === 9 ? '1.5' : '2'}vw, ${numCols === 9 ? '20' : '28'}px)`"
      >
        <!-- Value -->
        <span v-if="cell.value !== 0" :class="cellText(cell)">{{ cell.value }}</span>

        <!-- Candidates (pencil marks) -->
        <div
          v-else-if="cell.candidates && cell.candidates.length > 0"
          class="absolute inset-0 grid grid-cols-3 grid-rows-3 p-px"
        >
          <span
            v-for="n in 9"
            :key="n"
            class="flex items-center justify-center text-muted-foreground leading-none"
            :style="`font-size: clamp(5px, 0.9vw, 10px)`"
          >
            {{ cell.candidates.includes(n) ? n : '' }}
          </span>
        </div>
      </div>
    </template>
    </div>

    <!-- Caption -->
    <p class="text-sm text-center text-muted-foreground min-h-[2.5rem] px-2 transition-all duration-200">
      {{ currentStep.caption }}
    </p>

    <!-- Step controls -->
    <div class="flex items-center gap-4">
      <button
        :disabled="stepIndex === 0"
        class="px-4 py-1.5 rounded-lg border border-border text-sm font-medium transition-all
          disabled:opacity-30 disabled:cursor-not-allowed
          hover:enabled:border-primary/60 hover:enabled:bg-muted active:enabled:scale-95"
        @click="prev"
      >
        ← Anterior
      </button>

      <span class="text-xs text-muted-foreground tabular-nums">
        {{ stepIndex + 1 }} / {{ totalSteps }}
      </span>

      <button
        :disabled="stepIndex === totalSteps - 1"
        class="px-4 py-1.5 rounded-lg border border-border text-sm font-medium transition-all
          disabled:opacity-30 disabled:cursor-not-allowed
          hover:enabled:border-primary/60 hover:enabled:bg-muted active:enabled:scale-95"
        @click="next"
      >
        Próximo →
      </button>
    </div>
  </div>
</template>
