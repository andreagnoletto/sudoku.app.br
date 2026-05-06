import { defineStore } from 'pinia'
import type { Difficulty } from '~~/shared/types/sudoku'

const STATS_KEY = 'sudoku-stats'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatsState {
  gamesCompleted: number
  gamesStarted: number
  totalTime: number          // sum of elapsed seconds for all completed games
  currentStreak: number      // consecutive days with ≥1 completion
  longestStreak: number
  lastCompletedDate: string | null  // 'YYYY-MM-DD'
  bestTimes: Partial<Record<Difficulty, number>>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function emptyStats(): StatsState {
  return {
    gamesCompleted: 0,
    gamesStarted: 0,
    totalTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    bestTimes: {},
  }
}

function loadStats(): StatsState {
  if (typeof localStorage === 'undefined') return emptyStats()
  const raw = localStorage.getItem(STATS_KEY)
  if (!raw) return emptyStats()
  try {
    return { ...emptyStats(), ...(JSON.parse(raw) as Partial<StatsState>) }
  } catch {
    return emptyStats()
  }
}

function saveStats(state: StatsState): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STATS_KEY, JSON.stringify(state))
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useStatsStore = defineStore('stats', {
  state: (): StatsState => loadStats(),

  getters: {
    avgTime(state): number {
      return state.gamesCompleted > 0
        ? Math.round(state.totalTime / state.gamesCompleted)
        : 0
    },
    winRate(state): number {
      return state.gamesStarted > 0
        ? Math.round((state.gamesCompleted / state.gamesStarted) * 100)
        : 0
    },
  },

  actions: {
    recordStart() {
      this.gamesStarted++
      saveStats(this.$state)
    },

    recordCompletion(difficulty: Difficulty, elapsed: number) {
      this.gamesCompleted++
      this.totalTime += elapsed

      // Best time per difficulty
      const best = this.bestTimes[difficulty]
      if (best === undefined || elapsed < best) {
        this.bestTimes[difficulty] = elapsed
      }

      // Streak (per-day, one count per day)
      const today = todayStr()
      if (this.lastCompletedDate === today) {
        // Already credited today — don't change streak
      } else if (this.lastCompletedDate === yesterdayStr()) {
        this.currentStreak++
      } else {
        this.currentStreak = 1
      }
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak
      }
      this.lastCompletedDate = today

      saveStats(this.$state)
    },
  },
})
