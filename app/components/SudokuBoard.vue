<script setup lang="ts">
import { useSudokuGame } from '~/composables/useSudokuGame'

const game = useSudokuGame()
</script>

<template>
  <div
    role="grid"
    aria-label="Tabuleiro de Sudoku"
    class="grid grid-cols-9 w-full max-w-[min(90vw,520px)] aspect-square mx-auto border-2 border-foreground/80 rounded-sm shadow-lg"
  >
    <template v-for="r in 9" :key="r">
      <SudokuCell
        v-for="c in 9"
        :key="`${r - 1}-${c - 1}`"
        :value="game.board.value[r - 1][c - 1]"
        :notes="game.notes.value[r - 1][c - 1]"
        :is-clue="game.clues.value[r - 1][c - 1]"
        :is-selected="game.isSelected(r - 1, c - 1)"
        :is-highlighted-cross="game.isHighlightedCross(r - 1, c - 1)"
        :is-highlighted-block="game.isHighlightedBlock(r - 1, c - 1)"
        :is-same-digit="game.isSameDigit(r - 1, c - 1)"
        :is-conflict="game.isConflict(r - 1, c - 1)"
        :is-correct="game.isCorrect(r - 1, c - 1)"
        :row="r - 1"
        :col="c - 1"
        @select="game.selectCell"
      />
    </template>
  </div>
</template>
