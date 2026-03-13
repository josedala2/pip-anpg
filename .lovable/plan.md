

## Plano: Filtros por Operador e Bacia no Tab Previsão Geral

### Objectivo
Adicionar selectores de Operador e Bacia no topo do `GeneralForecastPanel` para que **toda a informação** (KPIs, gráficos, heatmap, tabelas, alertas, recomendações) recalcule dinamicamente com base no subconjunto de blocos seleccionado.

### Abordagem

**Ficheiro a editar:** `src/components/dashboard/GeneralForecastPanel.tsx`

1. **Adicionar estado de filtros** — dois `useState` para `selectedOperator` e `selectedBasin` (default: `"all"`).

2. **Barra de filtros no topo** — Dois `Select` compactos (estilo consistente com `FilterBar` existente) mostrando operadores e bacias extraídos de `oilBlocks`. Incluir badge com contagem de blocos activos e produção total filtrada.

3. **Derivar `filteredBlocks`** — `useMemo` que filtra `oilBlocks` por operador/bacia seleccionados. Todas as computações downstream passam a usar `filteredBlocks` em vez de `oilBlocks`.

4. **Recalcular dados derivados** — Os `useMemo` existentes (economicKPIs, strategicScores, alerts, blockSynthesis, scenarios, heatmap, multiMetric) passam a depender de `filteredBlocks`. As funções `getNationalEconomicKPIs` e `calculateAllScores` já aceitam um array de blocos como argumento, pelo que basta passar `filteredBlocks`.

5. **Cenários filtrados** — Para os cenários, calcular projecções agregando apenas os blocos filtrados (somar projecções base de cada bloco filtrado, similar ao que `runScenarioForOperator` faz mas para um subconjunto arbitrário).

6. **Indicador visual** — Quando há filtro activo, mostrar um banner/badge "Filtro activo: Operador X / Bacia Y — N blocos, Xk BOPD" para contexto claro.

### Detalhes Técnicos

- As funções `getNationalEconomicKPIs(blocks)` e `calculateAllScores(blocks)` já recebem array de blocos — sem alterações necessárias nos engines.
- Para cenários filtrados, criar projecções agregadas localmente somando `block.projections.base[]` dos blocos filtrados (evita alterar `scenarioEngine`).
- Alertas filtrados: filtrar `allAlerts` por `blockId` dos blocos no subconjunto.

