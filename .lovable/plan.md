

## Actualizar Previsões de Produção Nacional com Dados Certificados do Excel

### Contexto
O ficheiro Excel "EHA - Previsões de Produção" contém dados certificados detalhados para 2025–2050. O modelo actual em `nationalForecast.ts` tem apenas 3 categorias (Base, FID, Sem FID) com valores aproximados. O Excel revela uma **4ª categoria importante**: **Blocos em Exploração e Novas Concessões** (por bacia), que actualmente não está representada.

### Dados do Excel — Totais Angola (BOPD → kBOPD)

| Ano | Base | c/ FID | s/ FID | Exploração+Novas | Total |
|-----|------|--------|--------|-----------------|-------|
| 2025 | 1037 | 0 | 0 | 0 | 1037 |
| 2026 | 1050 | 1 | 0 | 0 | 1051 |
| 2027 | 1008 | 8 | 0 | 0 | 1017 |
| 2028 | 966 | 65 | 0 | 1 | 1032 |
| 2029 | 891 | 146 | 0 | 15 | 1052 |
| 2030 | 796 | 275 | 52 | 12 | 1135 |
| ... | ... | ... | ... | ... | ... |
| 2040 | 228 | 86 | 199 | 1020 | 1533 (est.) |
| 2041 | 201 | 72 | 176 | 1214 | 1663 |
| 2050 | 63 | 4 | 39 | 914 | 1020 |

O **pico** é ~**1 682 kBOPD** em 2040, validando o valor actual mas com composição diferente.

### Alterações

#### 1. Modelo de dados — `src/data/nationalForecast.ts`
- Adicionar campo `newConcessions: number` (kBOPD) à interface `ForecastYear` para a 4ª categoria (Blocos em Exploração e Novas Concessões)
- Substituir os 26 registos de `nationalForecast` com os valores certificados do Excel, convertidos de BOPD para kBOPD (÷1000, arredondado)
- A 4ª categoria = soma das linhas: Baixo Congo offshore + Baixo Congo onshore + Kwanza onshore + Kwanza offshore + Benguela + Namibe + Interiores
- Actualizar `forecastProjects` se necessário para alinhar com os projectos do Excel

#### 2. Gráfico — `src/components/dashboard/NationalForecast2050.tsx`
- Adicionar 4ª barra empilhada `newConcessions` com cor distinta (ex: `hsl(var(--chart-4))`)
- Actualizar labels no Tooltip e Legend: "Exploração & Novas Concessões"
- Actualizar domínio Y para acomodar novos totais
- Actualizar annotations (2025 e pico) com valores certificados
- Actualizar ReferenceLine de 1020 para o valor de referência correcto

### Ficheiros afectados
- `src/data/nationalForecast.ts` — dados e interface
- `src/components/dashboard/NationalForecast2050.tsx` — gráfico com 4ª categoria

