

## Actualizar Home Executiva com Dados Nacionais Certificados

### Problema actual
Os KPIs da Home Executiva calculam métricas a partir de apenas 3 blocos verificados (`pendingRealData: false`), mostrando valores parciais. O documento oficial "Estado das Concessões 2026" fornece totais nacionais certificados que devem ser usados.

### Dados do documento oficial vs actuais

| KPI | Valor actual (parcial) | Valor oficial |
|-----|----------------------|---------------|
| Produção Nacional | ~sumário 3 blocos | **1.036.000 BOPD** |
| Quota ANPG | n/a | **441.609 BOPD** |
| Reservas Certificadas | ~sumário 3 blocos | **2.600 Mb óleo + 4.4 TCF gás** |
| Concessões Activas | 3 | **54 (de 67 adjudicados)** |
| Blocos em Produção | filtrado | **17** |
| Em Exploração | filtrado | **37** |
| Em Aprovação | filtrado | **13** |
| Pico Projectado | já correcto | **1.682 kBOPD (2050)** |
| Recursos Prospectivos | n/a | **152.611 Mb óleo, 45.328 TCF gás** |

### Correcção nos Levantamentos (liftingsData)
O documento mostra **Bloco 14: 890 MMBO (6.75%)** mas o código tem 84 (0.64%). Faltam também **Bloco 31 (64, 0.49%)** e **Bloco 3/05A (3, 0.02%)**.

### Plano de implementação

**1. Criar constantes nacionais certificadas** em `src/data/nationalForecast.ts`
- Adicionar objecto `nationalCertifiedMetrics` com todos os valores do documento: produção (1.036.000), quota ANPG (441.609), reservas óleo (2.600 Mb), reservas gás (4.4 TCF), concessões (54/67), blocos produção (17), exploração (37), aprovação (13), recursos prospectivos, PTOs aprovados (41)

**2. Actualizar KPICards** (`src/components/dashboard/KPICards.tsx`)
- Substituir cálculos baseados em `verified` por constantes nacionais certificadas
- Produção Nacional: 1.036.000 BOPD (valor fixo do documento)
- Reservas: 2.600 Mb (com sub-label "Gás: 4.4 TCF")
- Concessões Activas: 54 / 67
- Blocos em Produção: 17
- Em Exploração: 37
- Em Aprovação: 13
- Adicionar KPI "Quota ANPG": 441.609 BOPD
- Receita Estado: recalcular com base na produção real (1.036.000)

**3. Corrigir liftingsData** (`src/data/liftingsData.ts`)
- Bloco 14: 84 → 890 (6.75%)
- Adicionar Bloco 31: 64 (0.49%)
- Adicionar Bloco 3/05A: 3 (0.02%)
- Reordenar por volume descendente

**4. Actualizar disclaimer** na Home Executiva
- Ajustar texto para indicar que os KPIs nacionais usam dados certificados do relatório oficial, enquanto drill-downs detalhados mantêm apenas blocos verificados

### Ficheiros a alterar
1. `src/data/nationalForecast.ts` — adicionar constantes nacionais
2. `src/components/dashboard/KPICards.tsx` — usar constantes em vez de agregação parcial
3. `src/data/liftingsData.ts` — corrigir Bloco 14, adicionar Bloco 31 e 3/05A
4. `src/components/dashboard/ExecutiveHome.tsx` — ajustar disclaimer

