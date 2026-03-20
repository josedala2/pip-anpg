

# Enriquecer Dados de Infraestruturas e Projectos de Desenvolvimento do Bloco 0

## Dados Novos Identificados nas Imagens

**Imagem 1 — Infraestruturas e Filosofia Operacional:**
- 166 plataformas de poços (WHP) e 38 plataformas de processamento
- ~1.500 km de pipelines principais e 35.000 segmentos secundários
- 147 turbinas a gás e mais de 1.500 bombas
- Taxa de utilização: 54,7% (produção/capacidade)
- Capacidade de armazenamento do Terminal Malongo: 5,9 MMBBL
- Asset Tiering: Tier 1 (manter), Tier 2 (estender vida), Tier 3 (abandonar até 2032)
- Produção actual: 119.000 BOPD (actualizar de 115.608)

**Imagem 2 — Desempenho de Projectos de Desenvolvimento:**
- Recuperação cumulativa (Plan vs Actual) para 5 projectos: Lifua A, Nemba, Banzala, Malongo West, Mafumeira
- Observações operacionais por projecto (falhas de bombas, workovers, reservatórios esgotados)

## Plano de Implementação

### Tarefa 1: Expandir interface `FacilityData` com novos campos
Adicionar campos opcionais à interface:
- `wellheadPlatforms`, `processingPlatforms` (contagens)
- `pipelinesMainKm`, `pipelinesSecondarySegments`
- `gasTurbines`, `pumps`
- `utilizationRate` (%)
- `storageCapacityMMBBL`
- `assetTiering` (array com tier, descrição e campos associados)

### Tarefa 2: Adicionar interface e dados de Projectos de Desenvolvimento
Nova interface `DevelopmentProject` com:
- `name`, `planRecoveryMMBO`, `actualRecoveryMMBO`, `percentOfPlan`
- `status` e `observations` (texto descritivo dos desafios)

Adicionar campo opcional `developmentProjects?: DevelopmentProject[]` à interface `OilBlock`.

### Tarefa 3: Actualizar dados do Bloco 0
- `dailyProduction`: 115.608 → 119.285
- Preencher novos campos de `facilityData` com valores das imagens
- Adicionar array `developmentProjects` com os 5 projectos e respectivos dados de recuperação e observações

### Ficheiro editado
- `src/data/angolaBlocks.ts` (interfaces + dados do Bloco 0)

