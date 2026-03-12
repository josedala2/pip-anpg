

## Analysis: Block 15 data vs uploaded spreadsheet

After parsing the uploaded `BLOCO-15.xlsx` and comparing it against the existing `wellsData` in `src/data/angolaBlocks.ts` (lines 1254-1266), **the data already matches perfectly**:

| Year | Pesquisa | Avaliação | Desc. Comercial | Desc. Não Comercial | Seco |
|------|----------|-----------|-----------------|---------------------|------|
| 1998 | 5 | 1 | 4 | 0 | 1 | ✅ |
| 1999 | 2 | 3 | 2 | 0 | 0 | ✅ |
| 2000 | 6 | 1 | 5 | 1 | 0 | ✅ |
| 2001 | 1 | 1 | 1 | 0 | 0 | ✅ |
| 2002 | 1 | 2 | 1 | 0 | 0 | ✅ |
| 2003 | 4 | 3 | 4 | 0 | 0 | ✅ |
| 2006 | 0 | 3 | 0 | 0 | 0 | ✅ |
| 2008 | 0 | 2 | 0 | 0 | 0 | ✅ |
| 2009 | 0 | 2 | 0 | 0 | 0 | ✅ |
| 2022 | 1 | 0 | 1 | 0 | 0 | ✅ |
| 2024 | 1 | 0 | 1 | 0 | 0 | ✅ |

**No changes are needed** — the Block 15 well data is already up to date with the spreadsheet contents.

The block also has populated `fields` (Kizomba A, Kizomba B, Mondo, Saxi-Batuque), `prospects` (20 entries), `seismicData` (17 entries), and `explorationSummary`.

