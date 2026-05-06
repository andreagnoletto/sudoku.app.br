# Wise Sudoku

A modern, fully client-side Sudoku game built with **Nuxt 4**, **TypeScript**, and **Tailwind CSS**. No backend, no third-party puzzle libraries — every puzzle is generated and validated in-browser.

## Features

### Gameplay
- **5 difficulty levels**: Super Fácil (50 clues), Fácil, Médio, Difícil, Expert
- **Pencil-mark notes**: toggle note mode and annotate candidate digits per cell
- **Cell locking**: correctly placed digits lock automatically, preventing accidental edits
- **Conflict highlighting**: rows, columns, and blocks with duplicate digits are flagged
- **Same-digit highlighting**: selecting a digit softly highlights all matching cells

### Feedback & Gamification
- **Star rating** (1–3 stars) based on elapsed time per difficulty
- **Animated toasts** for milestone events (first digit placed, puzzle solved, digits completed)
- **Completed-digit tracking**: digits fully placed across the board are marked done
- **Countdown timer** shown during play, frozen on completion

### Tutorial ("Como jogar")
Interactive step-by-step guide with annotated 9×9 mini-boards covering six techniques:
1. **Eliminação por Varredura** (Cross-Hatching)
2. **Candidato Único** (Naked Single)
3. **Único no Grupo** (Hidden Single)
4. **Notas de Lápis** (Pencil Marks)
5. **Par Oculto** (Hidden Pair)
6. **Encadeamento** (Chaining / Trial & Error)

Each section is an accordion with a `Próximo / Anterior` step navigator and color-coded cell highlights (azul = linha, roxo = coluna, âmbar = bloco, verde = solução, vermelho = conflito).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 4.4 (`app/` srcDir) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + HSL design tokens |
| State | Pinia |
| Testing | Vitest 4 + happy-dom |
| Runtime | 100% client-side, zero backend |

---

## Project Structure

```
app/
  pages/
    index.vue        # Home screen — difficulty picker + "Como jogar" link
    jogo.vue         # Main game page
    tutorial.vue     # Interactive tutorial (6 accordion sections)
  components/
    SudokuBoard.vue  # 9x9 grid container
    SudokuCell.vue   # Individual cell (digit, notes, highlights)
    NumberPad.vue    # Digit input pad
    GameControls.vue # Undo, erase, note-mode toggle
    GameToast.vue    # Milestone notification toasts
    DifficultyPicker.vue
    Timer.vue
    TutorialGrid.vue # Reusable annotated mini-grid for tutorial steps
  composables/
    useSudokuGame.ts # Central game logic composable
    useTimer.ts      # Elapsed-time tracking
  stores/
    sudoku.ts        # Pinia store (board state, notes, selection, history)
shared/
  sudoku/
    generator.ts     # Puzzle generator (backtracking + controlled removal)
    solver.ts        # Backtracking solver (used for generation & validation)
    validator.ts     # Row/col/block conflict detection
    serialize.ts     # Board ↔ flat-string serialization
    index.ts         # Re-exports
  types/
    sudoku.ts        # Shared TypeScript types (Board, Difficulty, CellState…)
tests/
  validator.spec.ts
  solver.spec.ts
  generator.spec.ts
  serialize.spec.ts
```

---

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

### Run tests

```bash
npm run test               # watch mode
npx vitest run             # single run (47 tests across 4 suites)
npx vitest run --reporter=verbose
```

### Build for production

```bash
npm run build
```

```bash
npm run preview    # preview production build locally
```
