import { defineStore } from 'pinia'
import { generatePuzzle } from '~~/shared/sudoku/generator'
import { isSolved, getConflicts } from '~~/shared/sudoku/validator'
import { boardToString, stringToBoard } from '~~/shared/sudoku/serialize'
import type { Difficulty, Move, GameState, CellPosition } from '~~/shared/types/sudoku'

const STORAGE_KEY = 'sudoku-game-state'
const MAX_HINTS = 3

// ---------------------------------------------------------------------------
// Default / empty state factory
// ---------------------------------------------------------------------------

function emptyState(): GameState {
  return {
    board: Array.from({ length: 9 }, () => Array(9).fill(0)),
    solution: Array.from({ length: 9 }, () => Array(9).fill(0)),
    clues: Array.from({ length: 9 }, () => Array(9).fill(false)),
    notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
    difficulty: 'easy',
    elapsed: 0,
    isPaused: false,
    errors: 0,
    hintsUsed: 0,
    historyIndex: -1,
    history: [],
    isComplete: false,
  }
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

type SerializedState = {
  board: string        // 81-char string
  solution: string     // 81-char string
  clues: boolean[][]
  notes: number[][][]
  difficulty: Difficulty
  elapsed: number
  errors: number
  hintsUsed: number
  historyIndex: number
  history: Move[]
  isComplete: boolean
}

function saveToStorage(state: GameState): void {
  if (typeof localStorage === 'undefined') return
  const serialized: SerializedState = {
    board: boardToString(state.board),
    solution: boardToString(state.solution),
    clues: state.clues,
    notes: state.notes.map((row) => row.map((cell) => [...cell])),
    difficulty: state.difficulty,
    elapsed: state.elapsed,
    errors: state.errors,
    hintsUsed: state.hintsUsed,
    historyIndex: state.historyIndex,
    history: state.history.map((m) => ({
      ...m,
      prevNotes: new Set(m.prevNotes),
      nextNotes: new Set(m.nextNotes),
    })),
    isComplete: state.isComplete,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized, (_k, v) =>
    v instanceof Set ? [...v] : v,
  ))
}

