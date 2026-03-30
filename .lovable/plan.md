

## Rever Layout da Visão Económica — Bloco 0

Alinhar a apresentação visual com o documento oficial da ANPG (imagem partilhada).

### Alterações ao layout (`EconomicVisionTab.tsx`)

**1. NPV por Período — 3 gráficos separados + Observações**
- Substituir o gráfico de barras agrupado único por **3 gráficos de barras individuais** lado a lado (NPV até 2021, NPV 2022-2025, NPV Point Forward), cada um com duas barras (GE azul, Impostos amarelo)
- Colocar o painel de **Observações** à direita dos 3 gráficos NPV (layout 3+1 colunas em XL), em vez de ficar isolado no final da página

**2. Repartição de Receitas — Pies com split GE Custos/Lucros**
- Adicionar um **mini-pie secundário** ao lado de cada pie principal, mostrando a decomposição do GE em "GE Custos" e "GE Lucros"
- Requer novos campos na interface `RevenueSharePeriod`: `geCustosPercent`, `geCustosMMUSD`, `geLucrosPercent`, `geLucrosMMUSD`
- Adicionar **labels "Levantamentos"** abaixo dos períodos 1 e 2, e **"Direitos"** abaixo do período 3 (2026-2050), com os valores MMBO correspondentes

**3. Dados adicionais** (`angolaBlocks.ts`)
- Expandir os 3 objectos `revenueShare` do Bloco 0 com os novos campos:
  - 2004-2021: GE Custos 71% (41.095), GE Lucros 29% (17.040)
  - 2022-2025: GE Custos 78% (8.451), GE Lucros 22% (2.448)
  - 2026-2050: GE Custos 93% (24.030), GE Lucros 7% (1.815)
- Adicionar campo `liftingLabel` ("Levantamentos" para períodos 1-2, "Direitos" para período 3)

### Ficheiros a alterar
1. `src/data/angolaBlocks.ts` — interface `RevenueSharePeriod` + dados do Bloco 0
2. `src/components/dashboard/EconomicVisionTab.tsx` — refactoring do layout

### Sem impacto
Os restantes painéis (Cash Flow, Custos, Abandono, Plano de Investimentos, Partilha de Produção) mantêm-se inalterados.

