

## Aumentar Peso da Produção no Score Estratégico para 35%

### Redistribuição de pesos

| Dimensão | Actual | Novo |
|---|---|---|
| **Desempenho Produtivo** | 25% | **35%** |
| Integridade Instalações | 20% | 17% |
| Viabilidade Económica | 15% | 13% |
| Estado Contratual | 15% | 13% |
| Potencial Exploratório | 15% | 13% |
| Risco ESG | 10% | 9% |
| **Total** | 100% | **100%** |

Cálculo: as 5 dimensões restantes são reduzidas proporcionalmente (×65/75).

### Alteração

**Ficheiro**: `src/lib/strategicScoring.ts`

Alterar o campo `weight` em cada uma das 6 funções de dimensão (linhas de return):
- `productionScore`: `weight: 25` → `weight: 35`
- `facilitiesScore`: `weight: 20` → `weight: 17`
- `economicScore`: `weight: 15` → `weight: 13`
- `contractualScore`: `weight: 15` → `weight: 13`
- `explorationScore`: `weight: 15` → `weight: 13`
- `esgScore`: `weight: 10` → `weight: 9`

### Impacto
- Todos os scores estratégicos (Matriz de Decisão CA, Recomendações, Semáforos, Previsão) recalculam automaticamente
- Blocos com boa produção sobem no ranking; blocos em declínio descem mais
- As classificações (Revitalizar, Renegociar, etc.) podem mudar conforme o novo score total

