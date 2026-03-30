

## Adicionar Card "Quota SNL E.P." aos KPIs da Home Executiva

### Contexto
Já existe o KPI "Quota ANPG" (441.609 BOPD) no grupo "Produção". A Sonangol E.P. (SNL) detém uma participação na produção nacional que deve ser apresentada de forma equivalente.

### Dados
O Relatório 2026 não fornece directamente um valor agregado de "Quota SNL E.P." em BOPD no `nationalCertifiedMetrics`. Será necessário definir este valor. Com base nos dados existentes (SNL detém ~16% dos liftings cumulativos = 2.123 MMBO), uma estimativa proporcional à produção actual seria ~165.760 BOPD (16% de 1.036.000). **Preciso confirmar se o utilizador tem o valor exacto ou se devemos usar a proporção dos liftings.**

### Alterações

**1. `src/data/nationalForecast.ts`**
- Adicionar campo `snlQuotaBOPD` ao objecto `nationalCertifiedMetrics` (valor a confirmar — estimativa: ~165.760 BOPD baseada na % de liftings)

**2. `src/components/dashboard/KPICards.tsx`**
- Adicionar novo item no grupo "Produção", após "Quota ANPG":
  - Label: "Quota SNL E.P."
  - Value: `n.snlQuotaBOPD`
  - Suffix: " BOPD"
  - Icon: `Droplets` (mesmo ícone da Quota ANPG, ou `Building2` para distinguir)
  - Status: "neutral"
  - Drill: "Quota de produção atribuída à Sonangol E.P."

### Questão pendente
Qual o valor exacto da Quota SNL E.P. em BOPD? Se não houver valor oficial, usaremos a proporção de 16% dos liftings cumulativos (~165.760 BOPD).

