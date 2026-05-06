<script setup lang="ts">
import { useStatsStore } from '~/stores/stats'
import type { Difficulty } from '~~/shared/types/sudoku'

const stats = useStatsStore()

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const difficulties: { key: Difficulty; label: string }[] = [
  { key: 'super-easy', label: 'Super Fácil' },
  { key: 'easy',       label: 'Fácil' },
  { key: 'medium',     label: 'Médio' },
  { key: 'hard',       label: 'Difícil' },
  { key: 'expert',     label: 'Expert' },
]
</script>

<template>
  <main class="min-h-screen flex flex-col items-center gap-8 p-6 bg-background text-foreground">
    <header class="w-full max-w-sm flex items-center gap-4">
      <NuxtLink to="/" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        ← Menu
      </NuxtLink>
      <h1 class="text-2xl font-bold">Estatísticas</h1>
    </header>

    <!-- Summary cards -->
    <section class="w-full max-w-sm grid grid-cols-2 gap-3">
      <div class="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
        <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Concluídos</span>
        <span class="text-3xl font-bold tabular-nums">{{ stats.gamesCompleted }}</span>
      </div>
      <div class="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
        <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Taxa de vitória</span>
        <span class="text-3xl font-bold tabular-nums">{{ stats.winRate }}%</span>
      </div>
      <div class="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
        <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tempo médio</span>
        <span class="text-3xl font-bold tabular-nums font-mono">
          {{ stats.gamesCompleted > 0 ? fmt(stats.avgTime) : '--:--' }}
        </span>
      </div>
      <div class="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
        <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sequência atual</span>
        <span class="text-3xl font-bold tabular-nums">{{ stats.currentStreak }}</span>
        <span class="text-xs text-muted-foreground">melhor: {{ stats.longestStreak }}</span>
      </div>
    </section>

    <!-- Best times -->
    <section class="w-full max-w-sm flex flex-col gap-3">
      <h2 class="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Melhores Tempos</h2>
      <div class="rounded-xl border border-border bg-card divide-y divide-border">
        <div
          v-for="d in difficulties"
          :key="d.key"
          class="flex items-center justify-between px-4 py-3"
        >
          <span class="font-medium">{{ d.label }}</span>
          <span class="font-mono text-sm tabular-nums text-muted-foreground">
            {{ stats.bestTimes[d.key] !== undefined ? fmt(stats.bestTimes[d.key]!) : '—' }}
          </span>
        </div>
      </div>
    </section>

    <!-- Empty state -->
    <p
      v-if="stats.gamesCompleted === 0"
      class="text-muted-foreground text-sm text-center"
    >
      Complete seu primeiro puzzle para ver as estatísticas!
    </p>
  </main>
</template>
