

## Adicionar Gráfico Histórico — Perfil de Produção ao Relatório "Produção & Declínio"

### Alteração

#### `src/components/reports/ReportPreview.tsx` — `ProductionSection` (~linha 885, após o gráfico de projecção)

Para cada bloco que tenha `historicalAnnualProduction` (array não vazio), renderizar um `ChartCard` com um `BarChart` (recharts) mostrando o perfil histórico+previsão, replicando a lógica visual do componente `HistoricalProductionProfile`:

- Barras verdes sólidas para `type === "historical"`, semi-transparentes para `"forecast"`
- `ReferenceLine` vertical a separar histórico de previsão
- Eixo Y formatado em `k` (milhares)
- Título dinâmico: `Histórico — Perfil de Produção · {blockName}`
- Condicionado a `showCharts` (como os restantes gráficos da secção)
- Importar `ReferenceLine` e `Cell` do recharts (já importados no ficheiro)

### Ficheiro afectado
- `src/components/reports/ReportPreview.tsx`

