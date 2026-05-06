import { describe, it, expect } from 'vitest'
import {
  isValid,
  isBoardValid,
  isSolved,
  getConflicts,
} from '../shared/sudoku/validator'
import type { Board } from '../shared/types/sudoku'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A completely empty board */
const emptyBoard = (): Board =>
  Array.from({ length: 9 }, () => Array(9).fill(0))

/** A fully solved, valid board */
const solvedBoard = (): Board => [
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

// A partial board with the top-left 3×3 block partially solved
const partialBoard = (): Board => {
  const b = emptyBoard()
  b[0][0] = 5
  b[0][1] = 3
  b[1][0] = 6
  b[2][0] = 1
  return b
}

// ---------------------------------------------------------------------------
// isValid
// ---------------------------------------------------------------------------

describe('isValid', () => {
  it('rejects a number already in the same row', () => {
    const b = emptyBoard()
    b[0][0] = 5
    expect(isValid(b, 0, 4, 5)).toBe(false)
  })

  it('rejects a number already in the same column', () => {
    const b = emptyBoard()
    b[3][2] = 7
    expect(isValid(b, 7, 2, 7)).toBe(false)
  })

  it('rejects a number already in the same 3×3 block', () => {
    const b = emptyBoard()
    b[0][0] = 9
    // Cell (2,2) is in the same top-left block
    expect(isValid(b, 2, 2, 9)).toBe(false)
  })

  it('accepts a number that violates none of the constraints', () => {
    const b = partialBoard()
    // row 0 has 5,3 → digit 7 is not in row 0, col 3, or top-left block
    expect(isValid(b, 0, 3, 7)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// isBoardValid
// ---------------------------------------------------------------------------

describe('isBoardValid', () => {
  it('accepts an empty board', () => {
    expect(isBoardValid(emptyBoard())).toBe(true)
  })

  it('accepts a partially filled board without conflicts', () => {
    expect(isBoardValid(partialBoard())).toBe(true)
  })

  it('rejects a board with a row conflict', () => {
    const b = emptyBoard()
    b[0][0] = 5
    b[0][5] = 5 // duplicate in row 0
    expect(isBoardValid(b)).toBe(false)
  })

  it('rejects a board with a column conflict', () => {
    const b = emptyBoard()
    b[0][0] = 3
    b[8][0] = 3 // duplicate in col 0
    expect(isBoardValid(b)).toBe(false)
  })

  it('rejects a board with a block conflict', () => {
    const b = emptyBoard()
    b[0][0] = 8
    b[2][2] = 8 // duplicate in top-left block
    expect(isBoardValid(b)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isSolved
// ---------------------------------------------------------------------------

describe('isSolved', () => {
  it('returns true for a complete and valid board', () => {
    expect(isSolved(solvedBoard())).toBe(true)
  })

  it('returns false for an empty board', () => {
    expect(isSolved(emptyBoard())).toBe(false)
  })

  it('returns false for a board with a violation', () => {
    const b = solvedBoard()
    b[0][0] = b[0][1] // duplicate in row → invalid
    expect(isSolved(b)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getConflicts
// ---------------------------------------------------------------------------

describe('getConflicts', () => {
  it('returns coordinates of all conflicting cells', () => {
    const b = emptyBoard()
    b[0][0] = 5
    b[0][3] = 5 // same row conflict
    b[4][0] = 5 // same col conflict
    b[1][1] = 5 // same block conflict

    const conflicts = getConflicts(b, 0, 0)
    const keys = conflicts.map(({ row, col }) => `${row},${col}`)

    expect(keys).toContain('0,3')
    expect(keys).toContain('4,0')
    expect(keys).toContain('1,1')
    // The cell itself must not be in the list
    expect(keys).not.toContain('0,0')
  })

  it('returns empty array when no conflicts exist', () => {
    const b = emptyBoard()
    b[0][0] = 5
    expect(getConflicts(b, 0, 0)).toHaveLength(0)
  })
})
