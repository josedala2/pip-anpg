

## Substituir "Tendência de Produção Nacional (2020–2026)" pelo Forecast 2025–2050

### Contexto
O card `NationalProductionTrend` (2020–2026) será substituído por um novo card com stacked bar chart mostrando a previsão 2025–2050, conforme a imagem de referência. Os dados já existem em `nationalForecast` mas precisam de correcção (o pico de 1.682 kBOPD deve estar em 2041, não em 2050).

### Alterações

**1. `src/data/nationalForecast.ts`** — Corrigir os valores do `nationalForecast` para que o pico (~1.682) ocorra em 2041 e o valor em 2050 desça para ~1.020, conforme a imagem. Os valores de 2025 (1.051) também serão ajustados.

**2. `src/components/dashboard/NationalForecast2050.tsx`** (novo) — Stacked BarChart com:
- 3 séries: `baseProduction` (cinza), `discoveredWithFID` (azul escuro), `discoveredWithoutFID` (azul claro)
- Eixo Y: "Mil bopd" (0–1800)
- Anotações: "1 051" em 2025, "1 682" em 2041 (pico)
- Linha tracejada de referência horizontal (~1.020)
- Legenda compacta
- Fonte: "Estado das Concessões 2026, ANPG"

**3. `src/components/dashboard/ExecutiveHome.tsx`** — Substituir import e uso de `NationalProductionTrend` por `NationalForecast2050`.

