

# Auditoria Completa: Dados Fabricados na Plataforma

## Resultado da Auditoria

Após percorrer todos os painéis, cards, abas e engines da plataforma, confirmo que **os dados fabricados visuais (arrays hardcoded com valores inventados) já foram eliminados**. Todos os componentes derivam dados do dataset central `angolaBlocks.ts`.

No entanto, identifico **valores de fallback silenciosos** que mascaram a ausência de dados reais em blocos sem informação verificada. Estes não são "dados fabricados" no sentido visual, mas produzem números que podem induzir em erro.

---

## Painéis Limpos (sem dados fabricados)

| Componente | Fonte de Dados | Estado |
|---|---|---|
| **KPICards** | `oilBlocks` + `homologacoesData` | Limpo |
| **ThreatPanel** | `alertsEngine.ts` → `oilBlocks` | Limpo |
| **TrendProjection** | `productionHistory` real (filtra `pendingRealData`) | Limpo |
| **QuickRecommendations** | `strategicScoring.ts` → `oilBlocks` | Limpo |
| **OperatorsPanel** | Agregação directa de `oilBlocks` | Limpo |
| **AlertsPanel** | `alertsEngine.ts` → regras sobre `oilBlocks` | Limpo |
| **ProductionPanel** | Apenas blocos com `productionHistory` real | Limpo |
| **OverviewSidebar** | Filtra `pendingRealData` para trends | Limpo |
| **ExecutiveHome** | Compõe sub-painéis limpos + disclaimer | Limpo |
| **ExplorationPanel** | Dados de `explorationSummary` e `seismicData` | Limpo |
| **FieldProductionBreakdown** | Dados de `fields[]` em `oilBlocks` | Limpo |
| **SwotAnalysis** | Gerado por IA via edge function | Limpo |
| **HomologacoesPanel** | `homologacoesData.ts` (1.072 registos reais) | Limpo |

## Valores de Fallback Identificados (não são fabricados, mas merecem atenção)

Estes são defaults `|| 20` (USD/bbl) usados quando `economicData.opexPerBarrel` não existe:

| Ficheiro | Linha | Fallback | Impacto |
|---|---|---|---|
| `economicScoring.ts` | L179, L221, L260 | `opexPerBarrel \|\| 20` | Blocos sem dados económicos recebem OPEX de $20/bbl |
| `scenarioEngine.ts` | L144, L239, L315 | `opexPerBarrel \|\| 20` | Cenários usam $20/bbl como proxy |
| `CostStructurePanel.tsx` | L39 | `opexPerBarrel \|\| 20` | Tabela de custos mostra $20/bbl para blocos sem dados |

Adicionalmente, `CostStructurePanel.tsx` L41 usa `opexPerBarrel + 5` como fallback para custo técnico quando não há dados de `technicalCost`.

### Decisão necessária:

Estes fallbacks são uma **escolha de design legítima** — permitem que os engines de scoring e cenários funcionem para todos os blocos. No entanto, os utilizadores podem interpretar esses valores como dados verificados.

## Recomendação

Não há mais dados fabricados visuais a limpar. A plataforma está consistente. Se desejar, posso:

1. **Adicionar indicadores visuais** nos painéis económicos (CostStructure, EconomicRisk, Scenarios) identificando quais valores são estimados vs verificados — semelhante ao que já existe no ProductionPanel com badges "Verificado"/"Pendente"
2. **Manter como está** — os fallbacks são razoáveis e os disclaimers existentes no ExecutiveHome e ProductionPanel cobrem a situação

