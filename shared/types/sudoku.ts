/** 9×9 grid: 0 = empty cell, 1–9 = filled digit */
export type Board = number[][]

export type Difficulty = 'super-easy' | 'easy' | 'medium' | 'hard' | 'expert'

/** A single cell's position */
export interface CellPosition {
  row: number
  col: number
}

/** Runtime state for one cell as rendered by the UI */
export interface Cell {
  value: number
  /** True when part of the original puzzle (cannot be changed) */
  isClue: boolean
  /** Candidate annotations entered by the user (pencil marks) */
  notes: Set<number>
}

/** A recorded move for undo/redo */
export interface Move {
  row: number
  col: number
  prevValue: number
  nextValue: number
  prevNotes: Set<number>
  nextNotes: Set<number>
}

/** Full game state persisted to localStorage */
export interface GameState {
  /** Puzzle cells including user input (0 = empty) */
  board: number[][]
  /** The complete solution (never exposed to DOM) */
  solution: number[][]
  /** Mask of which cells are original clues */
  clues: boolean[][]
  /** Pencil-mark notes per cell */
  notes: number[][][]
  difficulty: Difficulty
  /** Elapsed seconds */
  elapsed: number
  isPaused: boolean
  errors: number
  hintsUsed: number
  /** Index pointing to the "current" position in history */
  historyIndex: number
  history: Move[]
  isComplete: boolean
}
