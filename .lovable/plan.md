

## Incluir todos os dados restantes no contexto do Soba

### Diagnóstico

A função `buildBlocksSummary()` já serializa a maioria dos dados (económicos, exploração, HSE, facilities, contratos, etc.), mas **omite os seguintes campos** que existem no `OilBlock`:

| Campo omitido | Descrição |
|---|---|
| `productionHistory` | Série mensal de produção (BOPD) |
| `capexHistory` | CAPEX planeado vs real por ano |
| `projections` | Cenários de projecção (conservative/base/expansion) |
| `seismicData` | Dados sísmicos anuais (2D/3D/4D) |
| `wellsData` | Dados de poços anuais (pesquisa/avaliação/descobertas) |
| `geologicalObjectives` | Objectivos geológicos |
| `legislationDocs` | Documentos legislativos associados |
| `cashFlowNotes` | Notas sobre fluxo de caixa |
| `facilityData.maintenancePlan` | Plano de manutenção das instalações |
| `waterDepthRange` | Intervalo de profundidade |

### Plano

Modificar apenas `src/components/dashboard/SobaChat.tsx` — expandir `buildBlocksSummary()` para incluir todos os campos em falta:

1. **`productionHistory`** — últimos 6 meses + média para não explodir contexto
2. **`capexHistory`** — tabela ano/planeado/real
3. **`projections`** — 3 cenários com valores
4. **`seismicData`** — tabela anual 2D/3D/4D
5. **`wellsData`** — tabela anual com tipo de poço e resultados
6. **`geologicalObjectives`** — lista
7. **`legislationDocs`** — referência e tipo de cada documento
8. **`cashFlowNotes`** — notas textuais
9. **`maintenancePlan`** — período/escopo/status
10. **`waterDepthRange`** — string simples

Dados volumosos (productionHistory, seismicData, wellsData) serão resumidos/limitados para manter o contexto dentro de limites razoáveis de tokens.

### Ficheiro a modificar

| Ficheiro | Alteração |
|---|---|
| `src/components/dashboard/SobaChat.tsx` | Adicionar serialização dos 10 campos em falta em `buildBlocksSummary()` |

