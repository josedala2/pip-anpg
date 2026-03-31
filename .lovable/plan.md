

## Corrigir Valores RWDC no Bloco 0

### Problema
Os valores de RWDC (Restricted Work Day Cases) estão todos a 0 no `hseData` do Bloco 0, mas o documento oficial mostra valores reais.

### Alteração — `src/data/angolaBlocks.ts` (linhas 845-851)

Actualizar o campo `rwc` em cada entrada do `hseData` do Bloco 0:

| Ano | rwc actual | rwc correcto |
|-----|-----------|-------------|
| 2019 | 0 | 7 |
| 2020 | 0 | 2 |
| 2021 | 0 | 3 |
| 2022 | 0 | 9 |
| 2023 | 0 | 3 |
| 2024 | 0 | 5 |
| 2025 | 0 | 2 |

### Ficheiro afectado
- `src/data/angolaBlocks.ts`

