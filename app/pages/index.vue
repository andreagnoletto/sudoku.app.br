<script setup lang="ts">
import type { Difficulty } from '~~/shared/types/sudoku'
import { useGameStore } from '~/stores/game'
import { useStatsStore } from '~/stores/stats'

const game = useGameStore()
const stats = useStatsStore()
const router = useRouter()

const selectedDifficulty = ref<Difficulty>('medium')
const hasActivePuzzle = computed(() => game.board.some(row => row.some(v => v !== 0)) && !game.isComplete)

async function startNew() {
  game.startGame(selectedDifficulty.value)
  stats.recordStart()
  await router.push('/jogo')
}

async function continueGame() {
  await router.push('/jogo')
}

onMounted(() => {
  game.loadSavedGame()
})
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-background text-foreground">
    <header class="text-center">
      <h1 class="text-4xl font-bold tracking-tight">Sudoku</h1>
      <p class="mt-1 text-muted-foreground text-sm">Jogue no seu navegador, sem instalar nada</p>
    </header>

    <section aria-label="Selecionar dificuldade" class="w-full max-w-sm flex flex-col gap-4">
      <h2 class="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">Dificuldade</h2>
      <DifficultyPicker v-model="selectedDifficulty" />
    </section>

    <div class="flex flex-col gap-3 w-full max-w-xs">
      <button
        class="w-full rounded-xl bg-primary py-3 text-base font-semibold text-primary-foreground shadow transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        @click="startNew"
      >
        Novo Jogo
      </button>

      <button
        v-if="hasActivePuzzle"
        class="w-full rounded-xl border border-border bg-card py-3 text-base font-semibold text-card-foreground shadow transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        @click="continueGame"
      >
        Continuar Partida
      </button>
    </div>

    <div class="flex gap-4">
      <NuxtLink
        to="/tutorial"
        class="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Como jogar →
      </NuxtLink>
      <NuxtLink
        to="/estatisticas"
        class="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Estatísticas →
      </NuxtLink>
    </div>
  </main>
</template>
