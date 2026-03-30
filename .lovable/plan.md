

## Revisão do Painel CA — Alinhar com Dados Nacionais Certificados

### Problemas identificados

O painel CA calcula os 4 Macro KPIs e a tendência a partir dos 3 blocos verificados, produzindo valores parciais inconsistentes com os dados certificados já disponíveis em `nationalCertifiedMetrics`.

| KPI | Valor actual (parcial) | Valor correcto |
|-----|----------------------|----------------|
| Produção Nacional | ~soma 3 blocos (~380K) | **1.036.000 BOPD** (1.036K) |
| Receita Estado | getNationalEconomicKPIs(3 blocos) | Manter cálculo parcial, mas **rotular** como "Receita Estado (blocos verificados)" |
| Concessões activas (subtítulo) | 3 | **54** |
| Tendência (Zone E) | capexHistory como proxy (errado) | Usar `nationalForecast` real |

### Plano de implementação

**1. Macro KPIs (linhas 176-188, 308-339)**
- **Produção Nacional**: usar `nationalCertifiedMetrics.productionBOPD` (1.036.000) — valor certificado
- **Receita Estado**: manter cálculo existente mas adicionar sub-label "(blocos verificados)" para transparência
- **Concessões em Risco**: manter contagem actual (verificados) — é correcto mostrar os que temos dados
- **Renovações Próximas**: idem, manter

**2. Subtítulo do painel (linha 289)**
- Mudar de `{macro.totalActive} concessões activas` para usar `nationalCertifiedMetrics.activeConcessions` (54), com nota que a matriz detalha apenas blocos verificados

**3. Tendência de Produção — Zone E (linhas 202-213, 673-701)**
- Substituir a lógica errada (capexHistory como proxy) por dados de `nationalForecast` (2025-2050), mostrando `total` em kBOPD
- Limitar a janela visível (e.g. 2025-2035) para foco no médio prazo

**4. Adicionar KPI "Quota ANPG"**
- Substituir um dos 4 KPIs ou expandir para 5, adicionando `nationalCertifiedMetrics.anpgQuotaBOPD` (441.609 BOPD) — alinhado com a Home Executiva

### Ficheiro a alterar
`src/components/dashboard/ConselhoPanel.tsx` — importar `nationalCertifiedMetrics` e `nationalForecast`, actualizar macro KPIs, subtítulo e gráfico de tendência

