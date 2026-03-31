

## Adicionar Card "Histórico da Produção Petrolífera Nacional (1975–2023)"

### Contexto
A imagem de referência (Figura 2.3 do Relatório) mostra um gráfico de barras da produção anual de Angola de 1975 a 2023, com pico de ~1.9 MBOPD em 2008 e declínio gradual até ~1.1 MBOPD em 2023. Este card será colocado acima do "Tendência de Produção Nacional (2020–2026)" existente.

### Alterações

**1. `src/data/nationalForecast.ts`** — Adicionar array `nationalHistoricalFull` com dados anuais 1975–2023 (BOPD), extraídos da Figura 2.3:
- ~150k (1975) subindo gradualmente até ~750k (1999), depois salto para ~900k (2002), pico ~1.9M (2008), declínio até ~1.1M (2023)
- Incluir anotação do pico (média anual 1.9 MBOPD em 2008)

**2. `src/components/dashboard/NationalHistoricalProduction.tsx`** — Novo componente:
- Card com `ChartWrapper` ou `Card` simples
- Gráfico de barras verticais (Recharts `BarChart`) com cores em tom verde-escuro (similar ao relatório)
- Eixo Y formatado em milhares (ex: "500k", "1.0M", "1.5M")
- Anotação visual do pico (ReferenceLine ou label no ponto máximo)
- Legenda: "Média Anual de Produção: 1,9 MBOPD" no pico
- Nota de fonte: "Fonte: Relatórios anuais ANPG, 1975–2023"

**3. `src/components/dashboard/ExecutiveHome.tsx`** — Inserir `<NationalHistoricalProduction />` entre o bloco de KPIs e o `<NationalProductionTrend />` existente (linha 37).

### Dados aproximados (da imagem)
Anos-chave: 1975: 150k, 1980: 150k, 1985: 230k, 1990: 475k, 1995: 650k, 2000: 745k, 2002: 900k, 2005: 1250k, 2008: 1900k (pico), 2010: 1760k, 2015: 1780k, 2018: 1530k, 2020: 1255k, 2023: 1100k — com todos os anos intermediários.