function loadFromStorage(): GameState | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as SerializedState & {
      history: Array<Omit<Move, 'prevNotes' | 'nextNotes'> & { prevNotes: number[]; nextNotes: number[] }>
    }

    const state = emptyState()
    state.board = stringToBoard(parsed.board)
    state.solution = stringToBoard(parsed.solution)
    state.clues = parsed.clues
    state.notes = parsed.notes.map((row) => row.map((cell) => cell))
    state.difficulty = parsed.difficulty
    state.elapsed = parsed.elapsed
    state.errors = parsed.errors
    state.hintsUsed = parsed.hintsUsed
    state.historyIndex = parsed.historyIndex
    state.history = parsed.history.map((m) => ({
      ...m,
      prevNotes: new Set(m.prevNotes),
      nextNotes: new Set(m.nextNotes),
    }))
    state.isComplete = parsed.isComplete
    return state
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGameStore = defineStore('game', {
  state: (): GameState & { isPaused: boolean; selectedCell: CellPosition | null; notesMode: boolean } => ({
    ...emptyState(),
    isPaused: false,
    selectedCell: null,
    notesMode: false,
  }),

  getters: {
    /** All positions currently in conflict with the selected cell */
    conflictPositions(state): CellPosition[] {
      if (!state.selectedCell) return []
      const { row, col } = state.selectedCell
      return getConflicts(state.board, row, col)
    },

    hasActivePuzzle(state): boolean {
      return state.board.flat().some((v) => v !== 0)
    },

    /** Set of digits 1–9 where all 9 placements match the solution */
    completedDigits(state): Set<number> {
      const result = new Set<number>()
      for (let d = 1; d <= 9; d++) {
        let count = 0
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (state.board[r][c] === d && state.solution[r][c] === d) count++
          }
        }
        if (count === 9) result.add(d)
      }
      return result
    },

    /** How many of each digit 1–9 still need to be placed (based on board occupancy) */
    remainingPerDigit(state): Record<number, number> {
      const placed: Record<number, number> = {}
      for (let d = 1; d <= 9; d++) placed[d] = 0
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const v = state.board[r][c]
          if (v >= 1 && v <= 9) placed[v]++
        }
      }
      const remaining: Record<number, number> = {}
      for (let d = 1; d <= 9; d++) remaining[d] = 9 - placed[d]
      return remaining
    },
  },

  actions: {
    // ------------------------------------------------------------------
    // Game lifecycle
    // ------------------------------------------------------------------

    startGame(difficulty: Difficulty) {
      const { puzzle, solution } = generatePuzzle(difficulty)

      const clues: boolean[][] = puzzle.map((row) => row.map((v) => v !== 0))
      const notes: number[][][] = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => []),
      )

      this.$patch({
        board: puzzle.map((r) => [...r]),
        solution: solution.map((r) => [...r]),
        clues,
        notes,
        difficulty,
        elapsed: 0,
        isPaused: false,
        errors: 0,
        hintsUsed: 0,
        historyIndex: -1,
        history: [],
        isComplete: false,
        selectedCell: null,
      })

      this.persist()
    },

    loadSavedGame(): boolean {
      const saved = loadFromStorage()
      if (!saved) return false
      this.$patch({ ...saved, selectedCell: null, isPaused: false })
      return true
    },

    clearSavedGame() {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    /** Reset the board to its original clues (same puzzle, fresh start) */
    restart() {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!this.clues[r][c]) {
            this.board[r][c] = 0
            this.notes[r][c] = []
          }
        }
      }
      this.errors = 0
      this.elapsed = 0
      this.historyIndex = -1
      this.history = []
      this.isComplete = false
      this.isPaused = false
      this.persist()
    },

    // ------------------------------------------------------------------
    // Cell interaction
    // ------------------------------------------------------------------

    selectCell(row: number, col: number) {
      this.selectedCell = { row, col }
    },

    clearSelection() {
      this.selectedCell = null
    },

    /**
     * Place or erase a digit in the selected cell.
     * Clue cells are protected. Returns false when the cell is a clue.
     */
    placeDigit(num: number): boolean {
      if (!this.selectedCell) return false
      const { row, col } = this.selectedCell
      if (this.clues[row][col]) return false
      // Block overwriting a correctly placed digit
      if (this.board[row][col] !== 0 && this.board[row][col] === this.solution[row][col]) return false

      const prevValue = this.board[row][col]
      const prevNotes = new Set(this.notes[row][col])

      // DECISION: placing a digit clears all notes for that cell
      this.board[row][col] = num
      this.notes[row][col] = []
      const nextNotes = new Set<number>()

      this.pushHistory({ row, col, prevValue, nextValue: num, prevNotes, nextNotes })

      if (num !== 0 && num !== this.solution[row][col]) {
        this.errors++
      }

      this.checkCompletion()
      this.persist()
      return true
    },

    /**
     * Toggle a candidate note in the selected cell.
     * Ignored when the cell already has a placed digit or is a clue.
     */
    toggleNote(num: number): boolean {
      if (!this.selectedCell) return false
      const { row, col } = this.selectedCell
      if (this.clues[row][col]) return false
      if (this.board[row][col] !== 0) return false

      const prevNotes = new Set(this.notes[row][col])
      const current = this.notes[row][col]
      const idx = current.indexOf(num)
      if (idx === -1) {
        current.push(num)
      } else {
        current.splice(idx, 1)
      }
      const nextNotes = new Set(this.notes[row][col])

      this.pushHistory({
        row,
        col,
        prevValue: 0,
        nextValue: 0,
        prevNotes,
        nextNotes,
      })

      this.persist()
      return true
    },

    // ------------------------------------------------------------------
    // Hint
    // ------------------------------------------------------------------

    useHint(): boolean {
      if (!this.selectedCell) return false
      if (this.hintsUsed >= MAX_HINTS) return false
      const { row, col } = this.selectedCell
      if (this.clues[row][col]) return false
      if (this.board[row][col] === this.solution[row][col]) return false

      const prev = this.board[row][col]
      const prevNotes = new Set(this.notes[row][col])
      const correct = this.solution[row][col]

      this.board[row][col] = correct
      this.notes[row][col] = []
      this.hintsUsed++

      this.pushHistory({
        row,
        col,
        prevValue: prev,
        nextValue: correct,
        prevNotes,
        nextNotes: new Set<number>(),
      })

      this.checkCompletion()
      this.persist()
      return true
    },

    // ------------------------------------------------------------------
    // Undo / Redo
    // ------------------------------------------------------------------

    undo() {
      if (this.historyIndex < 0) return
      const move = this.history[this.historyIndex]
      this.historyIndex--

      this.board[move.row][move.col] = move.prevValue
      this.notes[move.row][move.col] = [...move.prevNotes]

      this.persist()
    },

    redo() {
      if (this.historyIndex >= this.history.length - 1) return
      this.historyIndex++
      const move = this.history[this.historyIndex]

      this.board[move.row][move.col] = move.nextValue
      this.notes[move.row][move.col] = [...move.nextNotes]

      this.persist()
    },

    // ------------------------------------------------------------------
    // Timer
    // ------------------------------------------------------------------

    tick() {
      if (!this.isPaused && !this.isComplete) {
        this.elapsed++
      }
    },

    togglePause() {
      this.isPaused = !this.isPaused
    },

    toggleNotesMode() {
      this.notesMode = !this.notesMode
    },

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    pushHistory(move: Move) {
      // Discard any redo history when a new move is made
      this.history = this.history.slice(0, this.historyIndex + 1)
      this.history.push(move)
      this.historyIndex = this.history.length - 1
    },

    checkCompletion() {
      if (isSolved(this.board)) {
        this.isComplete = true
        this.isPaused = false
      }
    },

    persist() {
      saveToStorage(this.$state as unknown as GameState)
    },
  },
})
