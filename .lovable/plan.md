

## Alinhar Estado da Concessão com Critérios Estratégicos Actualizados

### Contexto
O painel "Estado da Concessão" usa 6 critérios com pesos iguais (qualquer vermelho = Crítico, qualquer amarelo = Atenção). No entanto, o Score Estratégico foi actualizado para dar peso de **35% à Produção** como prioridade principal da ANPG. Esta página precisa reflectir essa hierarquia.

### O que muda

**1. Adicionar card de Score Estratégico** (novo, entre o semáforo e os KPIs)
- Mostrar o score total (0-100), a classificação (ex: "Manter & Optimizar") e a urgência
- Incluir o breakdown das 6 dimensões com barras de progresso coloridas (igual ao que já existe na Matriz de Decisão do CA)
- Importar `calculateStrategicScore` e `classificationConfig` de `strategicScoring.ts`

**2. Tornar o semáforo sensível aos pesos**
- O semáforo actual trata todos os critérios de forma igual. Vou adicionar ao lado do semáforo o score estratégico como indicador complementar, mas **manter o semáforo operacional existente** (que funciona como alerta de limiares) separado
- Adicionar uma nota explicativa: "Score Estratégico ponderado (Produção 35%)"

**3. Adicionar Recomendação Estratégica**
- Mostrar o campo `recommendation` do score estratégico no card de Alertas, como item destacado no topo
- Incluir `riskOfInaction` e `expectedImpact` como sub-itens

### Detalhes técnicos

**Ficheiro**: `src/components/dashboard/ConcessionStatusTab.tsx`

- Importar `calculateStrategicScore`, `classificationConfig`, `urgencyConfig` de `@/lib/strategicScoring`
- Calcular `strategic = useMemo(() => calculateStrategicScore(block), [block])`
- Inserir novo card após o semáforo (Row 1) com:
  - Score circular grande + classificação colorida
  - Grid 2x3 ou 3x2 com as 6 dimensões (label, score, peso, barra)
- No card de Alertas, adicionar no topo a recomendação estratégica com ícone e cor da classificação

### Resultado
O utilizador vê imediatamente o impacto do peso de 35% da Produção no score, com transparência total dos critérios. O semáforo operacional mantém-se como sistema de alertas complementar.

### Ficheiros a modificar
1. `src/components/dashboard/ConcessionStatusTab.tsx`

