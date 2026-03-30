

## Actualizar Painéis com Dados Certificados Nacionais

### Problema
Os painéis de Produção, Exploração, Económico, Cenários, Previsão Geral e Previsão Avançada calculam KPIs nacionais a partir de apenas 3 blocos verificados (0, 2/05, 3/05), mostrando valores parciais. Já existem `nationalCertifiedMetrics` com os totais oficiais, mas estes painéis não os utilizam.

Os painéis de **Previsão Nacional** e **Levantamentos** já estão actualizados (usam `nationalForecast` e `liftingsData` directamente).

### Alterações por painel

**1. ProductionPanel** — Adicionar barra de referência nacional
- Acima dos KPIs parciais, adicionar strip com 3 métricas nacionais certificadas: **Produção Nacional** (1.036.000 BOPD), **Produção Gás** (2.756 MMSCFD), **Blocos Produtores** (17)
- Manter KPIs parciais abaixo como "Detalhe dos Blocos Verificados"
- Actualizar disclaimer para referenciar que totais nacionais vêm do Relatório 2026

**2. ExplorationPanel** — Adicionar contexto nacional de recursos
- Adicionar strip com **Recursos Prospectivos** (152.611 Mb Óleo / 45.328 TCF Gás), **Concessões em Exploração** (37), **Reservas Certificadas** (2.600 Mb / 4.4 TCF)
- Actualizar disclaimer para incluir referência ao Relatório 2026

**3. EconomicFinancialPanel (Dashboard sub-tab)** — Adicionar referência nacional
- Adicionar card "Produção Nacional" (1.036.000 BOPD) no strip de KPIs para contextualizar que os valores económicos derivam de 3 blocos
- Actualizar sub-título do disclaimer

**4. EconomicScenariosPanel** — Adicionar contexto de cobertura
- No header, mostrar "Cobertura: X% da produção nacional" calculado como `soma(3 blocos) / 1.036.000`
- Isto contextualiza imediatamente os cenários simulados

**5. GeneralForecastPanel** — Adicionar referência de cobertura
- No strip de KPIs macro, adicionar "Produção Nacional" (1.036 kBOPD) como referência, e mostrar "Cobertura" como percentagem
- Manter cálculos actuais como drill-down dos blocos verificados

**6. AdvancedForecastPanel** — Adicionar referência de cobertura
- Mesmo padrão: adicionar "% Cobertura Nacional" calculado vs `nationalCertifiedMetrics.productionBOPD`

### Detalhes técnicos
- Todos os painéis importam `nationalCertifiedMetrics` de `@/data/nationalForecast`
- Os strips nacionais usam um fundo diferente (`bg-primary/5 border-primary/20`) para se distinguirem dos KPIs parciais
- Os cálculos block-level existentes não são alterados — apenas se adiciona contexto nacional

### Ficheiros a alterar
1. `src/components/dashboard/ProductionPanel.tsx`
2. `src/components/dashboard/ExplorationPanel.tsx`
3. `src/components/dashboard/EconomicFinancialPanel.tsx`
4. `src/components/dashboard/EconomicScenariosPanel.tsx`
5. `src/components/dashboard/GeneralForecastPanel.tsx`
6. `src/components/dashboard/AdvancedForecastPanel.tsx`

