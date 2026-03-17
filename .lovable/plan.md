

## Plan: Wrap Homologações Charts with ChartWrapper

The project already has a `ChartWrapper` component that provides download-as-PNG and fullscreen functionality for any chart. The Homologações panel currently renders charts directly inside `Card` components with raw `ResponsiveContainer`.

### Approach

Replace each `Card > CardHeader > CardContent > ResponsiveContainer` chart block in `HomologacoesPanel.tsx` with the existing `ChartWrapper` component. This gives every chart the hover-reveal download button, fullscreen modal, and watermark on export — consistent with the rest of the dashboard.

### Charts to wrap (8 total)

1. **Montante Aprovado por Bloco (Top 10)** — BarChart (line ~532)
2. **Repartição por Categoria** — PieChart (line ~548)
3. **Top 10 Fornecedores por Montante** — BarChart (line ~566)
4. **Evolução Mensal** — LineChart (line ~582)
5. **Comparação Anual** — BarChart (line ~599)
6. **Conteúdo Local — Donut** — PieChart (line ~705)
7. **Tendência CL — % por Nº de Processos** — BarChart (line ~870)
8. **Tendência CL — % por Valor Aprovado** — LineChart (line ~891)

### Implementation

- Import `ChartWrapper` from `@/components/dashboard/ChartWrapper`
- For each chart, replace `<Card className="glass-card">` + `CardHeader` + `CardContent` + `ResponsiveContainer` with `<ChartWrapper title="..." height={300}>` containing just the Recharts chart
- For charts 7 and 8 (trend sub-charts inside a single card), wrap the parent card and keep both charts inside, or split into two separate `ChartWrapper` instances
- Remove redundant `Card`/`CardHeader`/`CardContent` imports if no longer needed elsewhere (they are still used for KPIs and other non-chart sections, so they stay)

### No database or backend changes required.

