

## Adicionar Card "Tendência de Produção Nacional (2020–2026)" à Home Executiva

### Alteração

**`src/components/dashboard/ExecutiveHome.tsx`** — Adicionar import de `NationalProductionTrend` e inserir o componente entre `NationalHistoricalProduction` (1975–2023) e `NationalForecast2050` (2025–2050).

A ordem ficará:
1. KPIs
2. Histórico 1975–2023
3. **Tendência 2020–2026** (óleo + gás, duplo eixo) ← novo
4. Forecast 2025–2050

O componente `NationalProductionTrend` já existe em `src/components/dashboard/NationalProductionTrend.tsx` com o gráfico de duplo eixo (Area para óleo BOPD + Line para gás MMSCFD), conforme a imagem de referência.

