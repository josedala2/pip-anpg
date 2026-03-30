

## Actualizar Dados de Gás Natural com Documento Oficial

### Diferenças identificadas entre dados actuais e imagem oficial

**1. Dados históricos (gasUtilization) — correcções:**

| Ano | Campo | Actual | Correcto (imagem) |
|-----|-------|--------|-------------------|
| 2017 | exportedALNG | 1387 | **727** |
| 2017 | deviations | 340 | **638** |
| 2018 | exportedALNG | 727 | **1198** |
| 2018 | deviations | 321 | **784** |
| 2019 | exportedALNG | 1198 | **1089** |
| 2020 | gasLift | 139 | **340** |
| 2020 | deviations | 329 | **321** |
| 2021 | deviations | 166 | **152** |
| 2022 | deviations | 317 | **137** |
| 2025 | injected | null | **1267** |
| 2025 | fuel | null | **109** |
| 2025 | gasLift | null | **313** |
| 2025 | deviations | null | **176** |

Os valores ALNG de 2017 e 2018 estavam trocados. O ano 2025 passa a ter dados completos.

**2. Observações — texto actualizado do documento:**
- Obs 1: Adicionar referência ao Bloco 0 e SLGC
- Obs 2: Adicionar referência ao "sistema de medição efectivo (desvios)"
- Obs 3: Reforçar "abastecimento doméstico"
- Remover obs 5 (défice) — já está coberta no painel de forecast

**3. Recomendações — texto actualizado:**
- Rec 1: Adicionar "com base na medição e regulamentação efectiva"
- Rec 3: Adicionar "mantendo a segurança dos reservatórios e benefício económico do Bloco"

**4. Dados de forecast (imagem 2):** Já estão correctos — sem alterações necessárias.

### Ficheiro a alterar
`src/data/gasUtilization.ts` — linhas 13-23 (dados históricos), 47-53 (observações), 56-60 (recomendações)

