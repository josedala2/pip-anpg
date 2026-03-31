

## Actualizar Histórico da Produção Nacional com Dados Certificados (1975–2025)

### Dados extraídos do Excel

51 anos de produção (BOPD), de 1975 a 2025. Valores certificados diferentes dos actuais em vários anos. O dataset actual termina em 2023 — o novo inclui 2024 e 2025.

### Alterações

#### 1. Dados — `src/data/nationalForecast.ts`
- Substituir o array `nationalHistoricalFull` com os 51 valores certificados do Excel (1975–2025)
- Valores notáveis: Pico 2008 = **1,897,768** BOPD (era 1,900,000); 2025 = **1,036,763** BOPD

#### 2. Componente — `src/components/dashboard/NationalHistoricalProduction.tsx`
- Actualizar título: "(1975–2023)" → **(1975–2025)**
- Actualizar `peakValue`: 1,900,000 → **1,897,768**
- Actualizar badge: "Pico 2008: 1,9 MBOPD" → **"Pico 2008: 1,898 MBOPD"**

### Ficheiros afectados
- `src/data/nationalForecast.ts` — array `nationalHistoricalFull`
- `src/components/dashboard/NationalHistoricalProduction.tsx` — título, peakValue, badge

