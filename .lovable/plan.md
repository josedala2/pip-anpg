

## Plano: Eliminar Dados Mock Restantes — Apenas Bloco 0 Real

### Problema

Após a limpeza anterior, ainda existem dados mock/fabricados em vários componentes do dashboard:

1. **KPICards.tsx**: Sparklines fabricadas (`prodSpark`, `reservesSpark`), variação de produção hardcoded (`-4.8%`), e sparkline de reservas com valores inventados (`[9200, 9180, ...]`)
2. **TrendProjection.tsx**: Função `generateTrendData()` que simula 12 meses históricos e 12 meses de projecção com factores multiplicativos inventados
3. **OverviewSidebar.tsx**: Sparklines fabricadas (`sparkData`), dados de investimento hardcoded (`investData` com valores de 2020-2024), e `computeTrendData()` com factores multiplicativos
4. **seismicHistory / wellsHistory** (angolaBlocks.ts): Estes são dados reais do Bloco 0 — manter

### Alterações

| Ficheiro | O que fazer |
|---|---|
| `src/components/dashboard/KPICards.tsx` | Remover sparklines fabricadas (`prodSpark`, `reservesSpark`). Remover `variation: -2.1` hardcoded. Manter KPIs que derivam de dados reais (contagens de blocos, homologações). |
| `src/components/dashboard/TrendProjection.tsx` | Substituir `generateTrendData()` por dados reais do `productionHistory` do Bloco 0. Remover projecções inventadas — mostrar apenas histórico real. Se não houver dados suficientes, mostrar mensagem "Dados reais pendentes". |
| `src/components/dashboard/OverviewSidebar.tsx` | Remover `sparkData` fabricado, remover `investData` hardcoded, remover `computeTrendData()` com factores multiplicativos. Substituir por dados derivados do Bloco 0 ou mostrar "Dados pendentes". |

### Princípio

Nenhum valor numérico inventado deve aparecer na UI. Se um dado não existe nos datasets reais (Bloco 0, homologações, contractInfo), deve aparecer como 0, "--", ou com o badge "Dados Pendentes".

### Dados reais disponíveis do Bloco 0
- `productionHistory`: 12 meses de produção real
- `capexHistory`: Dados CAPEX reais
- `facilityData`: Instalações reais
- `contractInfo`: Dados contratuais
- `seismicData`, `wellsData`, `fields`, `prospects`: Dados de exploração reais
- Homologações: 1.072 registos reais (manter intacto)

### Ficheiros a editar
- `src/components/dashboard/KPICards.tsx`
- `src/components/dashboard/TrendProjection.tsx`
- `src/components/dashboard/OverviewSidebar.tsx`

