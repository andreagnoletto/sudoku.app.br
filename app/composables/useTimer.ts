import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from '~/stores/game'

/**
 * Manages the game timer. Call this once in the game page.
 * Automatically pauses when the tab is hidden.
 */
export function useTimer() {
  const store = useGameStore()
  let interval: ReturnType<typeof setInterval> | null = null

  function startTicking() {
    if (interval) return
    interval = setInterval(() => store.tick(), 1000)
  }

  function stopTicking() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      store.isPaused = true
      stopTicking()
    } else {
      if (!store.isComplete) {
        store.isPaused = false
        startTicking()
      }
    }
  }

  onMounted(() => {
    if (!store.isComplete) startTicking()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    stopTicking()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    toggle() {
      store.togglePause()
      if (store.isPaused) stopTicking()
      else startTicking()
    },
  }
}
