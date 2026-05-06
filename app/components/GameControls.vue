<script setup lang="ts">
defineProps<{
  notesMode: boolean
  canUndo: boolean
  canRedo: boolean
  hintsRemaining: number
}>()

const emit = defineEmits<{
  toggleNotes: []
  undo: []
  redo: []
  hint: []
  restart: []
  newGame: []
  print: []
}>()
</script>

<template>
  <div class="flex items-center justify-center gap-2 flex-wrap">
    <button
      class="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :class="
        notesMode
          ? 'bg-primary text-primary-foreground'
          : 'bg-card text-card-foreground border border-border hover:border-primary/60'
      "
      aria-label="Alternar modo de anotações"
      :aria-pressed="notesMode"
      @click="emit('toggleNotes')"
    >
      <span aria-hidden="true">✏️</span>
      <span>Notas</span>
    </button>

    <button
      class="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium border border-border bg-card text-card-foreground hover:border-primary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
      aria-label="Desfazer"
      :disabled="!canUndo"
      @click="emit('undo')"
    >
      <span aria-hidden="true">↩</span>
      <span>Desfazer</span>
    </button>

    <button
      class="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium border border-border bg-card text-card-foreground hover:border-primary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
      aria-label="Refazer"
      :disabled="!canRedo"
      @click="emit('redo')"
    >
      <span aria-hidden="true">↪</span>
      <span>Refazer</span>
    </button>

    <button
      class="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium border border-border bg-card text-card-foreground hover:border-primary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
      :aria-label="`Dica (${hintsRemaining} restantes)`"
      :disabled="hintsRemaining === 0"
      @click="emit('hint')"
    >
      <span aria-hidden="true">💡</span>
      <span>Dica ({{ hintsRemaining }})</span>
    </button>

    <button
      class="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium border border-border bg-card text-card-foreground hover:border-primary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Reiniciar puzzle"
      @click="emit('restart')"
    >
      <span aria-hidden="true">🔁</span>
      <span>Reiniciar</span>
    </button>

    <button
      class="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium border border-border bg-card text-card-foreground hover:border-primary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Novo jogo"
      @click="emit('newGame')"
    >
      <span aria-hidden="true">🔄</span>
      <span>Novo Jogo</span>
    </button>

    <button
      class="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium border border-border bg-card text-card-foreground hover:border-primary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Imprimir puzzle"
      @click="emit('print')"
    >
      <span aria-hidden="true">🖨️</span>
      <span>Imprimir</span>
    </button>
  </div>
</template>
