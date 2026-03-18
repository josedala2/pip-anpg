

## Plano: Novos critérios de avaliação no Estado da Concessão

### Novos critérios a adicionar (3)

**1. Tendência CAPEX (desvio acumulado real vs planeado)**
- Calcular o desvio médio entre `actual` e `planned` no `capexHistory`
- Alerta amarelo se desvio < -10%, vermelho se < -20%
- Mensagem: "CAPEX abaixo do planeado: -X%"

**2. Idade das Instalações (plataforma mais antiga)**
- Usar `platformSpecs[].installationYear` para encontrar a instalação mais antiga
- Calcular idade = ano actual - installationYear
- Alerta amarelo se > 30 anos, vermelho se > 40 anos
- Mensagem: "Instalação mais antiga: Nome (Xa)"

**3. Declínio de Produção (refinado)**
- Actualmente usa first vs last do `productionHistory` com limiar -15%
- Refinar: calcular declínio dos últimos 3 meses vs primeiros 3 meses para suavizar ruído
- Adicionar severidade vermelha se declínio < -25%
- Adicionar novo KPI card com o valor do declínio

### Alterações em KPIs (Row 1)
- Adicionar KPI "Declínio Produção" com percentagem e cor semáforo
- Adicionar KPI "Idade Máx. Instalação" com anos e cor semáforo

### Ficheiros
- `src/components/dashboard/ConcessionStatusTab.tsx` — adicionar cálculos, alertas e KPIs

### Impacto
- Sem novos ficheiros nem alterações de dados — tudo usa campos já existentes em `OilBlock`
- O semáforo global passa a considerar 7 critérios em vez de 4

