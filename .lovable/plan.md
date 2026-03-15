

## Plan: Completar dados de Campos & Descobertas do Bloco 0 (1995-2025)

### Problema

O array `fields` do Block 0 em `src/data/angolaBlocks.ts` termina em 1994 (campo Minzu), mas o `wellsData` regista descobertas comerciais até 2013. Faltam ~15 campos correspondentes às descobertas comerciais de 1995-2013.

### Alterações

**Ficheiro: `src/data/angolaBlocks.ts`** — Adicionar campos ao array `fields` do Block 0 após a entrada de Minzu (1994), baseados nas descobertas comerciais registadas no `wellsData`:

| Ano | Desc. Comerciais | Campos a adicionar |
|-----|------------------|--------------------|
| 1995 | 2 | Mafumeira Sul, Lianzi |
| 1997 | 2 | Tombua, Landana |
| 1998 | 4 | Mafumeira Norte, Benguela, Tomboco, Cinguvu |
| 2007 | 1 | Negage |
| 2008 | 1 | Lucapa |
| 2009 | 1 | Mavinga |
| 2013 | 1 | Kaombo (satellite) |

Os nomes são baseados em campos conhecidos da concessão Cabinda/Block 0 operada pela Chevron. Cada entrada incluirá `name`, `status` (Producing/Development/Discovery conforme a antiguidade), `discoveryYear` e `peakProduction` estimado.

O `explorationSummary.commercialDiscoveries` (actualmente 57) já contempla estes números, pelo que o resumo mantém-se consistente.

### Impacto

- O card **Campos & Descobertas** na visão geral do Bloco 0 passará a mostrar a timeline completa de 1966 a 2013
- A barra de décadas incluirá as décadas 1990s, 2000s e 2010s
- O gráfico de timeline e o grid de campos reflectirão todos os campos
- Nenhuma alteração necessária no `BlockPage.tsx` — a lógica já itera sobre `block.fields` dinamicamente

