

## Painel Nacional HSE & Ambiente no Dashboard Executivo

### O que será criado
Um novo componente `HSENationalPanel.tsx` que agrega os dados de HSE e Ambiente dos 3 blocos verificados (0, 2/05, 3/05) numa vista nacional consolidada, adicionado como drill-down na Home Executiva.

### Dados disponíveis (por bloco)
- **Segurança**: FAT, LTI, RWC, MTC, FAC, NMI, HHR (M horas), TRIR, LTIR — séries 2018-2025
- **Ambiente**: Derrames (count + volume bbl), Oil-in-Water PPM, CO₂ (ton), Flaring MMSCFD — séries 2019-2025

### Layout do painel

**Linha 1 — KPI Cards agregados** (6 cards):
- Fatalidades (total acumulado) — com badge verde "Zero" se 0
- LTI (total último ano)
- TRIR Nacional (média ponderada por HHR)
- CO₂ Total (soma 3 blocos, último ano)
- Flaring Total (MMSCFD, soma)
- Derrames (total último ano)

**Linha 2 — Gráfico de tendências** (2 colunas):
- Esquerda: TRIR por bloco ao longo dos anos (LineChart com 3 linhas)
- Direita: Flaring + CO₂ tendências (BarChart empilhado por bloco)

**Linha 3 — Ranking por bloco** (tabela):
- Colunas: Bloco, TRIR, LTI, Derrames, Flaring, CO₂, Score HSE
- Score HSE calculado: normalização inversa (menor TRIR/flaring = melhor)
- Ordenável por qualquer coluna
- Medalha 🥇 para melhor performer

### Integração na Home Executiva

1. **Novo drill-down button** "HSE & Ambiente" com ícone `ShieldCheck` — o grid passa de 4 para 5 colunas
2. **DrillDown type** expandido: `"operadores" | "alertas" | "recomendacoes" | "homologacoes" | "hse"`
3. O painel abre como os outros drill-downs existentes

### Detalhes técnicos

**Ficheiro novo**: `src/components/dashboard/HSENationalPanel.tsx`
- Filtra `oilBlocks` para `pendingRealData === false` (3 blocos verificados)
- Agrega `hseData` e `environmentalData` por ano (soma/média ponderada)
- Calcula TRIR nacional = Σ(incidentes recordáveis × 200000) / Σ(HHR × 1000000)
- Ranking por score composto (TRIR 40%, Flaring 30%, Derrames 20%, Oil-in-Water 10%)

**Ficheiro editado**: `src/components/dashboard/ExecutiveHome.tsx`
- Import `HSENationalPanel` e `ShieldCheck`
- Expandir tipo `DrillDown` com `"hse"`
- Adicionar 5º botão drill-down
- Renderizar `<HSENationalPanel />` quando `expandedSection === "hse"`

### Ficheiros
1. `src/components/dashboard/HSENationalPanel.tsx` — novo
2. `src/components/dashboard/ExecutiveHome.tsx` — editar

