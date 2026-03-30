

## Correcções na Visão Económica do Bloco 0

### Problemas identificados

**1. Floating point no total da Partilha de Produção GE**
- Mostra "328.44800000000004 MMBO" em vez de "328.448 MMBO"
- **Causa**: `.reduce()` sem arredondamento (linhas 1842 no BlockPage, 192 no EconomicVisionTab)
- **Correcção**: Aplicar `.toFixed(2)` ou `parseFloat(total.toFixed(3))` em ambos os ficheiros

**2. Total do Plano de Investimentos usa `y.total` que inclui `cashCallSonangol`**
- Mostra "$12,304M" mas o valor correcto (exploração+desenvolvimento+operação) é **MMUSD 8,726**
- O campo `total` nos dados inclui `adminServicos` + `cashCallSonangol` (ex: 2026: 87+596+1160+168+825=2836)
- O gráfico de barras empilhado só mostra exploração/desenvolvimento/operação, mas o total no header soma tudo
- **Correcção**: Calcular total como `exploracao + desenvolvimento + operacao` nos headers (BlockPage linha 1810, 1583; EconomicVisionTab usa `investmentPlan` com total)

### Ficheiros a alterar

**`src/pages/BlockPage.tsx`**
- Linha 1583: `invTotal` → somar `exploracao + desenvolvimento + operacao` em vez de `total`
- Linha 1810: idem no header do gráfico
- Linha 1842: arredondar total de productionShareGE

**`src/components/dashboard/EconomicVisionTab.tsx`**  
- Linha 192: arredondar `totalShareMMBO`
- Verificar se o ChartWrapper do investmentPlan mostra total (via `headerExtra`) — se sim, corrigir igualmente

### Sem impacto nos dados
Nenhuma alteração ao `angolaBlocks.ts` — os dados estão correctos, o problema é apenas na forma como os totais são calculados na apresentação.

