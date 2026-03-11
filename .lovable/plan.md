

## Criar estrutura completa para Bloco 3/05 e Bloco 15

### Problema
Os blocos 3/05 (`block-3`) e 15 (`block-15`) já existem em `angolaBlocks.ts` com dados básicos (produção, consórcio, sísmica, poços, campos, legislação), mas faltam-lhes os dados detalhados que o Bloco 0 possui e que alimentam as abas condicionais na `BlockPage`.

### Dados em falta (existem apenas no Bloco 0)
- `explorationSummary` — totais de sísmica, poços, taxa de sucesso geológico
- `economicData` — custos históricos, plano de investimento, produção GE, abandono
- `hseData` — indicadores de segurança (FAT, LTI, TRIR, etc.) 2021-2025
- `environmentalData` — derrames, emissões CO2, gás queimado 2021-2025
- `facilityData` — áreas, plataformas, poços activos, fotos, documentos, manutenção
- `economicVision` — NPV fullcycle/point forward, observações estratégicas
- `revitalizationScenarios` — cenários de revitalização

### Plano

**Ficheiro: `src/data/angolaBlocks.ts`**

1. **Bloco 3/05** (`block-3`, ~linha 1541) — Adicionar campos com dados placeholder realistas:
   - `explorationSummary`: totais calculados a partir dos `seismicData`/`wellsData` existentes
   - `economicData`: estrutura de custos e investimento adaptada à escala do bloco (produção ~50k BOPD)
   - `hseData`: 5 anos (2021-2025) com indicadores proporcionais
   - `environmentalData`: 5 anos com valores proporcionais
   - `facilityData`: plataformas Palanca, Bufalo, Impala; terminal; poços activos estimados
   - `economicVision`: NPV placeholder
   - `revitalizationScenarios`: 2-3 cenários adaptados ao contexto CPP do bloco

2. **Bloco 15** (`block-15`, ~linha 931) — Adicionar os mesmos campos:
   - `explorationSummary`: totais dos seismicData/wellsData existentes + taxa de sucesso
   - `economicData`: escala deep water (~325k BOPD)
   - `hseData`: 5 anos
   - `environmentalData`: 5 anos
   - `facilityData`: FPSOs Kizomba A, Kizomba B, Mondo, Saxi-Batuque
   - `economicVision`: NPV placeholder deep water
   - `revitalizationScenarios`: cenários adaptados ao contexto deep water

Nenhuma alteração é necessária na `BlockPage.tsx` — as abas (Instalações, HSE, SWOT, etc.) já são renderizadas condicionalmente e aparecerão automaticamente quando os dados existirem.

### Resultado
Ambos os blocos terão a mesma estrutura de 10 abas que o Bloco 0: Visão Geral, Financeiro & Contratual, Consórcio, Exploração, Produção, Projecções, Instalações, HSE & Ambiente, Análise SWOT, e Documentos & Legislação.

