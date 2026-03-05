

## Plan: Melhorar Visualização dos Dados Gráficos

### Problemas Actuais Identificados
1. **Tooltips genéricos** — Sem formatação rica, sem ícones de cor, sem unidades consistentes
2. **Sem interactividade avançada** — Não há brush/zoom nos gráficos com muitos pontos (ex: poços 1966-2025)
3. **Legendas básicas** — Sem destaque visual, difíceis de ler em mobile
4. **Gráficos de barras empilhados com 5 séries** — Difíceis de ler quando há muitos anos; labels do eixo X sobrepostos
5. **Sem animações de entrada** — Os gráficos aparecem sem transição
6. **Gráficos de área sem referência** — Faltam linhas de média/tendência
7. **Cores repetidas entre abas** — Gradientes e IDs duplicados (ex: `prodGrad` usado em múltiplos gráficos)

### Melhorias Propostas

**1. Custom Tooltips com ChartTooltipContent**
- Substituir os `Tooltip` inline do Recharts por tooltips customizados usando o componente `ChartTooltipContent` do shadcn/ui (já existe em `chart.tsx`)
- Adicionar formatação por tipo: BOPD com separadores, $M com símbolo, km² com unidade
- Ícones de cor alinhados com a série

**2. Brush/Zoom nos Gráficos Temporais Longos**
- Adicionar `<Brush>` do Recharts no gráfico de Poços Perfurados (aba Exploração) e Sísmica, que cobrem 60+ anos
- Permite ao utilizador focar num intervalo temporal específico

**3. Animações de Entrada**
- Activar `isAnimationActive` com `animationDuration={800}` e `animationEasing="ease-out"` nos gráficos principais
- Adicionar `animationBegin` escalonado para séries múltiplas (barras aparecem sequencialmente)

**4. Labels do Eixo X Melhorados**
- Rodar labels a 45° nos gráficos com muitos anos (`angle={-45}`, `textAnchor="end"`)
- Usar `interval="preserveStartEnd"` para evitar sobreposição

**5. Linhas de Referência e Anotações**
- Adicionar `<ReferenceLine>` para média de produção no gráfico de tendência
- Adicionar `<ReferenceLine>` para meta de investimento no CAPEX

**6. IDs de Gradiente Únicos**
- Corrigir IDs duplicados (`prodGrad`) gerando IDs únicos por gráfico para evitar conflitos de renderização

**7. Responsividade das Legendas**
- Usar `Legend` com `wrapperStyle` melhorado: padding, font-size adaptativo, layout vertical em mobile

### Ficheiros a Modificar
- `src/pages/BlockPage.tsx` — Todos os gráficos da página de detalhe (produção, CAPEX, poços, sísmica, projecções, descobertas)
- `src/components/dashboard/ExplorationPanel.tsx` — Gráficos agregados de sísmica e poços no dashboard

### Impacto
Sem novos ficheiros. Sem alteração de dados. Apenas melhorias visuais e de interacção nos gráficos Recharts existentes.

