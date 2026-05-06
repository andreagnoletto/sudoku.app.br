import { describe, it, expect } from 'vitest'
import { solve, countSolutions } from '../shared/sudoku/solver'
import type { Board } from '../shared/types/sudoku'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Classic easy puzzle (one solution) */
const easyPuzzle = (): Board => [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
]

const easyPuzzleSolution = (): Board => [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
]

/**
 * Locally-unsolvable board: cell (0,8) has no valid digit because
 * its row already contains 1–8 and the only remaining digit (9) is
 * blocked by the top-right 3×3 block. The board has no pre-existing
 * violations so isBoardValid() returns true — it's the placement
 * constraints that make it unsolvable, not a violated state.
 */
const locallyUnsolvableBoard = (): Board => {
  const b: Board = Array.from({ length: 9 }, () => Array(9).fill(0))
  // Row 0: digits 1-8 filled, position (0,8) left empty
  for (let c = 0; c < 8; c++) b[0][c] = c + 1 // [1,2,3,4,5,6,7,8,_]
  // Fill column 8 with 1-7 in rows 1-7 (blocks (0,8) from using 1-7)
  for (let r = 1; r <= 7; r++) b[r][8] = r
  // Place 9 in block [0..2][6..8] at (1,6) → blocks (0,8) from using 9
  b[1][6] = 9
  // Now (0,8) cannot be 1-8 (row) nor 9 (block) → no valid digit
  return b
}

/**
 * Pre-invalid board: already has a row conflict.
 * solve/countSolutions must detect this via isBoardValid and return fast.
 */
const preInvalidBoard = (): Board => {
  const b: Board = Array.from({ length: 9 }, () => Array(9).fill(0))
  b[0][0] = 1
  b[0][1] = 1 // duplicate 1 in row 0
  return b
}

/**
 * Multi-solution puzzle: only the first row is fixed.
 * With 72 empty cells this board provably has millions of valid completions,
 * so countSolutions(board, 2) must return ≥ 2 and do so quickly.
 */
const multiSolutionPuzzle = (): Board => [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
]

// ---------------------------------------------------------------------------
// solve
// ---------------------------------------------------------------------------

describe('solve', () => {
  it('solves a known easy puzzle correctly', () => {
    const result = solve(easyPuzzle())
    expect(result).toEqual(easyPuzzleSolution())
  })

  it('returns null for a locally unsolvable board (first empty cell has no valid digit)', () => {
    expect(solve(locallyUnsolvableBoard())).toBeNull()
  })

  it('returns null immediately for a pre-invalid board', () => {
    expect(solve(preInvalidBoard())).toBeNull()
  })

  it('does not mutate the input board', () => {
    const original = easyPuzzle()
    const copy = original.map((r) => [...r])
    solve(original)
    expect(original).toEqual(copy)
  })
})

// ---------------------------------------------------------------------------
// countSolutions
// ---------------------------------------------------------------------------

describe('countSolutions', () => {
  it('returns 1 for a well-formed puzzle', () => {
    expect(countSolutions(easyPuzzle(), 2)).toBe(1)
  })

  it('returns 0 for a pre-invalid board (fast via isBoardValid pre-check)', () => {
    expect(countSolutions(preInvalidBoard(), 2)).toBe(0)
  })

  it('returns ≥ 2 for an under-constrained puzzle (stops at limit)', () => {
    const count = countSolutions(multiSolutionPuzzle(), 2)
    expect(count).toBeGreaterThanOrEqual(2)
  })
})

