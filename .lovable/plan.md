

## Melhorar Sparklines dos KPI Cards

Três ajustes no ficheiro `src/components/dashboard/ExecutiveKPICard.tsx`:

1. **Cores mais vivas** — Aumentar saturação e luminosidade nas `sparklineColors`:
   - neutral: `hsl(210, 70%, 50%)` (azul vivo)
   - healthy: `hsl(152, 65%, 45%)`
   - warning: `hsl(38, 90%, 55%)`
   - critical: `hsl(0, 75%, 50%)`

2. **Maior contraste no gradiente** — Subir opacidade do fill de `0.3` → `0.5` no stop superior

3. **Tamanho maior** — Aumentar container de `w-16 h-8` para `w-20 h-10`, stroke de `1.5` → `2`, e usar `type="natural"` para curva mais suave

