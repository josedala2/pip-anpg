

## Plan: Update Block 3/05 well data with real values from the uploaded chart

The uploaded image shows "POÇOS DE PESQUISA VS AVALIAÇÃO" for Block 3/05 with specific well data per year.

### Data extracted from the chart

**Wells by year:**
| Year | Pesquisa | Avaliação | Descoberta Comercial | Seco |
|------|----------|-----------|---------------------|------|
| 1982 | 0 | 0 | 1 | 0 |
| 1983 | 0 | 0 | 1 | 0 |
| 1986 | 1 | 1 | 0 | 0 |
| 1987 | 1 | 0 | 0 | 0 |
| 1988 | 0 | 1 | 0 | 0 |
| 1989 | 1 | 0 | 0 | 0 |
| 1990 | 0 | 0 | 1 | 0 |
| 1991 | 1 | 0 | 0 | 0 |
| 2007 | 1 | 0 | 0 | 0 |
| 2008 | 0 | 1 | 0 | 0 |
| 2009 | 0 | 0 | 0 | 1 |

**Summary from chart:**
- 3 commercial discoveries (Punja-1, Caco-1, Gazela-1)
- 1 non-commercial discovery
- 1 dry well (Dique-Dique-1)
- Success rate: 75%

### Change

**File:** `src/data/angolaBlocks.ts` (lines 2847-2853)

Replace the current placeholder `wellsData` for block-3 with the real per-year data from the chart, using the existing `WellData` interface fields (`pesquisa`, `avaliacao`, `descobertaComercial`, `descobertaNaoComercial`, `seco`).

Also update the `fields` array (lines 2855-2859) to reflect the actual discovered fields: Punja, Caco, Gazela (from "Descobertas") and note Dique-Dique as dry.

