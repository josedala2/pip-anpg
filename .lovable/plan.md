

## Plan: Actualizar Dados de Exploração do Bloco 0

### Objectivo
Actualizar os dados do Bloco 0 em `src/data/angolaBlocks.ts` com os valores precisos do ficheiro Excel fornecido.

### Alterações Identificadas (comparação Excel vs dados actuais)

**1. Dados Sísmicos (`seismicData`)** — Actualizar valores decimais precisos:
- 2010: 4D 690.65 (actual: 691)
- 2011: 3D 939.45, 4D 1092.44 (actual: 939, 1092)
- 2012: 3D 1110.85, 4D 897.84 (actual: 1111, 898)
- 2013: 4D 598.04 (actual: 598)
- 2014: 4D 170.75 (actual: 171)
- 2015: 4D 480.88 (actual: 481)
- 2017: 4D 1232.11 (actual: 1232)
- 2018: 4D 286.58 (actual: 287)
- 2021: 4D 735.8 (actual: 736)
- 2022: 4D 742.88 (actual: 743)

**2. Dados de Poços (`wellsData`)** — Actualizar contagens com dados corrigidos do Excel (página 3, tabela resumo):
- Vários anos com contagens ligeiramente diferentes (ex: 1970: pesquisa 4→0, avaliação 7→11; vários anos com avaliação corrigida incluindo poços de desenvolvimento classificados como avaliação)
- Adicionar anos em falta e corrigir contagens existentes com base na tabela resumo do Excel

**3. Sumário de Exploração (`explorationSummary`)** — Actualizar totais:
- `totalWellsPesquisa`: 143 → 144
- `totalWellsAvaliacao`: 71 → 84
- `commercialDiscoveries`: 58 → 57
- `nonCommercialDiscoveries`: 44 → 32
- `dryWells`: 41 → 55
- Recalcular `totalSeismic4DKm2` com soma precisa: ~8082 km² (actual: 340)

### Ficheiro a Modificar
- `src/data/angolaBlocks.ts` — Bloco 0: actualizar `seismicData`, `wellsData`, e `explorationSummary`

