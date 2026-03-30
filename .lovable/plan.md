

## Reestruturar Cards do Resumo Financeiro

### Situação actual
Os 4 cards actuais usam dados genéricos (`accumulatedInvestment`, `executionRate`, bónus, contribuições) que são placeholders pouco relevantes face aos dados detalhados já inseridos na `economicVision`.

### Novos cards propostos (4 cards, usando dados reais da `economicVision`)

| Card | Fonte de dados | Valor Bloco 0 |
|------|---------------|---------------|
| **Investimento Quinquenal** | `economicData.investmentPlan` (soma total) | MMUSD 8.726 |
| **Custo Técnico (OPEX/bbl)** | `economicVision.technicalCost.opex2025` | $26,3/bbl |
| **Receita Estado (Acum.)** | `economicVision.revenueShare` — soma `impostosMMUSD` de todos os períodos | ~$87.249M |
| **Custo de Abandono** | `economicVision.abandonmentDetail.total` vs `fundeado` | MMUSD 3.665 (2,8% fundeado) |

### Detalhes de cada card

1. **Investimento Quinquenal** — valor total + barra de progresso mostrando % exploração/desenvolvimento/operação
2. **Custo Técnico** — OPEX/bbl 2025 em destaque, com CAPEX/bbl e OPEX/bbl discriminados por baixo
3. **Receita Estado** — total acumulado + percentagem do período mais recente (16% para 2026-2050)
4. **Custo de Abandono** — total + mini barra de fundeamento com alerta visual quando < 10%

### Fallbacks
Se `economicVision` não existir (outros blocos), manter os cards antigos como fallback.

### Ficheiro a alterar
`src/pages/BlockPage.tsx` — linhas 1577-1631 (substituir os 4 cards actuais)

