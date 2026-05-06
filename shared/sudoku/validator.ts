import type { Board, CellPosition } from '../types/sudoku'

/**
 * Returns true if placing `num` at (row, col) on `board` does not violate
 * Sudoku constraints. The cell at (row, col) is treated as empty regardless
 * of its current value.
 */
export function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    // Row check (skip the target cell itself)
    if (i !== col && board[row][i] === num) return false
    // Column check
    if (i !== row && board[i][col] === num) return false
  }

  const boxRow = 3 * Math.floor(row / 3)
  const boxCol = 3 * Math.floor(col / 3)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = boxRow + i
      const c = boxCol + j
      if ((r !== row || c !== col) && board[r][c] === num) return false
    }
  }

  return true
}

/**
 * Returns true if the current board state has no rule violations.
 * Empty cells (value 0) are ignored.
 */
export function isBoardValid(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const val = board[row][col]
      if (val === 0) continue
      if (!isValid(board, row, col, val)) return false
    }
  }
  return true
}

/**
 * Returns true only when the board is fully filled and has no violations.
 */
export function isSolved(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const val = board[row][col]
      if (val === 0) return false
      if (!isValid(board, row, col, val)) return false
    }
  }
  return true
}

/**
 * Returns all cells that conflict with the value at (row, col).
 * Returns an empty array if the cell is empty or has no conflicts.
 */
export function getConflicts(board: Board, row: number, col: number): CellPosition[] {
  const val = board[row][col]
  if (val === 0) return []

  const conflicts: CellPosition[] = []

  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i] === val) conflicts.push({ row, col: i })
    if (i !== row && board[i][col] === val) conflicts.push({ row: i, col })
  }

  const boxRow = 3 * Math.floor(row / 3)
  const boxCol = 3 * Math.floor(col / 3)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = boxRow + i
      const c = boxCol + j
      if ((r !== row || c !== col) && board[r][c] === val) {
        // Avoid duplicates with cells already added via row/col loops
        const alreadyAdded = conflicts.some((p) => p.row === r && p.col === c)
        if (!alreadyAdded) conflicts.push({ row: r, col: c })
      }
    }
  }

  return conflicts
}
