

## Actualizar nationalCertifiedMetrics com Dados do Excel

### O que o Excel permite corrigir

O ficheiro Excel "EHA - Previsões de Produção" contém exclusivamente dados de produção. Do objecto `nationalCertifiedMetrics`, apenas um campo pode ser actualizado:

| Campo | Valor actual | Valor Excel | Acção |
|-------|-------------|-------------|-------|
| `productionBOPD` | 1,036,000 | 1,037,000 | Corrigir → 1,037,000 |

### Campos sem dados neste Excel (sem alteração)

- `anpgQuotaBOPD` (441,609) — não consta
- `snlQuotaBOPD` (165,760) — não consta
- `reservesOilMb` (2,600) — não consta
- `reservesGasTCF` (4.4) — não consta
- `gasProductionMMSCFD` (2,756) — não consta
- Contagens de concessões — não constam
- Recursos prospectivos — não constam

### Alteração

**`src/data/nationalForecast.ts`** — linha 154: `productionBOPD: 1036000` → `productionBOPD: 1037000`

### Nota
Para actualizar os restantes campos, seria necessário outro ficheiro do relatório com as métricas globais (reservas, quotas, gás, concessões).

