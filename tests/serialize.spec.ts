import { describe, it, expect } from 'vitest'
import { boardToString, stringToBoard } from '../shared/sudoku/serialize'
import type { Board } from '../shared/types/sudoku'

const solvedBoard: Board = [
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

const partialBoard: Board = [
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

describe('boardToString / stringToBoard', () => {
  it('round-trips: stringToBoard(boardToString(b)) deep-equals b (solved)', () => {
    expect(stringToBoard(boardToString(solvedBoard))).toEqual(solvedBoard)
  })

  it('round-trips: stringToBoard(boardToString(b)) deep-equals b (partial)', () => {
    expect(stringToBoard(boardToString(partialBoard))).toEqual(partialBoard)
  })

  it('boardToString produces exactly 81 characters', () => {
    expect(boardToString(solvedBoard)).toHaveLength(81)
  })

  it('boardToString uses "0" for empty cells', () => {
    const str = boardToString(partialBoard)
    // row 0 position 2 is empty, so character at index 2 should be '0'
    expect(str[2]).toBe('0')
  })
})

describe('stringToBoard validation', () => {
  it('throws for strings shorter than 81 characters', () => {
    expect(() => stringToBoard('12345')).toThrow()
  })

  it('throws for strings longer than 81 characters', () => {
    expect(() => stringToBoard('1'.repeat(82))).toThrow()
  })

  it('throws for strings containing characters outside 0–9', () => {
    const bad = 'a'.repeat(81)
    expect(() => stringToBoard(bad)).toThrow()
  })

  it('accepts a string of all zeros (empty board)', () => {
    const str = '0'.repeat(81)
    const board = stringToBoard(str)
    expect(board.flat().every((v) => v === 0)).toBe(true)
  })
})
