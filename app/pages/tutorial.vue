<script setup lang="ts">
import type { TutorialStep } from '~/components/TutorialGrid.vue'

// ── Helpers ──────────────────────────────────────────────────────────────────
type H = 'row' | 'col' | 'block' | 'target' | 'solved' | 'conflict' | 'eliminate'
function c(value: number, isClue = false, highlight?: H, candidates?: number[]) {
  return { value, isClue, highlight, candidates }
}
const _ = (hl?: H, cands?: number[]) => c(0, false, hl, cands)

// ── Section 1: Cross-Hatching ─────────────────────────────────────────────
// 9×9 grid. Finding where 7 goes in the middle-right block (rows 3-5, cols 6-8).
// Eliminators: row 3 (7 at col 1), row 4 (7 at col 4), col 6 (7 at row 1), col 7 (7 at row 8).
// Only cell (row 5, col 8) survives.
const crossHatching: TutorialStep[] = [
  {
    caption: 'O bloco central-direito (azul) ainda não tem 7. Onde ele pode entrar?',
    cells: [
      [_(), _(), _(),   _(), _(), _(),   _(), _(), _()],
      [_(), _(), _(),   _(), _(), _(),   c(7,true), _(), _()],
      [_(), _(), _(),   _(), _(), _(),   _(), _(), _()],

      [_(), c(7,true), _(),   _(), _(), _(),   _('block'), _('block'), _('block')],
      [_(), _(), _(),   _(), c(7,true), _(),   _('block'), _('block'), _('block')],
      [_(), _(), _(),   _(), _(), _(),   _('block'), _('block'), _('block')],

      [_(), _(), _(),   _(), _(), _(),   _(), _(), _()],
      [_(), _(), _(),   _(), _(), _(),   _(), _(), _()],
      [_(), _(), _(),   _(), _(), _(),   _(), c(7,true), _()],
    ],
  },
  {
    caption: 'Linhas 3 e 4 já têm 7 (azul). Colunas 6 e 7 já têm 7 (roxo). Todas essas posições no bloco ficam eliminadas.',
    cells: [
      [_(), _(), _(),   _(), _(), _(),   _('col'), _('col'), _()],
      [_(), _(), _(),   _(), _(), _(),   c(7,true,'col'), _('col'), _()],
      [_(), _(), _(),   _(), _(), _(),   _('col'), _('col'), _()],

      [_('row'), c(7,true,'row'), _('row'),   _('row'), _('row'), _('row'),   _('eliminate'), _('eliminate'), _('eliminate')],
      [_('row'), _('row'), _('row'),   _('row'), c(7,true,'row'), _('row'),   _('eliminate'), _('eliminate'), _('eliminate')],
      [_(), _(), _(),   _(), _(), _(),   _('eliminate'), _('eliminate'), _('target')],

      [_(), _(), _(),   _(), _(), _(),   _('col'), _('col'), _()],
      [_(), _(), _(),   _(), _(), _(),   _('col'), _('col'), _()],
      [_(), _(), _(),   _(), _(), _(),   _('col'), c(7,true,'col'), _()],
    ],
  },
  {
    caption: 'Pela eliminação de linhas e colunas, o 7 só pode entrar em (linha 5, col 8). É o Cross-Hatching!',
    cells: [
      [_(), _(), _(),   _(), _(), _(),   _(), _(), _()],
      [_(), _(), _(),   _(), _(), _(),   c(7,true), _(), _()],
      [_(), _(), _(),   _(), _(), _(),   _(), _(), _()],

      [_(), c(7,true), _(),   _(), _(), _(),   _(), _(), _()],
      [_(), _(), _(),   _(), c(7,true), _(),   _(), _(), _()],
      [_(), _(), _(),   _(), _(), _(),   _(), _(), c(7,false,'solved')],

      [_(), _(), _(),   _(), _(), _(),   _(), _(), _()],
      [_(), _(), _(),   _(), _(), _(),   _(), _(), _()],
      [_(), _(), _(),   _(), _(), _(),   _(), c(7,true), _()],
    ],
  },
]

