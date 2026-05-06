import { computed } from 'vue'
import { useGameStore } from '~/stores/game'
import type { Difficulty } from '~~/shared/types/sudoku'

/**
 * Reactive facade consumed by UI components.
 * All business logic lives in the Pinia store or shared/sudoku/*.
 */
export function useSudokuGame() {
  const store = useGameStore()

  // ------------------------------------------------------------------
  // Derived UI data
  // ------------------------------------------------------------------

  /** Elapsed time formatted as MM:SS */
  const formattedTime = computed(() => {
    const m = Math.floor(store.elapsed / 60)
    const s = store.elapsed % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  /** Set of conflict positions expressed as "row,col" keys for fast lookup */
  const conflictKeys = computed(() =>
    new Set(store.conflictPositions.map((p) => `${p.row},${p.col}`)),
  )

  function isConflict(row: number, col: number) {
    return conflictKeys.value.has(`${row},${col}`)
  }

  function isSelected(row: number, col: number) {
    return store.selectedCell?.row === row && store.selectedCell?.col === col
  }

  function isHighlightedCross(row: number, col: number) {
    if (!store.selectedCell) return false
    const { row: sr, col: sc } = store.selectedCell
    return row === sr || col === sc
  }

  function isHighlightedBlock(row: number, col: number) {
    if (!store.selectedCell) return false
    const { row: sr, col: sc } = store.selectedCell
    // Same block but NOT on the cross (row or col)
    return (
      Math.floor(row / 3) === Math.floor(sr / 3) &&
      Math.floor(col / 3) === Math.floor(sc / 3) &&
      row !== sr &&
      col !== sc
    )
  }

  function isSameDigit(row: number, col: number) {
    if (!store.selectedCell) return false
    const { row: sr, col: sc } = store.selectedCell
    const selVal = store.board[sr][sc]
    if (selVal === 0) return false
    return store.board[row][col] === selVal
  }

  function isCorrect(row: number, col: number) {
    const v = store.board[row][col]
    return v !== 0 && v === store.solution[row][col]
  }

  // ------------------------------------------------------------------
  // Actions — thin wrappers so components never import the store directly
  // ------------------------------------------------------------------

  function startGame(difficulty: Difficulty) {
    store.startGame(difficulty)
  }

  function loadSaved() {
    return store.loadSavedGame()
  }

  function selectCell(row: number, col: number) {
    store.selectCell(row, col)
  }

  function placeDigit(num: number) {
    store.placeDigit(num)
  }

  function toggleNote(num: number) {
    store.toggleNote(num)
  }

  function erase() {
    store.placeDigit(0)
  }

  function undo() {
    store.undo()
  }

  function redo() {
    store.redo()
  }

  function useHint() {
    return store.useHint()
  }

  return {
    // State (read-only projections)
    board: computed(() => store.board),
    notes: computed(() => store.notes),
    clues: computed(() => store.clues),
    selectedCell: computed(() => store.selectedCell),
    difficulty: computed(() => store.difficulty),
    elapsed: computed(() => store.elapsed),
    formattedTime,
    isPaused: computed(() => store.isPaused),
    errors: computed(() => store.errors),
    hintsUsed: computed(() => store.hintsUsed),
    isComplete: computed(() => store.isComplete),
    hasActivePuzzle: computed(() => store.hasActivePuzzle),
    canUndo: computed(() => store.historyIndex >= 0),
    canRedo: computed(() => store.historyIndex < store.history.length - 1),
    hintsRemaining: computed(() => 3 - store.hintsUsed),

    // Derivations
    isConflict,
    isSelected,
    isHighlightedCross,
    isHighlightedBlock,
    isSameDigit,
    isCorrect,
    completedDigits: computed(() => store.completedDigits),
    remainingPerDigit: computed(() => store.remainingPerDigit),

    // Actions
    startGame,
    loadSaved,
    selectCell,
    placeDigit,
    notesMode: computed(() => store.notesMode),
    toggleNote,
    erase,
    undo,
    redo,
    useHint,
    toggleNotesMode: () => store.toggleNotesMode(),
    clearSavedGame: () => store.clearSavedGame(),
    restart: () => store.restart(),
  }
}
