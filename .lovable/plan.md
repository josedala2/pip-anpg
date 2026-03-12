

## Plan: Aba "Visão Económica" para o Bloco 0

### Objectivo
Criar uma aba dedicada à visão económica que reproduza os painéis apresentados nas imagens de referência ANPG: NPV por período, fluxo de caixa histórico e projectado, repartição de receitas, custos (CAPEX/OPEX), custos de abandono, plano de investimentos quinquenal e partilha de produção.

### 1. Estender o modelo de dados

**Ficheiro:** `src/data/angolaBlocks.ts`

Adicionar campos ao `EconomicVision` e `EconomicData` para suportar os gráficos detalhados:

- `EconomicVision`: adicionar `npvByPeriod` (array com período, valor GE e valor Impostos para as 3 barras: "Até 2021", "2022-2025", "Point Forward") e `cashFlowTimeSeries` (array year/ge/impostos para o gráfico de barras empilhadas 2004-2050)
- `EconomicData`: adicionar `revenueShare` (array com período, %GE, %Impostos, geMMBO, impostosMMBO) para os gráficos de pizza, e `abandonmentDetail` (abandonoPontual, valorFundeamento, valorFundeado, dividaSonangol) para o gráfico horizontal

Preencher estes campos para o Block 0 com os dados das imagens:
- NPV até 2021: GE 49.038, Impostos 261.049
- NPV 2022-2025: GE 3.532, Impostos 8.030
- NPV PF: GE 1.840, Impostos 3.098
- Cash flow: série temporal 2004-2050 (GE + Impostos)
- Receitas: 3 períodos com pie charts (57/43%, 35/65%, 16/84%)
- Custos: 3 períodos CAPEX+OPEX empilhados
- Abandono: total 3.420, pontual 2.365, fundeamento 1.300, fundeado 102, dívida 48
- Custo técnico por barril: CAPEX 17.0 + OPEX 11.7, Opex 2025 = 26.3

### 2. Novo componente

**Novo ficheiro:** `src/components/dashboard/EconomicVisionTab.tsx`

Componente que recebe `block: OilBlock` e renderiza:

1. **NPV por Período** — 3 pares de barras (GE vs Impostos) para cada período temporal
2. **Fluxo de Caixa (MMUSD)** — BarChart empilhado (Impostos + GE) de 2004 a 2050, com inset de detalhe 2026-2050
3. **Repartição de Receitas** — 3 PieCharts lado a lado com legendas (MMBO em levantamentos e direitos)
4. **Custos Incorridos e Previsão** — BarChart empilhado CAPEX/OPEX por período
5. **Custo Técnico por Barril** — Barra horizontal segmentada (CAPEX_BO + OPEX_BO + marker Opex 2025)
6. **Abandono** — Barras horizontais (total, pontual, fundeamento, fundeado, dívida)
7. **Plano de Investimentos Quinquenal** — BarChart empilhado por categoria (Exploração, Desenvolvimento, Operação, Admin, Cash Call) com linha de tendência Cash Call Sonangol
8. **Partilha de Produção GE** — BarChart simples (MMBO/ano) com anotação do total
9. **Principais Observações** — Lista de bullet points do `economicData.observations` e `economicVision.strategicObservations`

Usa recharts (já instalado) e componentes UI existentes (Card, Badge).

### 3. Integrar no BlockPage

**Ficheiro:** `src/pages/BlockPage.tsx`

- Adicionar `TabsTrigger` com value `"economic-vision"` e ícone `Scale` (ou `TrendingUp`), posicionada após "Estado da Concessão"
- Renderizar condicionalmente quando `block.economicVision` ou `block.economicData` existirem
- Importar e usar `EconomicVisionTab`

### Resumo de ficheiros alterados
- `src/data/angolaBlocks.ts` — extensão das interfaces + dados do Bloco 0
- `src/components/dashboard/EconomicVisionTab.tsx` — novo componente
- `src/pages/BlockPage.tsx` — nova aba