// ── Section 2: Naked Single ───────────────────────────────────────────────
// One 3×3 block. We show candidates narrowing to a single option.
const nakedSingle: TutorialStep[] = [
  {
    caption: 'Bloco com apenas uma célula vazia. Quais números já estão no bloco?',
    cells: [
      [c(3,true), c(7,true), c(1,true)],
      [c(9,true), c(0),      c(5,true)],
      [c(2,true), c(4,true), c(6,true)],
    ],
  },
  {
    caption: 'O bloco já tem 3,7,1,9,5,2,4,6. O único candidato restante é o 8.',
    cells: [
      [c(3,true), c(7,true), c(1,true)],
      [c(9,true), _(undefined,[8]), c(5,true)],
      [c(2,true), c(4,true), c(6,true)],
    ],
  },
  {
    caption: 'Só existe uma possibilidade: 8. Esse é o "Candidato Único" — a célula admite apenas um valor.',
    cells: [
      [c(3,true), c(7,true), c(1,true)],
      [c(9,true), c(8,false,'solved'), c(5,true)],
      [c(2,true), c(4,true), c(6,true)],
    ],
  },
]

// ── Section 3: Hidden Single ──────────────────────────────────────────────
// Full 9×9. Row 0 is the target (find where 6 goes).
// Blockers: col 1 has 6 at row 4, col 3 has 6 at row 6, col 7 has 6 at row 3.
// All blockers are in rows 3-8 → different 3×3 blocks from row 0, no conflict.
// Only col 5 in row 0 has no 6 anywhere in its column → unique spot.
const hiddenSingle: TutorialStep[] = [
  {
    caption: 'Queremos descobrir onde o 6 entra na primeira linha. Ela tem quatro células vazias. Observe o tabuleiro todo.',
    cells: [
      [c(2,true), _(),        c(4,true), _(),        c(8,true), _(),       c(3,true), _(),        c(7,true)],
      [_(),       _(),        _(),       _(),         _(),       _(),       _(),       _(),        _()      ],
      [_(),       _(),        _(),       _(),         _(),       _(),       _(),       _(),        _()      ],

      [_(),       _(),        _(),       _(),         _(),       _(),       _(),       c(6,true),  _()      ],
      [_(),       c(6,true),  _(),       _(),         _(),       _(),       _(),       _(),        _()      ],
      [_(),       _(),        _(),       _(),         _(),       _(),       _(),       _(),        _()      ],

      [_(),       _(),        _(),       c(6,true),   _(),       _(),       _(),       _(),        _()      ],
      [_(),       _(),        _(),       _(),         _(),       _(),       _(),       _(),        _()      ],
      [_(),       _(),        _(),       _(),         _(),       _(),       _(),       _(),        _()      ],
    ],
  },
  {
    caption: 'As colunas 1, 3 e 7 já têm 6 em outras linhas (roxo). Um 6 não pode repetir na mesma coluna — essas posições ficam eliminadas.',
    cells: [
      [c(2,true), _('eliminate'),   c(4,true), _('eliminate'),   c(8,true), _('target',[6]), c(3,true), _('eliminate'),   c(7,true)],
      [_(),       _('col'),         _(),       _(),              _(),       _(),              _(),       _('col'),         _()      ],
      [_(),       _('col'),         _(),       _(),              _(),       _(),              _(),       _('col'),         _()      ],

      [_(),       _('col'),         _(),       _(),              _(),       _(),              _(),       c(6,true,'col'),  _()      ],
      [_(),       c(6,true,'col'),  _(),       _('col'),         _(),       _(),              _(),       _('col'),         _()      ],
      [_(),       _('col'),         _(),       _('col'),         _(),       _(),              _(),       _('col'),         _()      ],

      [_(),       _(),              _(),       c(6,true,'col'),  _(),       _(),              _(),       _('col'),         _()      ],
      [_(),       _(),              _(),       _('col'),         _(),       _(),              _(),       _('col'),         _()      ],
      [_(),       _(),              _(),       _('col'),         _(),       _(),              _(),       _('col'),         _()      ],
    ],
  },
  {
    caption: 'A coluna 5 não tem 6 em lugar nenhum. É o único encaixe possível na linha — Único no Grupo!',
    cells: [
      [c(2,true), _(),        c(4,true), _(),        c(8,true), c(6,false,'solved'), c(3,true), _(),        c(7,true)],
      [_(),       _(),        _(),       _(),         _(),       _(),                 _(),       _(),        _()      ],
      [_(),       _(),        _(),       _(),         _(),       _(),                 _(),       _(),        _()      ],

      [_(),       _(),        _(),       _(),         _(),       _(),                 _(),       c(6,true),  _()      ],
      [_(),       c(6,true),  _(),       _(),         _(),       _(),                 _(),       _(),        _()      ],
      [_(),       _(),        _(),       _(),         _(),       _(),                 _(),       _(),        _()      ],

      [_(),       _(),        _(),       c(6,true),   _(),       _(),                 _(),       _(),        _()      ],
      [_(),       _(),        _(),       _(),         _(),       _(),                 _(),       _(),        _()      ],
      [_(),       _(),        _(),       _(),         _(),       _(),                 _(),       _(),        _()      ],
    ],
  },
]

