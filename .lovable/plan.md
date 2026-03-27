

## Renomear "Declínio Produção" para "Variação Produção"

O nome actual sugere que a produção está sempre em declínio, quando na verdade o KPI mostra a variação percentual (que pode ser positiva ou negativa). Vou renomear em todos os locais onde aparece.

### Ficheiros a modificar

1. **`src/components/dashboard/ConcessionStatusTab.tsx`** — Alterar label de `"Declínio Produção"` para `"Variação Produção"` no array `kpiCards`
2. **`src/lib/tooltipDescriptions.ts`** — Renomear a chave de `"Declínio Produção"` para `"Variação Produção"` (mantendo a mesma descrição)
3. **`src/components/dashboard/SemaphoreForecastPanel.tsx`** — Alterar as 4 ocorrências de `criterion: "Declínio Produção"` para `"Variação Produção"`

Alteração puramente cosmética, sem impacto na lógica de cálculo.

