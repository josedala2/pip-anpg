## Plano: Corrigir Taxa de Sucesso — Bloco 0

### Alterações

**1. Renomear label** em `src/pages/BlockPage.tsx` (linha 1148):

- De: `"Taxa Sucesso Geológico"` → Para: `"Taxa de Sucesso"`

**2. Corrigir valor** em `src/data/angolaBlocks.ts` (linha 601):

- De: `geologicalSuccessRate: 40` → Para: `geologicalSuccessRate: 62`
- Fórmula validada: (descobertas comerciais + não comerciais) / poços de pesquisa = (57+32)/155 ≈ 61.8%, arredondado pelo utilizador para ~62%

### Ficheiros


| Ficheiro                   | Linha | Mudança                               |
| -------------------------- | ----- | ------------------------------------- |
| `src/pages/BlockPage.tsx`  | 1148  | Renomear label para "Taxa de Sucesso" |
| `src/data/angolaBlocks.ts` | 601   | `geologicalSuccessRate: 62`           |


### Notas

- Os outros locais que mostram este campo (BlockDetailRow, ReportPreview, SobaChat) usam labels ligeiramente diferentes — serão mantidos ou também renomeados conforme preferência.