// ── Section 4: Pencil Marks ───────────────────────────────────────────────
const pencilMarks: TutorialStep[] = [
  {
    caption: 'Esta célula está vazia. Antes de tentar adivinhar, vamos anotar os candidatos.',
    cells: [
      [c(3,true), c(7,true), c(1,true)],
      [c(9,true), c(0),      c(5,true)],
      [c(0),      c(4,true), c(6,true)],
    ],
  },
  {
    caption: 'Começamos com todos os dígitos 1-9 como possíveis candidatos.',
    cells: [
      [c(3,true), c(7,true), c(1,true)],
      [c(9,true), _(undefined,[1,2,3,4,5,6,7,8,9]), c(5,true)],
      [c(0),      c(4,true), c(6,true)],
    ],
  },
  {
    caption: 'Eliminamos os dígitos já presentes no bloco (1,3,4,5,6,7,9) e na linha/coluna. Restam apenas os candidatos 2 e 8.',
    cells: [
      [c(3,true), c(7,true), c(1,true)],
      [c(9,true), _(undefined,[2,8]), c(5,true)],
      [c(0),      c(4,true), c(6,true)],
    ],
  },
]

// ── Section 5: Hidden Pair ────────────────────────────────────────────────
// Show a 1-row grid (9 cells) with candidates
const hiddenPair: TutorialStep[] = [
  {
    caption: 'Numa linha, veja os candidatos de cada célula vazia.',
    cells: [[
      c(1,true),
      _(undefined,[2,3,6,8]),
      c(4,true),
      _(undefined,[2,5,6,7]),
      c(9,true),
      _(undefined,[2,3,5,8]),
      c(7,true),
      _(undefined,[2,6]),
      c(3,true),
    ]],
  },
  {
    caption: 'Os dígitos 3 e 8 aparecem APENAS nas posições 1 e 5. Como ocupam exatamente 2 células, ficam "reservados" ali.',
    cells: [[
      c(1,true),
      _('target',[2,3,6,8]),
      c(4,true),
      _(undefined,[2,5,6,7]),
      c(9,true),
      _('target',[2,3,5,8]),
      c(7,true),
      _(undefined,[2,6]),
      c(3,true),
    ]],
  },
  {
    caption: 'Como 3 e 8 só cabem nessas duas células, podemos eliminar todos os outros candidatos delas. Fica só 3 e 8!',
    cells: [[
      c(1,true),
      _('solved',[3,8]),
      c(4,true),
      _(undefined,[2,5,6,7]),
      c(9,true),
      _('solved',[3,8]),
      c(7,true),
      _(undefined,[2,6]),
      c(3,true),
    ]],
  },
]

// ── Section 6: Chaining ───────────────────────────────────────────────────
const chaining: TutorialStep[] = [
  {
    caption: 'Esta célula tem apenas dois candidatos: 2 e 7. Vamos testar o que acontece se ela for 2.',
    cells: [
      [c(0),      c(9,true), c(0),         c(0),      c(1,true), c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      _(undefined,[2,7]), c(0), c(0),     c(0),         c(0), c(0), c(0)],

      [c(0),      c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(1,true), c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],

      [c(0),      c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(2,true),    c(0),      c(0),      c(0),         c(0), c(0), c(0)],
    ],
  },
  {
    caption: 'Se a célula for 2, ela conflita com o 2 já fixo na coluna 2 (linha 8). Isso significa que 2 é impossível!',
    cells: [
      [c(0),      c(9,true), c(0),         c(0),      c(1,true), c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(2,false,'conflict'), c(0), c(0),  c(0),         c(0), c(0), c(0)],

      [c(0),      c(0),      _('col'),     c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(1,true), c(0),      _('col'),     c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      _('col'),     c(0),      c(0),      c(0),         c(0), c(0), c(0)],

      [c(0),      c(0),      _('col'),     c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      _('col'),     c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(2,true),    c(0),      c(0),      c(0),         c(0), c(0), c(0)],
    ],
  },
  {
    caption: 'Como 2 causa conflito, a célula só pode ser 7. O encadeamento lógico nos deu a resposta sem tentar adivinhar!',
    cells: [
      [c(0),      c(9,true), c(0),         c(0),      c(1,true), c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(7,false,'solved'), c(0), c(0),    c(0),         c(0), c(0), c(0)],

      [c(0),      c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(1,true), c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],

      [c(0),      c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(0),         c(0),      c(0),      c(0),         c(0), c(0), c(0)],
      [c(0),      c(0),      c(2,true),    c(0),      c(0),      c(0),         c(0), c(0), c(0)],
    ],
  },
]

