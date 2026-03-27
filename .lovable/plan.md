

# Auditoria Global — Componentes com oilBlocks sem filtro pendingRealData

## Resultado da Auditoria

Analisei todos os 41 ficheiros que referenciam `oilBlocks`. Divido-os em **3 categorias**:

### ✅ Já filtrados (sem acção necessária)
- `KPICards.tsx` — usa `verified = oilBlocks.filter(!pendingRealData)`
- `ConselhoPanel.tsx` — filtrado
- `EconomicFinancialPanel.tsx` — filtrado
- `ExplorationPanel.tsx` — filtrado
- `GeneralForecastPanel.tsx` — filtrado
- `StrategicForecast.tsx` — filtrado
- `CostStructurePanel.tsx` — filtrado
- `EconomicRiskPanel.tsx` — filtrado
- `FiscalImpactPanel.tsx` — filtrado
- `ThreatPanel.tsx` — filtrado
- `QuickRecommendations.tsx` — filtrado
- `CouncilRecommendationsPanel.tsx` — filtrado
- `AlertsPanel.tsx` — filtrado
- `SobaChat.tsx` — filtrado
- `ExecutiveBoardPanel.tsx` — filtrado
- `TrendProjection.tsx` — filtra por `pendingRealData`
- `OverviewSidebar.tsx` — trends filtram por `pendingRealData`
- `Index.tsx` (alerts no header) — filtrado

### ⚠️ Aceitáveis sem filtro (navegação/mapa/admin — devem mostrar todos os blocos)
- `BlocksPanel.tsx` — painel de mapa/filtros mostra todas as concessões (correcto, é o mapa ANPG)
- `ConcessionMap.tsx` — renderiza polígonos de todas as concessões (correcto)
- `OverviewBlockList.tsx` — lista filtrada por `filteredIds` do pai (correcto, controlado pelo mapa)
- `BlockPage.tsx` — página de detalhe individual (mostra `PendingDataBadge` se não verificado)
- `FacilityPage.tsx` — detalhe de instalação individual
- `AdminDataPage.tsx` — painel admin, deve ver tudo
- `ComparePage.tsx` — utilizador selecciona blocos manualmente (aceitar, mas ver ponto abaixo)

### 🔴 Precisam de correcção (7 componentes + 5 funções utilitárias)

| # | Ficheiro | Problema | Correcção |
|---|---|---|---|
| 1 | **AdvancedForecastPanel.tsx** | L77: `calculateAllScores(oilBlocks)` sem filtro; L81: `oilBlocks.filter(b.dailyProduction > 0)` sem filtro | Adicionar `!b.pendingRealData` |
| 2 | **RiskPerformance.tsx** | L35-43: operadores, fases e filtro base usam `oilBlocks` sem filtro | Filtrar por `!b.pendingRealData` na base |
| 3 | **ContractCompliancePanel.tsx** | L67: `oilBlocks.map(block => ...)` sem filtro | Filtrar por `!b.pendingRealData` |
| 4 | **OperatorsPanel.tsx** (`buildOperators`) | L61: `for (const b of oilBlocks)` sem filtro — agrega KPIs de todos os operadores | Filtrar na entrada |
| 5 | **ProductionPanel.tsx** | L27-29: listas de filtro (operators, basins, producingBlockNames) usam `oilBlocks` sem filtro; L65: filtro principal não exclui pendingRealData | Adicionar filtro base |
| 6 | **OverviewSidebar.tsx** | L11-16: KPIs usam `getTotalProduction()`, `getTotalReserves()`, etc. que agregam TODOS os blocos | Substituir por versões filtradas |
| 7 | **ReportConfigurator.tsx** | L56, L182: lista de blocos e contagem por operador sem filtro | Filtrar (ou manter com badge — ver decisão) |
| U1-U5 | **angolaBlocks.ts** helper functions | `getTotalProduction`, `getTotalReserves`, `getActiveBlocks`, `getTotalCapex`, `getAvgExecutionRate` — operam sobre todos os blocos | Filtrar por `!pendingRealData` |

## Plano de Implementação

### Passo 1 — Corrigir funções utilitárias em `angolaBlocks.ts`
Actualizar as 5 funções helper para filtrar por `!pendingRealData`:
```typescript
export const getTotalProduction = () => 
  oilBlocks.filter(b => !b.pendingRealData).reduce((sum, b) => sum + b.dailyProduction, 0);
// idem para getTotalReserves, getActiveBlocks, getTotalCapex, getAvgExecutionRate
```
Isto corrige automaticamente `OverviewSidebar.tsx` e qualquer outro consumidor destas funções.

### Passo 2 — AdvancedForecastPanel.tsx
- L77: `calculateAllScores(oilBlocks.filter(b => !b.pendingRealData))`
- L81: adicionar `!b.pendingRealData` ao filtro de blocos produtores

### Passo 3 — RiskPerformance.tsx
- Criar `const base = oilBlocks.filter(b => !b.pendingRealData)` e usar como fonte para operators, phases e filtered

### Passo 4 — ContractCompliancePanel.tsx
- L67: `oilBlocks.filter(b => !b.pendingRealData).map(block => ...)`

### Passo 5 — OperatorsPanel.tsx
- `buildOperators()`: filtrar `oilBlocks.filter(b => !b.pendingRealData)` na iteração

### Passo 6 — ProductionPanel.tsx
- Actualizar as constantes de topo (operators, basins, producingBlockNames) e o filtro principal para excluir `pendingRealData`

### Passo 7 — ReportConfigurator.tsx
- Filtrar lista de blocos e contagem por operador para mostrar apenas verificados

### Ficheiros a modificar
1. `src/data/angolaBlocks.ts` (5 funções)
2. `src/components/dashboard/AdvancedForecastPanel.tsx`
3. `src/components/dashboard/RiskPerformance.tsx`
4. `src/components/dashboard/ContractCompliancePanel.tsx`
5. `src/components/dashboard/OperatorsPanel.tsx`
6. `src/components/dashboard/ProductionPanel.tsx`
7. `src/components/reports/ReportConfigurator.tsx`

