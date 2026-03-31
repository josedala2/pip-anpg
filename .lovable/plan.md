

## Criar Score Estratégico Mais Realista

### Problema
O score actual é demasiado generoso. O Bloco 0, apesar de ter OPEX elevado ($26.3/BO), instalações com ~40+ anos, declínio produtivo contínuo, e apenas 53% de execução financeira, recebe uma pontuação moderada (~50-60) que não reflecte o estado crítico real.

### Causa raiz
1. **Baselines demasiado altos** — cada dimensão começa em 50, criando um "piso" artificial
2. **Penalizações insuficientes** — perdas de 10-15 pontos por problemas graves não impactam o suficiente
3. **Declínio produtivo subestimado** — o score compara últimos 3 vs primeiros 3 meses do histórico (12 meses), mas o verdadeiro declínio é a produção actual (119k BOPD) vs o pico histórico real do bloco (que foi muito mais alto)
4. **OPEX/custo técnico ignorado** — a dimensão económica usa apenas `executionRate` e `opexPerBarrel` do `economicData`, mas não consulta o `economicVision.technicalCost` (que tem os valores reais)
5. **Idade das instalações pouco penalizada** — 40+ anos apenas tira 20 pontos de um baseline de 50

### Alterações em `src/lib/strategicScoring.ts`

1. **Reduzir baselines de 50 para 40** em `productionScore`, `facilitiesScore`, `economicScore`, `contractualScore`

2. **`productionScore`** — Penalizar mais severamente:
   - Ratio < 0.5 do pico → score 15 (era 30)
   - Declínio recente > 10% → penalização de -20 (era -15)
   - Adicionar penalização por produção absoluta baixa vs reservas (reservas grandes + produção baixa = sub-exploração)

3. **`facilitiesScore`** — Usar dados reais:
   - Idade > 40 anos → penalização de -30 (era -20)
   - Eficiência < 70% → score 25 (era 35)
   - Considerar `productionLosses` com threshold mais agressivo

4. **`economicScore`** — Integrar `economicVision.technicalCost`:
   - Usar `opex2025` do `technicalCost` quando disponível (em vez do genérico `economicData.opexPerBarrel`)
   - OPEX > 25 USD/BO → -20 pontos
   - OPEX > 35 USD/BO → -30 pontos
   - Execution rate < 50% → score 20 (era 25)

5. **`contractualScore`** — Penalizar mais o incumprimento:
   - Compliance < 50% → score 10 (era 20)

6. **Ajustar thresholds de classificação** para reflectir a nova escala:
   - `< 30` → Preparar Abandono / Relicitar (era < 25)
   - `< 45` → Renegociar / Monitorar (era < 40)
   - `< 65` → Revitalizar / Monitorar (era < 60)
   - `< 80` → Manter & Optimizar (era < 80)

### Impacto
- O Bloco 0 passará de ~55 para ~35-40 (zona "Renegociar" ou "Revitalizar")
- Afecta: ConcessionStatusTab (recomendações estratégicas), ConselhoPanel (matriz de decisão do CA), ConcessionMap (cores semáforo)
- Não requer alterações nos componentes — apenas recalcula os valores

### Ficheiro afectado
- `src/lib/strategicScoring.ts` — ajustar as 6 funções de dimensão e os thresholds de classificação

