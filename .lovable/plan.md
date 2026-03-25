

## Remove "Alterações Relevantes" and "Distribuição de Participações" from Consórcio tab

### What changes
In `src/pages/BlockPage.tsx`, remove two sections from the Consórcio tab that appear for all blocks:

1. **Lines 2053-2084** — The "Alterações Relevantes" change summary block (compares initial vs actual consortium and shows diffs)
2. **Lines 2089-2108** — The "Distribuição de Participações" pie chart card

This will make all blocks' Consórcio tab match Block 0's structure: showing only the GE Inicial → GE Actual evolution layout without the extra summary and chart below.

### Technical detail
- Delete the IIFE block computing `changes` array and rendering the grid (lines 2053-2084)
- Delete the `<Card>` with the `PieChart` (lines 2089-2108)
- Remove unused imports if `PieChart`, `Pie`, `Cell` are no longer referenced elsewhere in the file

