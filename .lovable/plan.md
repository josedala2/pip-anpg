

## Plano: Limpeza de Dados Mock — Manter Estrutura, Marcar como Pendente

### Contexto

O ficheiro `angolaBlocks.ts` tem ~7.400 linhas com 83 blocos. O **Bloco 0** tem dados reais verificados (contrato, instalações, HSE, visão económica). Os blocos **3/05**, **4**, **1/14** e **2/05** têm `contractInfo` real. Todos os outros blocos têm dados numéricos fabricados (produção, reservas, CAPEX, projecções, HSE, facilityData, economicVision).

Os dados considerados **reais** e a manter:
- **Bloco 0**: Todos os campos (dados verificados da ANPG)
- **Todos os blocos**: Operador, consórcio/participações, fase, bacia, tipo de água, área, data de contrato — dados do Mapa de Concessões ANPG 2026
- **Blocos com contractInfo real**: 0, 3/05, 4, 1/14, 2/05 — manter contractInfo
- **Homologações**: Dataset real (1.072 registos) — manter intacto

Os dados considerados **mock** e a zerar:
- `dailyProduction`, `estimatedReserves`, `accumulatedInvestment`, `plannedInvestment`, `executionRate`, `riskScore`, `complianceScore`
- `productionHistory`, `capexHistory`, `projections`
- `seismicData`, `wellsData`, `fields`, `prospects` (excepto Bloco 0 e blocos com dados reais conhecidos)
- `facilityData`, `economicVision`, `hseData`, `environmentalData`, `developmentProjects`
- `economicData`, `explorationSummary`

### Implementação

#### 1. Adicionar flag `pendingRealData` ao tipo `OilBlock`

Novo campo booleano opcional na interface. Blocos com dados reais não terão o flag (ou `false`). Todos os outros terão `pendingRealData: true`.

#### 2. Limpar dados numéricos dos blocos sem dados reais

Para todos os blocos **excepto Bloco 0** (e outros com dados contratuais reais como 3/05, 4, 1/14):
- Zerar: `dailyProduction: 0`, `estimatedReserves: 0`, `accumulatedInvestment: 0`, `plannedInvestment: 0`, `executionRate: 0`, `riskScore: 0`, `complianceScore: 0`
- Esvaziar arrays: `productionHistory: []`, `capexHistory: []`, `projections: { conservative: [], base: [], expansion: [] }`
- Remover campos opcionais fabricados: `seismicData`, `wellsData`, `fields`, `prospects`, `facilityData`, `economicVision`, `hseData`, `environmentalData`, `developmentProjects`, `economicData`, `explorationSummary`
- Adicionar `pendingRealData: true`

#### 3. Indicador visual "Dados Pendentes" nos componentes UI

Actualizar componentes-chave para mostrar um badge discreto quando `pendingRealData === true`:

- **BlocksPanel / ConselhoPanel**: Badge "Dados Pendentes" ao lado do nome do bloco
- **KPICards**: Os KPIs nacionais passarão a reflectir apenas dados reais (produção ~119k BOPD do Bloco 0)
- **Painéis de detalhe** (BlockDetail, ProductionPanel, etc.): Mensagem "Dados reais ainda não carregados" quando o bloco não tem dados

#### 4. Componente `PendingDataBadge`

Pequeno componente reutilizável com ícone de alerta e texto "Dados Pendentes" em tom amarelo/âmbar.

#### 5. Guardar funções auxiliares

As funções `getTotalProduction`, `getActiveBlocks`, etc., continuarão a funcionar mas reflectirão apenas dados reais.

### Ficheiros a editar

| Ficheiro | Alteração |
|---|---|
| `src/data/angolaBlocks.ts` | Adicionar `pendingRealData` à interface; zerar dados mock em ~80 blocos |
| `src/components/dashboard/BlocksPanel.tsx` | Badge "Dados Pendentes" |
| `src/components/dashboard/ConselhoPanel.tsx` | Badge na matriz de decisão |
| `src/components/dashboard/BlockDetail.tsx` | Mensagem de dados não disponíveis |
| `src/components/dashboard/ExecutiveHome.tsx` | Nota sobre dados parciais |
| Novo: `src/components/ui/PendingDataBadge.tsx` | Componente reutilizável |

### Impacto esperado

- KPIs nacionais mostrarão apenas a realidade actual (Bloco 0: ~119k BOPD)
- A plataforma ficará preparada para carregamento incremental de dados reais
- Visualmente claro quais blocos têm dados reais vs pendentes

### Notas técnicas

- O ficheiro `angolaBlocks.ts` passará de ~7.400 para ~3.000-4.000 linhas (remoção de dados fabricados)
- O dataset de homologações (`homologacoesData.ts`) **não será alterado** — dados reais
- Os dados globais de exploração (`seismicHistory`, `wellsHistory` no final do ficheiro) serão avaliados — se forem do Bloco 0, mantêm-se

