

## Strategic Forecast -- Breakdown por Bloco & Sensibilidade ao Preço

### Alterações no ficheiro `src/components/dashboard/StrategicForecast.tsx`

**1. Slider de Preço do Barril**
- Substituir o valor fixo `$75/bbl` por um `Slider` interactivo (range $40-$120, step $5, default $75).
- Exibir o valor seleccionado junto ao slider. Todos os KPIs de receita recalculam em tempo real.

**2. Tabela de Breakdown por Bloco**
- Nova secção abaixo do gráfico agregado: tabela com colunas `Bloco | Produção Actual | Projecção 2029 | Variação % | Receita Est. (2029)`.
- Dados derivados de `oilBlocks`, filtrados pelo cenário activo e preço do barril seleccionado.
- Ordenada por produção projectada (desc). Linhas clicáveis para navegar à página do bloco.
- Incluir linha de totais no footer.

**3. Gráfico Stacked Area por Bloco**
- Novo card com `AreaChart` (Recharts) mostrando a contribuição de cada bloco ao longo dos 10 anos, para o cenário activo.
- Cada bloco com cor distinta. Permite ver quais blocos crescem vs declinam.

**4. Layout Actualizado**
```text
┌─────────────────────────────────────────┐
│ Cenário Selector  |  Slider Preço $/bbl │
├─────────────────────────────────────────┤
│ 10-Year Aggregate Line Chart (existente)│
├─────────────────────────────────────────┤
│ Stacked Area Chart — Contribuição/Bloco │
├──────────────┬──────────────────────────┤
│ KPI Cards x3 │  (receita usa slider)   │
├──────────────┴──────────────────────────┤
│ Tabela Breakdown por Bloco              │
└─────────────────────────────────────────┘
```

### Detalhes Técnicos
- Importar `Slider` de `@/components/ui/slider`, `useNavigate` de `react-router-dom`, `AreaChart`/`Area` de `recharts`.
- Usar `Table`/`TableHeader`/`TableRow`/`TableCell` de `@/components/ui/table`.
- Estado: `oilPrice` via `useState<number[]>([75])`.
- Paleta de cores para blocos: gerar a partir de `hsl(${i * 25}, 70%, 55%)` para N blocos.
- Filtrar blocos sem produção (todos zeros) do stacked chart para evitar ruído.

