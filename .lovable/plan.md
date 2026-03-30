

## Remover Sísmica 4D do Bloco 0

### Problema
O campo `totalSeismic4DKm2: 8082` no `explorationSummary` do Bloco 0 não tem suporte no documento oficial — que refere apenas 2D (23.816 km) e 3D (20.583 km²). Nenhuma entrada no array `seismicData` do Bloco 0 tem valores de 4D diferentes de zero, confirmando a inconsistência.

### Correcção
**Ficheiro**: `src/data/angolaBlocks.ts`
- Alterar `totalSeismic4DKm2: 8082` para `totalSeismic4DKm2: 0` no `explorationSummary` do Bloco 0 (linha ~645)

Impacto mínimo — os componentes de UI que mostram Sísmica 4D (como `BlockDetailRow` e `ExplorationSummaryTable`) já tratam valores `0`/`undefined` como "sem dados", portanto não aparecerá na interface.

