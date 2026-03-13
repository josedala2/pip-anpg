

## Substituir Sparklines por Indicador Visual de Tendência

Os sparklines baseados em Recharts `AreaChart` não renderizam bem no tamanho pequeno dos KPI cards. A alternativa é substituí-los por uma **barra de tendência CSS pura** — uma mini progress bar horizontal que mostra a direcção da tendência dos últimos meses, sem dependência de SVG/Recharts.

### Abordagem: Mini Trend Bar com CSS

Para os dois cards que têm dados de tendência (Produção Nacional e Reservas Estimadas), substituir o sparkline por:

- **6 barras verticais finas** lado a lado (como um mini bar chart), cada uma representando um mês
- Altura proporcional ao valor (normalizada entre min/max dos dados)
- Cor baseada no `status` do card
- Tudo em CSS/HTML puro — sem Recharts, sem SVG, sem problemas de gradientes

### Alterações

**`src/components/dashboard/ExecutiveKPICard.tsx`**:
1. Remover imports de `Area`, `AreaChart`, `ResponsiveContainer` do Recharts
2. Remover toda a lógica de `gradientId` e `sparklineColors`
3. Substituir o bloco do `AreaChart` por um componente inline de mini barras:
   - Container `flex items-end gap-0.5 h-10 w-20`
   - Cada barra: `div` com `width: 3px`, `border-radius`, altura calculada como percentagem entre min e max dos dados
   - Cor via classes Tailwind baseadas no status (`bg-primary`, `bg-success`, etc.)

**`src/components/dashboard/KPICards.tsx`**:
- Sem alterações — os dados `sparkline` continuam a ser passados normalmente

### Resultado Visual

```text
  ▌       ▌
  ▌   ▌   ▌
  ▌ ▌ ▌ ▌ ▌
  ▌ ▌ ▌ ▌ ▌ ▌
```

Barras verticais minimalistas, 100% CSS, sem problemas de renderização SVG.

