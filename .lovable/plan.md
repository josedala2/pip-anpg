

## Rever Visão Geral e Estado da Concessão — Bloco 0

### Problema
Os painéis **Visão Geral** e **Estado da Concessão** usam campos genéricos placeholder (`accumulatedInvestment: 4200`, `plannedInvestment: 4500`, `executionRate: 93`) que não correspondem aos dados detalhados já inseridos na `economicVision`.

### Dados actuais vs reais

| Campo | Valor actual (placeholder) | Fonte real disponível |
|-------|---------------------------|----------------------|
| Investimento Acum. | $4.2B | `economicVision.revenueShare` — soma total de custos ou `investmentPlan` total |
| Investimento Planeado | $4.5B | `investmentPlan` quinquenal = MMUSD 8,726 |
| Taxa Execução | 93% | Pode derivar do CAPEX real vs planeado em `capexHistory` |
| Reservas Estimadas | 421 Mb | Verificar com dados de exploração (Recurso Descoberto 21.000 MMBO) |

### Alterações propostas

**1. Visão Geral — 4 KPI cards (linhas 391-408 de `BlockPage.tsx`)**
Quando `economicVision` existe, substituir os cards por dados reais:
- **Produção Diária** — manter (já usa `dailyProduction` que é real)
- **Reservas Estimadas** — manter (valor existente)
- **Investimento Quinquenal** — usar `investmentPlan` (MMUSD 8,726) em vez de `accumulatedInvestment`
- **Custo Técnico** — usar `technicalCost.opex2025` ($26.3/bbl) em vez de `executionRate`

**2. Estado da Concessão — KPI "Investimento Executado" (linhas 189-194 de `ConcessionStatusTab.tsx`)**
Quando `economicVision` existe:
- Substituir `executionRate` / `accumulatedInvestment` / `plannedInvestment` por dados derivados de `capexHistory` (soma actual vs soma planned)
- O alerta de "taxa de execução baixa" (linha 123) também deve usar o valor derivado

**3. Alerta de execução no `ConcessionStatusTab.tsx` (linha 123)**
Derivar a taxa de execução de `capexHistory` quando disponível, em vez do campo placeholder.

### Fallbacks
Blocos sem `economicVision` continuam a usar os campos genéricos existentes.

### Ficheiros a alterar
1. `src/pages/BlockPage.tsx` — linhas 391-408 (4 KPI cards da Visão Geral)
2. `src/components/dashboard/ConcessionStatusTab.tsx` — linhas 182-227 (KPI cards) e linha 123 (alerta execução)

