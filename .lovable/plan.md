

## Renomear KPI "Taxa de Declínio" → "Variação Percentual"

### Alterações

#### 1. `src/pages/BlockPage.tsx` (linha ~1170)
- Alterar label de `Taxa de Declínio` para `Variação Percentual`
- Actualizar referência ao tooltip: `tooltipDescriptions["Variação Percentual"]`

#### 2. `src/lib/tooltipDescriptions.ts` (linha 101)
- Renomear chave `"Taxa de Declínio"` → `"Variação Percentual"`
- Ajustar descrição: "Variação percentual da produção ao longo dos últimos 12 meses (método 3-vs-3: média dos 3 últimos meses vs 3 primeiros). Valores negativos indicam declínio."

### Ficheiros afectados
- `src/pages/BlockPage.tsx`
- `src/lib/tooltipDescriptions.ts`

