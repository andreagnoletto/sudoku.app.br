import { describe, it, expect } from 'vitest'
import { generateFullBoard, generatePuzzle } from '../shared/sudoku/generator'
import { isSolved, isBoardValid } from '../shared/sudoku/validator'
import { countSolutions } from '../shared/sudoku/solver'
import type { Difficulty } from '../shared/types/sudoku'

// ---------------------------------------------------------------------------
// generateFullBoard
// ---------------------------------------------------------------------------

describe('generateFullBoard', () => {
  it('returns a completely solved valid board', () => {
    const board = generateFullBoard()
    expect(isSolved(board)).toBe(true)
  })

  it('produces different boards on consecutive calls (randomness)', () => {
    const a = generateFullBoard()
    const b = generateFullBoard()
    // Serialise to compare — boards could theoretically match but probability is ~1/10^21
    const stringify = (bd: number[][]) => bd.flat().join('')
    expect(stringify(a)).not.toBe(stringify(b))
  })
})

// ---------------------------------------------------------------------------
// generatePuzzle
// ---------------------------------------------------------------------------

const CLUE_TARGETS: Record<Difficulty, [number, number]> = {
  easy: [38, 47],   // 40-45 ± tolerance
  medium: [30, 38], // 32-36 ± tolerance
  hard: [26, 33],   // 28-31 ± tolerance
  expert: [22, 29], // 24-27 ± tolerance
}

const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']

for (const difficulty of difficulties) {
  describe(`generatePuzzle (${difficulty})`, () => {
    it('returns a puzzle with exactly one solution', () => {
      const { puzzle } = generatePuzzle(difficulty)
      expect(countSolutions(puzzle, 2)).toBe(1)
    })

    it('returns a valid (no pre-existing violations) puzzle', () => {
      const { puzzle } = generatePuzzle(difficulty)
      expect(isBoardValid(puzzle)).toBe(true)
    })

    it('clue count falls within the expected range', () => {
      const { puzzle } = generatePuzzle(difficulty)
      const clues = puzzle.flat().filter((v) => v !== 0).length
      const [min, max] = CLUE_TARGETS[difficulty]
      expect(clues).toBeGreaterThanOrEqual(min)
      expect(clues).toBeLessThanOrEqual(max)
    })

    it('solution field is a fully solved valid board', () => {
      const { solution } = generatePuzzle(difficulty)
      expect(isSolved(solution)).toBe(true)
    })
  })
}
