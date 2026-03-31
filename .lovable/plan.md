

## Rever Semáforos e Ocultar Card Progresso de Investimento

### Contexto
Os três painéis de semáforo (Previsão, Histórico 12M, Projecção 5A) e o card "Progresso de Investimento" precisam de actualização. O card de Progresso será ocultado, e os semáforos devem integrar o critério **OPEX/BO** (que já existe nos Alertas mas falta nos semáforos).

### Alterações

#### 1. Ocultar card "Progresso de Investimento"
**`src/components/dashboard/ConcessionStatusTab.tsx`** (linhas 576-594) — Remover o bloco `<Card>` de "Progresso de Investimento".

#### 2. Adicionar critério OPEX aos 3 painéis de semáforo

**`src/components/dashboard/SemaphoreForecastPanel.tsx`** — Adicionar critério 7 "OPEX/BO":
- Usa `block.economicVision?.technicalCost?.opex2025`
- Thresholds: > 35 → vermelho, > 25 → amarelo, ≤ 25 → verde
- Sem projecção de mudança (estático, como Compliance)
- Ícone: `Gauge`

**`src/components/dashboard/SemaphoreHistoryPanel.tsx`** — Adicionar critério "OPEX" no loop mensal:
- Mesmos thresholds (> 35 red, > 25 yellow, ≤ 25 green)
- Valor estático ao longo dos 12 meses (dado anual)

**`src/components/dashboard/SemaphoreTimelineChart.tsx`** — Adicionar critério "OPEX" na projecção trimestral:
- Mesmos thresholds, valor estático (sem tendência projectada)
- Adicionar "OPEX" ao array `criteriaNames`

### Ficheiros afectados
- `src/components/dashboard/ConcessionStatusTab.tsx` — remover Progresso de Investimento
- `src/components/dashboard/SemaphoreForecastPanel.tsx` — novo critério OPEX
- `src/components/dashboard/SemaphoreHistoryPanel.tsx` — novo critério OPEX
- `src/components/dashboard/SemaphoreTimelineChart.tsx` — novo critério OPEX

