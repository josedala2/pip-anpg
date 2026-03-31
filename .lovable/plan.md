

## Reordenar secções no Painel Económico & Financeiro

### Alteração

**`src/pages/BlockPage.tsx`** — Trocar a ordem das duas secções dentro da aba "Económico & Financeiro":

1. **Botões de navegação** (~linhas 1525-1546): Mover o botão "Resumo Financeiro" para antes do botão "Visão Económica".

2. **Conteúdo** (~linhas 1549-1557 vs 1559+): Mover o bloco "Resumo Financeiro" (Section 2, com KPIs, exportação e gráficos) para cima, e colocar o bloco "Visão Económica ANPG" (EconomicVisionTab) depois.

Resultado: Resumo Financeiro → Visão Económica ANPG → Consórcio.

