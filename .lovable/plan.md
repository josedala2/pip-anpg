

## Plano: Actualizar a Home Executiva com novos dados e KPIs

### Contexto
O utilizador quer reflectir dados actualizados de produção e integrar indicadores de Homologações na Home Executiva, além de adicionar novos KPIs/secções.

### Alterações

**1. Novos KPIs de Homologações no `KPICards.tsx`**
- Importar `homologacoesData` de `@/data/homologacoesData`
- Adicionar 2 novos KPIs derivados dos dados de homologações:
  - **Total Homologado** — soma do `montanteAprovado` (em $M), com ícone `FileText`, status neutral
  - **Taxa Aprovação** — percentagem de processos com `decisao === "Aprovado"` vs total, com semáforo (< 70% = warning, < 50% = critical)
- Actualizar sparkline de produção para reflectir valores mais recentes derivados de `getTotalProduction()`
- Ajustar grid para `md:grid-cols-6` (12 KPIs em 2 linhas de 6)

**2. Secção de Homologações na Home Executiva (`ExecutiveHome.tsx`)**
- Adicionar um novo botão de drill-down "Homologações" ao lado dos existentes (Operadores, Alertas, Recomendações)
- Quando expandido, renderiza um resumo compacto de homologações (mini-dashboard com os KPIs principais e gráfico de barras por mês)
- Grid de drill-down passa de `md:grid-cols-3` para `md:grid-cols-4`

**3. Actualização dos valores de produção**
- Os KPIs já lêem dinamicamente de `getTotalProduction()` e `getTotalReserves()` — valores actualizam automaticamente quando `angolaBlocks.ts` é alterado
- Actualizar os dados de sparkline estáticos para valores mais coerentes com a produção actual

### Ficheiros alterados
- `src/components/dashboard/KPICards.tsx` — novos KPIs de homologações, grid ajustado
- `src/components/dashboard/ExecutiveHome.tsx` — novo drill-down de homologações

