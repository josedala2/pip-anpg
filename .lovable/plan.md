

## Problema

O card "Repartição de Receitas" usa `height={280}` fixo no `ChartWrapper`. O conteúdo (título do período + donut chart 160px + legendas GE/Imp) excede esse espaço, cortando as percentagens no topo e os valores MMBO em baixo — exactamente o que se vê na screenshot.

## Solução

**`src/components/dashboard/EconomicVisionTab.tsx`** (linha 129):
- Aumentar `height` de `280` para `340` para dar espaço suficiente ao título do período, ao gráfico de donut e às legendas inferiores sem corte.

Uma única linha alterada.

