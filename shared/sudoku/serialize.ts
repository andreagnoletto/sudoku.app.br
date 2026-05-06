import type { Board } from '../types/sudoku'

/**
 * Serialise a 9×9 board to an 81-character string.
 * Each character is a digit 0–9 (0 = empty cell).
 */
export function boardToString(board: Board): string {
  return board.flat().join('')
}

/**
 * Parse an 81-character string back into a 9×9 board.
 * Throws a descriptive error if the input is malformed.
 */
export function stringToBoard(str: string): Board {
  if (str.length !== 81) {
    throw new Error(
      `Invalid board string: expected 81 characters, got ${str.length}.`,
    )
  }

  if (!/^[0-9]+$/.test(str)) {
    throw new Error(
      `Invalid board string: only digits 0–9 are allowed.`,
    )
  }

  const board: Board = []
  for (let r = 0; r < 9; r++) {
    board.push(str.slice(r * 9, r * 9 + 9).split('').map(Number))
  }

  return board
}
