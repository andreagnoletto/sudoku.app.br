import type { Board, Difficulty } from '../types/sudoku'
import { isValid } from './validator'
import { countSolutions } from './solver'

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0))
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

/** Fisher–Yates in-place shuffle — pure, no side effects on external state */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Fill a 3×3 block starting at (boxRow, boxCol) with digits 1–9
 * in random order.  Works because the three diagonal blocks are
 * mutually independent of each other.
 */
function fillBlock(board: Board, boxRow: number, boxCol: number): void {
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
  let idx = 0
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      board[boxRow + r][boxCol + c] = digits[idx++]
    }
  }
}

/**
 * Backtracking fill with randomised digit order.
 * Returns true when the board is fully and validly filled.
 */
function fillBoard(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue

      const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
      for (const num of digits) {
        if (isValid(board, r, c, num)) {
          board[r][c] = num
          if (fillBoard(board)) return true
          board[r][c] = 0
        }
      }
      return false // no digit worked → backtrack
    }
  }
  return true // all cells filled
}

// ---------------------------------------------------------------------------
// Clue targets per difficulty
// ---------------------------------------------------------------------------

/** Number of cells to KEEP (clues) per difficulty level */
function targetClues(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'super-easy':
      return 50
    case 'easy':
      return 42
    case 'medium':
      return 34
    case 'hard':
      return 30
    case 'expert':
      return 26
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a completely filled, valid Sudoku board using:
 * 1. Pre-fill the three diagonal 3×3 blocks (mutually independent).
 * 2. Use randomised backtracking to complete the rest.
 */
export function generateFullBoard(): Board {
  const board = createEmptyBoard()

  // Diagonal blocks are independent — fill them first for efficiency
  fillBlock(board, 0, 0)
  fillBlock(board, 3, 3)
  fillBlock(board, 6, 6)

  // Complete remaining cells via randomised backtracking
  fillBoard(board)

  return board
}

/**
 * Generate a Sudoku puzzle from a full board by removing cells one at a
 * time while preserving a unique solution.
 *
 * Returns:
 *  - `puzzle`   : the board shown to the player (0 = empty)
 *  - `solution` : the complete solved board (never rendered to DOM)
 */
export function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const solution = generateFullBoard()
  const puzzle = cloneBoard(solution)

  const target = targetClues(difficulty)
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => i))

  let cluesRemaining = 81

  for (const pos of positions) {
    if (cluesRemaining <= target) break

    const r = Math.floor(pos / 9)
    const c = pos % 9

    const backup = puzzle[r][c]
    puzzle[r][c] = 0

    // Verify the puzzle still has exactly one solution
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[r][c] = backup // restore — removing this cell broke uniqueness
    } else {
      cluesRemaining--
    }
  }

  return { puzzle, solution }
}
