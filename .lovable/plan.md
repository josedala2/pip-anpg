

## Alinhar KPI "Investimento Executado" no Painel Estado da Concessão

### Situação actual
O painel Estado da Concessão já calcula o KPI correctamente a partir do `capexHistory`:
- **Actual**: 5.400M (soma dos CAPEX realizados 2020–2025)
- **Planned**: 14.276M (soma dos CAPEX planeados 2020–2030)
- **Rate**: 38%

Isto corresponde exactamente à imagem de referência (38%, $5400M / $14 276M).

### Problema menor
O campo `plannedInvestment` do Bloco 0 está a 14.126, enquanto a soma real do `capexHistory` é 14.276 — diferença de 150M. Se o fallback for usado (sem capexHistory), mostraria um valor inconsistente.

### Alteração

**`src/data/angolaBlocks.ts`** — Corrigir `plannedInvestment` do Bloco 0 de **14126** para **14276** para alinhar com a soma do `capexHistory` e com a imagem de referência.

Resultado: ambos os painéis (Visão Geral e Estado da Concessão) apresentam dados consistentes — o Estado da Concessão continuará a mostrar **38% · $5.400M / $14.276M**.

