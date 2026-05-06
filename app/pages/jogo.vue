<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useStatsStore } from '~/stores/stats'
import { useSudokuGame } from '~/composables/useSudokuGame'
import { useTimer } from '~/composables/useTimer'

const game = useGameStore()
const stats = useStatsStore()
const {
  formattedTime, isPaused, notesMode, isComplete,
  canUndo, canRedo, hintsRemaining,
  toggleNotesMode,
  completedDigits, remainingPerDigit,
} = useSudokuGame()

useTimer()

const router = useRouter()

onMounted(() => {
  if (game.board.every(row => row.every(v => v === 0))) {
    router.replace('/')
  }
})

// Track game start for stats (only for fresh games, not resumed ones)
const _startTracked = ref(false)
watch(() => game.isComplete, (complete) => {
  if (complete && !_startTracked.value) {
    _startTracked.value = true
    stats.recordCompletion(game.difficulty, game.elapsed)
  }
})

// ── Keyboard navigation ───────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (isComplete.value) return

  const sel = game.selectedCell
  const row = sel?.row ?? null
  const col = sel?.col ?? null

  const arrowMoves: Record<string, [number, number]> = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  }

  if (e.key in arrowMoves) {
    e.preventDefault()
    const [dr, dc] = arrowMoves[e.key]!
    const nextRow = Math.min(8, Math.max(0, (row ?? 0) + dr))
    const nextCol = Math.min(8, Math.max(0, (col ?? 0) + dc))
    game.selectCell(nextRow, nextCol)
    return
  }

  if (e.key >= '1' && e.key <= '9') {
    if (notesMode.value) game.toggleNote(Number(e.key))
    else game.placeDigit(Number(e.key))
    return
  }

  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    game.placeDigit(0)
    return
  }

  if (e.key.toLowerCase() === 'n') {
    toggleNotesMode()
    return
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    if (e.shiftKey) game.redo()
    else game.undo()
    return
  }
}

// ── Victory modal ─────────────────────────────────────────────────────────
function goHome() {
  router.push('/')
}

function restartSameDifficulty() {
  game.startGame(game.difficulty)
}

function printPuzzle() {
  window.print()
}

// ── Toast system ─────────────────────────────────────────────────────────
interface Toast { id: number; message: string }
const toasts = ref<Toast[]>([])
let toastId = 0

function addToast(message: string) {
  const id = ++toastId
  toasts.value.push({ id, message })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 2500)
}

const completedList = computed(() => [...completedDigits.value].sort((a, b) => a - b))
watch(completedList, (now, prev) => {
  for (const d of now) {
    if (!prev.includes(d)) addToast(`Todos os ${d}s encontrados! 🎉`)
  }
})

// ── Star rating ───────────────────────────────────────────────────────────
const difficultyLabels: Record<string, string> = {
  'super-easy': 'Super Fácil',
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
  expert: 'Expert',
}

function starRating(elapsed: number, difficulty: string): number {
  const thresholds: Record<string, [number, number]> = {
    'super-easy': [10 * 60, 20 * 60],
    easy:   [5  * 60, 10 * 60],
    medium: [10 * 60, 20 * 60],
    hard:   [15 * 60, 30 * 60],
    expert: [20 * 60, 40 * 60],
  }
  const [gold, silver] = thresholds[difficulty] ?? [10 * 60, 20 * 60]
  return elapsed <= gold ? 3 : elapsed <= silver ? 2 : 1
}

async function shareResult() {
  const stars = starRating(game.elapsed, game.difficulty)
  const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars)
  const diff = difficultyLabels[game.difficulty] ?? game.difficulty
  const errStr = game.errors === 0 ? 'sem erros' : `${game.errors} erro${game.errors !== 1 ? 's' : ''}`
  const text = `Resolvi o Sudoku ${diff} em ${formattedTime.value} ${errStr}! ${starStr}\nJogue também: ${location.href}`

  try {
    if (navigator.share) {
      await navigator.share({ title: 'Wise Sudoku', text })
    } else {
      await navigator.clipboard.writeText(text)
      addToast('Resultado copiado para a área de transferência! 📋')
    }
  } catch {
    // User cancelled or clipboard unavailable — silent fail
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col" @keydown="onKeydown" tabindex="-1">
    <!-- Header -->
    <header class="no-print flex items-center justify-between px-4 py-3 border-b border-border">
      <NuxtLink to="/" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        ← Menu
      </NuxtLink>
      <h1 class="text-lg font-bold">Sudoku</h1>
      <Timer
        :time="formattedTime"
        :is-paused="isPaused"
        @toggle-pause="game.togglePause()"
      />
    </header>

    <!-- Game area -->
    <main class="flex flex-col items-center gap-4 flex-1 p-4">
      <!-- Paused overlay -->
      <div
        v-if="isPaused"
        class="flex flex-col items-center justify-center gap-4 flex-1"
        aria-live="polite"
      >
        <p class="text-2xl font-bold">Jogo pausado</p>
        <button
          class="rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          @click="game.togglePause()"
        >
          Retomar
        </button>
      </div>

      <template v-else>
        <SudokuBoard />

        <NumberPad
          class="no-print"
          :completed-digits="completedDigits"
          :remaining-counts="remainingPerDigit"
          @digit="(n) => notesMode ? game.toggleNote(n) : game.placeDigit(n)"
          @erase="game.placeDigit(0)"
        />

        <GameControls
          class="no-print"
          :notes-mode="notesMode"
          :can-undo="canUndo"
          :can-redo="canRedo"
          :hints-remaining="hintsRemaining"
          @toggle-notes="toggleNotesMode()"
          @undo="game.undo()"
          @redo="game.redo()"
          @hint="game.useHint()"
          @restart="game.restart()"
          @new-game="goHome()"
          @print="printPuzzle()"
        />
      </template>
    </main>

    <!-- Victory modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isComplete"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Parabéns! Puzzle concluído"
        >
          <div class="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl flex flex-col items-center gap-6 text-center">
            <p class="text-5xl" aria-hidden="true">🎉</p>
            <h2 class="text-2xl font-bold">Parabéns!</h2>
            <p class="text-muted-foreground">
              Você completou o puzzle em
              <strong class="text-foreground">{{ formattedTime }}</strong>
              com
              <strong class="text-foreground">{{ game.errors }}</strong>
              erro{{ game.errors !== 1 ? 's' : '' }}.
            </p>
            <div
              class="text-3xl tracking-widest"
              :aria-label="`${starRating(game.elapsed, game.difficulty)} estrela${starRating(game.elapsed, game.difficulty) !== 1 ? 's' : ''}`"
            >
              <span v-for="i in 3" :key="i">{{ i <= starRating(game.elapsed, game.difficulty) ? '⭐' : '☆' }}</span>
            </div>
            <div class="flex flex-col gap-3 w-full">
              <button
                class="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                @click="restartSameDifficulty"
              >
                Jogar Novamente
              </button>
              <button
                class="w-full rounded-xl border border-border bg-card py-3 font-semibold hover:border-primary/60 transition-colors"
                @click="shareResult"
              >
                🔗 Compartilhar resultado
              </button>
              <button
                class="w-full rounded-xl border border-border bg-background py-3 font-semibold hover:border-primary/60 transition-colors"
                @click="goHome"
              >
                Menu Principal
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <GameToast :toasts="toasts" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