// ── Accordion sections ────────────────────────────────────────────────────
const sections = [
  {
    id: 1,
    icon: '🔍',
    title: 'Eliminação por Varredura',
    subtitle: 'Cross-Hatching',
    description: 'Varrer linhas, colunas e blocos para descobrir onde um dígito pode ir.',
    gridRows: 9,
    gridCols: 9,
    steps: crossHatching,
  },
  {
    id: 2,
    icon: '🎯',
    title: 'Candidato Único',
    subtitle: 'Naked Single',
    description: 'Quando uma célula admite apenas um valor possível, esse é o valor dela.',
    gridRows: 3,
    gridCols: 3,
    steps: nakedSingle,
  },
  {
    id: 3,
    icon: '🔎',
    title: 'Único no Grupo',
    subtitle: 'Hidden Single',
    description: 'Quando um dígito só cabe em um único lugar dentro de uma linha, coluna ou bloco.',
    gridRows: 9,
    gridCols: 9,
    steps: hiddenSingle,
  },
  {
    id: 4,
    icon: '✏️',
    title: 'Notas de Lápis',
    subtitle: 'Pencil Marks',
    description: 'Anotar candidatos em células ajuda a organizar o raciocínio e eliminar opções.',
    gridRows: 3,
    gridCols: 3,
    steps: pencilMarks,
  },
  {
    id: 5,
    icon: '👥',
    title: 'Par Oculto',
    subtitle: 'Hidden Pair',
    description: 'Dois dígitos que só aparecem nas mesmas duas células de um grupo.',
    gridRows: 1,
    gridCols: 9,
    steps: hiddenPair,
  },
  {
    id: 6,
    icon: '⛓️',
    title: 'Encadeamento',
    subtitle: 'Chaining',
    description: 'Testar uma hipótese e seguir as consequências até encontrar um conflito.',
    gridRows: 9,
    gridCols: 9,
    steps: chaining,
  },
]

const openIndex = ref<number | null>(0)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
      <NuxtLink
        to="/"
        class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Menu
      </NuxtLink>
      <h1 class="text-lg font-bold">Como Jogar Sudoku</h1>
      <div class="w-16" aria-hidden="true" />
    </header>

    <!-- Intro -->
    <section class="max-w-lg mx-auto px-4 py-6 text-center">
      <p class="text-muted-foreground text-sm leading-relaxed">
        O Sudoku é um puzzle lógico — nunca é preciso adivinhar. Aprenda as técnicas abaixo do mais simples ao mais avançado.
      </p>
    </section>

    <!-- Accordion -->
    <div class="max-w-lg mx-auto px-4 pb-10 flex flex-col gap-2">
      <div
        v-for="(section, i) in sections"
        :key="section.id"
        class="rounded-xl border border-border overflow-hidden"
      >
        <!-- Header button -->
        <button
          class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          :aria-expanded="openIndex === i"
          @click="toggle(i)"
        >
          <span class="text-2xl" aria-hidden="true">{{ section.icon }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2">
              <span class="font-semibold text-sm">{{ section.title }}</span>
              <span class="text-xs text-muted-foreground font-mono">{{ section.subtitle }}</span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5 leading-snug">{{ section.description }}</p>
          </div>
          <svg
            class="flex-shrink-0 w-4 h-4 text-muted-foreground transition-transform duration-300"
            :class="{ 'rotate-180': openIndex === i }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Expandable content -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[600px]"
          leave-from-class="opacity-100 max-h-[600px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="openIndex === i" class="overflow-hidden border-t border-border">
            <div class="px-4 py-5">
              <TutorialGrid
                :steps="section.steps"
                :rows="section.gridRows"
                :cols="section.gridCols"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- CTA bottom -->
    <div class="max-w-lg mx-auto px-4 pb-10 flex flex-col items-center gap-3">
      <p class="text-sm text-muted-foreground text-center">Pronto para praticar?</p>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow hover:opacity-90 transition-opacity"
      >
        Jogar agora →
      </NuxtLink>
    </div>
  </div>
</template>
