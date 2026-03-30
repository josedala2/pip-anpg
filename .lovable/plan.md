

## Actualizar Reservas do Bloco 0 para Recurso Descoberto

### Contexto
O campo `estimatedReserves` do Bloco 0 tem o valor **421 Mb** (placeholder genérico). O documento oficial indica **Recurso Descoberto (STOOIP) de 21.000 MMBO**, já registado em `explorationData.stooipMMBO`. O campo actual é usado em ~14 ficheiros (KPI cards, tabelas, agregações nacionais, chatbot).

### Consideração importante
421 Mb pode representar "reservas provadas" enquanto 21.000 MMBO é "recurso descoberto" (STOOIP — Stock-Tank Original Oil In Place). São métricas diferentes. Actualizar directamente para 21.000 distorceria os totais nacionais nos painéis de agregação (BlocksPanel, ExplorationPanel, OperatorsPanel).

### Abordagem proposta

**1. Actualizar `estimatedReserves` para 21.000** em `angolaBlocks.ts` (linha 517)

**2. Ajustar label na UI** para clarificar que se trata de Recurso Descoberto:
- `BlockPage.tsx` linha 399: mudar label de "Reservas Estimadas" para "Recurso Descoberto" e unidade para "MMBO"
- Quando `explorationData?.stooipMMBO` existir, usar esse valor; caso contrário, fallback para `estimatedReserves`

**3. Painéis de agregação** — manter `estimatedReserves` como campo usado, mas como o Bloco 0 é o único com valor significativo, o impacto é proporcional. As tabelas em BlocksPanel e OperatorsPanel já mostram "MMbbl" — ajustar header para "Recurso (MMBO)".

### Ficheiros a alterar
1. `src/data/angolaBlocks.ts` — linha 517: `estimatedReserves: 21000`
2. `src/pages/BlockPage.tsx` — linha 399: label e lógica de fallback
3. `src/components/dashboard/BlocksPanel.tsx` — linha 115: label "Recurso"
4. `src/components/dashboard/OperatorsPanel.tsx` — linha 458: header de coluna

