

## Actualização dos Dados de HSE & Ambiente do Bloco 0

### Dados extraídos do PDF

**HSE — Tabela de indicadores (2018–2025):**

| Indicador | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|-----------|------|------|------|------|------|------|------|------|
| HHR | 20 328 068 | 22 206 371 | 13 818 074 | 11 797 829 | 19 651 412 | 15 439 734 | 17 163 938 | 16 042 733 |
| TRIR | 0.10 | 0.13 | 0.13 | 0.12 | 0.10 | 0.18 | 0.24 | 0.11 |
| LTIR | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

- Zero FAT e zero LTI nos últimos cinco anos
- MTC: 1 (2022) → 11 (2023) → 16 (2024) → 7 (2025)
- FAC: tendência crescente de 16 (2021) a 34 (2025)
- NMI: pico de 35 em 2024

**Ambiente:**
- Oil-in-Water média 2019–2025: 5,42 ppm (abaixo dos 30 ppm legais), aumento no último ano
- Derrames: apenas 1 em 2025, volume de 4,81 barris (causa: corrosão)
- Gás queimado: valores do gráfico ~27.98, 27.06, 17.52, 18.70, 14.63, 14.01, 10.39, 10.54 (2019–2025 aprox.)
- Emissões CO₂: redução gradual, maior valor em 2019 (3 898 642 ton), total 7 anos = 24 563 385 ton

**Instalações:**
- Produção 2025: 43 539 025 bbls (já no sistema)
- Perdas: 2 830 691 bbls (já no sistema)
- Eficiência: 88% (já no sistema)
- Poços activos: 358 OP, 78 WI, 27 GI (já no sistema)

### Alterações em `src/data/angolaBlocks.ts` — Bloco 0

**1. Expandir `hseData` de 5 para 8 anos (2018–2025) com dados reais do PDF:**
- Substituir os dados actuais (2021–2025 com valores estimados) pelos valores oficiais
- fat=0 e lti=0 em todos os anos (zero FAT e zero LTI)
- TRIR e LTIR exactos da tabela
- HHR convertido para milhões (ex: 20.33)
- MTC: 0,0,0,0,1,11,16,7
- FAC: 0,0,0,16,20,24,28,34 (tendência crescente desde 2021)
- NMI: 0,0,0,0,0,0,35,0 (pico em 2024)

**2. Actualizar `environmentalData` para reflectir dados reais:**
- Oil-in-Water: média de 5,42 ppm; aumento no último ano (valores ajustados)
- Derrames 2025: count=1, volume=4.81 bbl (fuga por corrosão)
- Gás queimado: valores reais do gráfico
- Emissões CO₂: valor 2019 = 3 898 642 ton, redução gradual
- Expandir para 2019–2025 (7 anos)

**3. Sem alterações em componentes UI** — os componentes HSE e Ambiente já consomem `hseData` e `environmentalData` dinamicamente.

### Resumo
Edição apenas no ficheiro `src/data/angolaBlocks.ts`, secção do Bloco 0, actualizando `hseData` e `environmentalData` com os valores oficiais do documento PDF.

