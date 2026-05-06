import type { Board } from '../types/sudoku'
import { isValid, isBoardValid } from './validator'

/** Deep-clone a board so we never mutate the caller's copy */
function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

/**
 * Find the next empty cell (value === 0), scanning row-by-row.
 * Returns null when the board is full.
 */
function nextEmpty(board: Board): [number, number] | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return [r, c]
    }
  }
  return null
}

/**
 * Solve the board in-place via backtracking.
 * Returns true on success, false if no solution exists from this state.
 */
function backtrack(board: Board): boolean {
  const cell = nextEmpty(board)
  if (cell === null) return true // board is full → solved

  const [row, col] = cell

  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num
      if (backtrack(board)) return true
      board[row][col] = 0 // undo
    }
  }

  return false
}

/**
 * Returns the solved board or null if no solution exists.
 * The input board is never mutated.
 */
export function solve(board: Board): Board | null {
  // Fast-fail: if the board already has violations, no solution can exist
  if (!isBoardValid(board)) return null
  const clone = cloneBoard(board)
  const solved = backtrack(clone)
  return solved ? clone : null
}

/**
 * Counts how many distinct solutions exist, stopping as soon as `limit` is
 * reached. Useful for uniqueness checks: call with limit=2 and check === 1.
 *
 * The input board is never mutated.
 */
export function countSolutions(board: Board, limit = 2): number {
  // Fast-fail: pre-invalid boards provably have 0 solutions
  if (!isBoardValid(board)) return 0
  const clone = cloneBoard(board)
  let count = 0

  function bt(): void {
    if (count >= limit) return // early stop
    const cell = nextEmpty(clone)
    if (cell === null) {
      count++
      return
    }
    const [row, col] = cell
    for (let num = 1; num <= 9; num++) {
      if (count >= limit) return
      if (isValid(clone, row, col, num)) {
        clone[row][col] = num
        bt()
        clone[row][col] = 0
      }
    }
  }

  bt()
  return count
}
