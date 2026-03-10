

## Actualizar Dados de Produção e Criar Aba "Produção"

### Contexto
As imagens de referência da ANPG mostram a distribuição real de produção por bloco (2025) e previsões até 2050. Os dados actuais no sistema não reflectem estas percentagens. Total nacional: ~1,050,000 BOPD.

### 1. Actualizar `dailyProduction` em `src/data/angolaBlocks.ts`

Baseado na imagem "Distribuição da Produção por Blocos" (slide 6), recalcular para um total de ~1,050,000 BOPD:

| Bloco | % (ANPG) | BOPD (novo) | BOPD (actual) |
|-------|----------|-------------|---------------|
| Block 0 | 9.36% | 98,280 | 119,285 |
| Block 2/05 | 0.89% | 9,345 | n/a (novo) |
| Block 3/05 | 4.77% | 50,085 | 68,000 |
| Block 3/05A | 4.90% | 51,450 | n/a (novo) |
| Block 4/05 | 0.27% | 2,835 | 0 |
| Block 14 | 12.86% | 135,030 | 98,000 |
| Block 14K | 0.02% | 210 | 0 |
| Block 15 | 30.97% | 325,185 | 185,000 |
| Block 15/06 | 11.51% | 120,855 | 200,000 |
| Block 17 | 17.31% | 181,755 | 320,000 |
| Block 17/06 | 1.98% | 20,790 | n/a (novo) |
| Block 18 | 1.44% | 15,120 | 115,000 |
| Block 31 | 3.48% | 36,540 | 150,000 |
| Block 32 | 0.10% | 1,050 | 45,000 |
| FS/FST | 0.08% | 840 | n/a (novo) |

- Actualizar `dailyProduction` e `productionHistory` de cada bloco existente.
- Adicionar blocos em falta (Block 2/05, 3/05A, 17/06, FS/FST) como novos entries no dataset ou mapear a blocos existentes onde aplicável.
- Actualizar `OverviewSidebar` para recalcular dinamicamente as bacias em vez de usar valores hardcoded.

### 2. Adicionar dados de previsão a médio-longo prazo

Novo campo opcional na interface `OilBlock`:
```typescript
productionForecast?: { year: number; base: number; withFID: number; withoutFID: number }[];
```

Dados agregados nacionais (da imagem 2-3) para uso no painel:
- Previsão 2026-2050, pico 1.6 MMbopd @ 2037
- Médias: 2025-2030: 1.0 MMbopd; 2031-2040: 1.4 MMbopd; 2041-2050: 0.8 MMbopd

### 3. Criar componente `ProductionPanel` (`src/components/dashboard/ProductionPanel.tsx`)

Novo painel com as seguintes secções:

**A. KPIs de Produção** -- Total nacional BOPD, variação YoY, meta 2026, taxa de cumprimento.

**B. Distribuição por Blocos (Pie Chart)** -- Replicar o gráfico da ANPG com percentagens por bloco. Recharts `PieChart` com labels externas.

**C. Distribuição por Campo/Instalação (Treemap ou Pie)** -- Dados dos campos dentro de cada bloco (usando `fields` existentes).

**D. Histórico e Previsão de Produção (Stacked Bar)** -- Gráfico stacked bar inspirado no slide 1 da ANPG, mostrando contribuição por bloco ao longo dos anos (histórico + projecção).

**E. Previsão Médio-Longo Prazo** -- Gráfico com 3 layers: Produção de Base, Oportunidades com FID, Oportunidades sem FID (inspirado nos slides 2-3). Referência line a 1M BOPD. Notas de pressupostos.

**F. Tabela de Produção por Bloco** -- Tabela detalhada com: Bloco, Operador, Produção Actual, % Total, Bacia, Fase. Ordenável e filtrável.

### 4. Registar aba na navegação (`src/pages/Index.tsx`)

- Adicionar "Produção" ao array `panels` (posição 2, entre "Blocos & Concessões" e "Exploração").
- Renderizar `<ProductionPanel />` quando `activePanel === 2`.
- Ajustar índices dos painéis seguintes.

### 5. Actualizar `OverviewSidebar`

- Substituir dados hardcoded de `basins` e `trendData` por cálculos dinâmicos a partir de `oilBlocks`.

### Ficheiros a modificar/criar:
- `src/data/angolaBlocks.ts` -- actualizar dailyProduction, adicionar blocos em falta
- `src/components/dashboard/ProductionPanel.tsx` -- novo componente
- `src/pages/Index.tsx` -- adicionar aba
- `src/components/dashboard/OverviewSidebar.tsx` -- dados dinâmicos

