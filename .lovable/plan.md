

## Plan: Add Column Sorting to Homologações Tables

Add toggle sorting (click column header to sort asc/desc) to the 4 main tables in `HomologacoesPanel.tsx` that currently lack it, following the existing pattern from `ExplorationSummaryTable` (ArrowUpDown/ArrowUp/ArrowDown icons, sortKey + sortDir state).

### Tables to update

1. **Ranking de Blocos por Conteúdo Local** (line ~750) — 8 columns, sort by any numeric column
2. **Blocos summary table** (line ~1088) — 5 columns (Bloco, Nº Processos, Total Solicitado, Total Aprovado, Taxa)
3. **Top 20 Fornecedores** (line ~1193) — 4 columns (#, Fornecedor, Nº Contratos, Montante Aprovado)
4. **Tabela Detalhada** (line ~1228) — 11 columns (Mês, Ano, Bloco, Fornecedor, Serviços, Tipo, Solicitado, Aprovado, Modalidade, Owner, Decisão)

### Implementation

Each table gets its own `sortKey`/`sortDir` state pair (e.g., `blocoRankSort`, `blocoTabSort`, `fornTabSort`, `detailSort`). The sort logic and `SortIcon` helper will be added once at the top of the component (reusable inline function), matching the existing project pattern.

- Import `ArrowUpDown, ArrowUp, ArrowDown` from lucide-react
- Add a generic `SortIcon` component and `handleSort` helper
- Make each `TableHead` clickable with sort icon indicator
- Sort data in `useMemo` blocks before rendering
- For the Blocos table (which has expandable rows), sorting applies to the summary rows only

### Files changed
- `src/components/dashboard/HomologacoesPanel.tsx`

No database or backend changes required.

