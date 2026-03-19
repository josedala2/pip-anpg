

## Plano: Actualizar Dados Económicos de 6 Blocos com Dados Reais do Excel

### Mapeamento das Páginas do Excel

| Página | Bloco | Identificação |
|--------|-------|---------------|
| 1 | Block 0 | Opex 2025=26.69 (confirma), cash flow desde 2005 |
| 2 | Block 14K | NPV GE=-110, valores muito pequenos, bloco exploratório |
| 3 | Block 14 | NPV PF GE=1,040, cash flow 2016-2038 |
| 4 | Block 17 | Grandes valores históricos, cash flow 2003-2032 |
| 5 | Block 15 | Menção explícita "Bloco 15 - Fundos de Abandono" |
| 6 | Block 15/06 | Menção explícita "Bloco 15/06 - Fundos de Abandono", campos Ngoma/Olombendo/Agogo |

### Dados a Actualizar por Bloco

Para cada um dos 6 blocos, os seguintes campos serão actualizados com os valores reais do Excel:

1. **NPV** — npvFullcycle, npvPointForward, npvByPeriod (GE, Conc, Impostos)
2. **Fluxo de Caixa** — cashFlowTimeSeries completo (GE, Concessionária, Impostos por ano)
3. **Repartição de Receitas** — revenueShare (totais MMUSD por período)
4. **Partilha de Produção** — productionShareGE (2026-2030, em milhares de barris)
5. **Custos Técnicos** — technicalCost (Capex/bbl, Opex/bbl, Opex 2025)
6. **Custos Recuperáveis** — custos por recuperar e custos recuperados
7. **Plano de Investimentos** — investmentPlan quinquenal (2026-2030)
8. **Fundos de Abandono** — onde disponível (Blocos 15 e 15/06)

### Alteração Estrutural

A interface `CashFlowYear` actualmente só tem `ge` e `impostos`. O Excel inclui também os valores da **Concessionária**. Será necessário:

- Adicionar campo `conc?: number` à interface `CashFlowYear`
- Actualizar o gráfico de Fluxo de Caixa no `EconomicVisionTab.tsx` para mostrar as 3 barras (GE, Impostos, Concessionária)
- Actualizar a tabela do chatbot `SobaChat.tsx` para incluir a coluna Concessionária

### Ficheiros a Editar

1. **`src/data/angolaBlocks.ts`** — interfaces + dados económicos dos 6 blocos
2. **`src/components/dashboard/EconomicVisionTab.tsx`** — gráfico com 3 séries
3. **`src/components/dashboard/SobaChat.tsx`** — tabela com coluna Conc

### Resumo do Impacto

- 6 blocos passam a ter dados económicos reais e verificáveis
- Gráficos de fluxo de caixa mostrarão a repartição completa (GE + Conc + Impostos)
- KPIs e painéis fiscais reflectirão valores actualizados
- Dados de NPV, custos e investimentos alinhados com a planilha oficial

