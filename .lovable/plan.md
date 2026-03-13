

## Fase 1: Módulo Económico Nacional — Dashboard + Score Engine

### Contexto

O projecto já possui dados económicos ricos por bloco (`economicData`, `economicVision`, `FiscalConditions`) e um motor de scoring estratégico (`strategicScoring.ts`). A Fase 1 cria um novo painel de topo "Económico" no dashboard principal, com visão nacional agregada.

### Arquitectura

```text
Index.tsx (novo tab "Económico")
  └── EconomicFinancialPanel.tsx (novo)
        ├── National KPI Strip (6 cards)
        ├── Concession Value Ranking Table
        ├── Revenue Evolution Chart
        ├── Revenue by Basin/Operator Charts
        └── Economic Score Classification Summary

src/lib/economicScoring.ts (novo)
  └── Economic Score Engine (0-100, 5 dimensões)
```

### Ficheiros a criar/alterar

**1. `src/lib/economicScoring.ts`** (novo) — Economic Score Engine
- 5 dimensões: Rentabilidade (30%), Eficiência de Custos (20%), Sustentabilidade do Activo (20%), Contribuição Fiscal (15%), Risco Económico (15%)
- Calcula NPV proxy, OPEX/barril, break-even, margem económica a partir dos dados existentes em `economicData` e `economicVision`
- Classificação: Activo Estratégico (80-100), Rentável (60-79), Observação (40-59), Alto Risco (20-39), Inviável (0-19)
- Recomendações automáticas por classificação

**2. `src/components/dashboard/EconomicFinancialPanel.tsx`** (novo) — Painel principal
- **KPIs nacionais** (6 cards): Receita Total Estado, NPV Total Concessões, Custo Médio/Barril, Break-even Médio, Produção Viável, Produção em Risco
- **Ranking das concessões** — tabela com: nome, operador, produção, OPEX/bbl, break-even, NPV, receita Estado, Economic Score, código de cores (verde/amarelo/vermelho)
- **Evolução da receita** — gráfico de barras por ano (usando `cashFlowTimeSeries` agregado)
- **Receita por bacia** — pie chart agregando blocos por `basin`
- **Receita por operador** — bar chart horizontal
- **Resumo de classificação** — contagem de blocos por categoria económica (Estratégico, Rentável, etc.)

**3. `src/pages/Index.tsx`** — Adicionar tab "Económico" ao array `allPanels` e renderizar o novo componente

**4. `src/data/angolaBlocks.ts`** — Adicionar helper functions:
- `getAvgOpexPerBarrel()` — média ponderada do OPEX/barril
- `getNationalBreakeven()` — break-even médio estimado
- `getRevenueByBasin()` — receita agregada por bacia
- `getRevenueByOperator()` — receita agregada por operador

### Dados utilizados (já existentes)

- `block.economicData.opexPerBarrel` — custo operacional/barril
- `block.economicData.costHistory` — histórico CAPEX/OPEX
- `block.economicVision.npvByPeriod` — NPV por período (GE vs Impostos)
- `block.economicVision.cashFlowTimeSeries` — fluxo de caixa anual
- `block.economicVision.technicalCost` — custo técnico (CAPEX+OPEX/barril)
- `block.contractInfo.fiscalConditions` — regime fiscal (IRP, IPP, royalties)
- `block.dailyProduction`, `block.estimatedReserves` — dados operacionais

### Cálculos derivados

- **Receita Estado por bloco**: `dailyProduction * 365 * preçoBrent * taxaFiscalEstimada`
- **Break-even**: `opexPerBarrel + (capex / reservas / 1e6)` (estimativa)
- **NPV total**: soma dos `npvByPeriod` disponíveis
- **Produção em risco**: blocos com OPEX/barril > 80% do preço Brent

### Resultado esperado

Novo tab "Económico" na barra de navegação principal, entre "Contratos" e "Cenários", que oferece ao Conselho de Administração uma visão económica nacional consolidada com ranking de concessões e classificação automática.

