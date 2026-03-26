

# Actualizar Plataforma para 3 Blocos com Dados Reais

## Contexto
A plataforma tem 124 blocos no dataset, mas apenas **Bloco 0, Bloco 2/05 e Bloco 3/05** possuem dados operacionais verificados. Vários componentes contêm valores hardcoded, banners desactualizados e referências que não reflectem esta realidade.

## Alterações Identificadas

### 1. Corrigir Banner de Disclaimer
**Ficheiro:** `ExecutiveHome.tsx` (linha 29)
- Texto actual: *"apenas o Bloco 0 possui informação operacional verificada"*
- Novo texto: *"Blocos 0, 2/05 e 3/05 possuem informação operacional verificada"*

### 2. Remover Valores Fabricados do ProductionPanel
**Ficheiro:** `ProductionPanel.tsx` (linhas 110-113)
- Remover `prevYearTotal = 1080000` (valor inventado)
- Remover `target2026 = 1100000` (meta inventada)
- Remover cálculos derivados `yoyChange` e `targetCompliance`
- Remover da UI quaisquer indicadores YoY e "cumprimento de meta" que dependam destes valores

### 3. Corrigir Threshold no ConselhoPanel
**Ficheiro:** `ConselhoPanel.tsx` (linha 303)
- Remover comparação hardcoded `macro.totalProduction > 1100000` para determinar trend
- Substituir por lógica baseada nos dados reais (ou remover seta de trend)

### 4. Auditar Componentes Económicos
**Ficheiros:** `economicScoring.ts`, `StrategicForecast.tsx`, `GeneralForecastPanel.tsx`, `EconomicFinancialPanel.tsx`
- `BRENT_PRICE = 78` — é uma referência de mercado aceitável, não dados do bloco
- Os cenários e scorings já iteram sobre `oilBlocks` e processam os dados que existem — verificar que não geram métricas fictícias para blocos sem dados económicos reais
- Os painéis de Cenários e Previsão Geral utilizam `economicPlan`, `opexHistory`, etc. — apenas os 3 blocos com dados reais contribuem valores significativos

### 5. Verificar Restantes Painéis
- **FacilitiesIntegrityPanel**: Filtra blocos com `facilityData` — apenas Bloco 0 e 2/05 contribuem
- **ExplorationPanel**: Usa `seismicData`, `wellsData`, `prospects` — apenas blocos com dados reais aparecem
- **ContractCompliancePanel**: Usa `contractInfo` de todos os blocos — os 3 blocos têm dados detalhados, os restantes têm metadados estruturais do mapa ANPG (aceitável)
- **KPICards**: Agrega de `oilBlocks` — os KPIs reflectem naturalmente os dados reais existentes

### Resumo de Impacto
| Componente | Acção |
|---|---|
| ExecutiveHome banner | Actualizar texto para 3 blocos |
| ProductionPanel | Remover 3 constantes hardcoded + UI derivada |
| ConselhoPanel | Remover threshold 1.1M hardcoded |
| Restantes painéis | Sem alterações necessárias (já derivam dos dados) |

