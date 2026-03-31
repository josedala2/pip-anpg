

## Corrigir Alertas Duplicados no Painel Nacional

### Diagnóstico
A função `evaluateForecastAlerts()` em `src/lib/alertsEngine.ts` gera alertas nacionais iterando sobre **todos os 5 cenários** (continuidade, optimização, preço baixo, etc.), produzindo até **3 alertas × 5 cenários = 15 alertas** que parecem repetidos ("NPV negativo", "Produção < 800k", "Receita Estado cai"). Os alertas per-block também não filtram `pendingRealData`.

### Alterações em `src/lib/alertsEngine.ts`

**1. Alertas nacionais — mostrar apenas o cenário mais grave por tipo**
Em vez de `nationalOutputs.forEach(...)` gerando um alerta por cenário, agregar cada tipo de alerta:
- **NPV negativo**: encontrar o cenário com o NPV mais negativo e gerar **1 alerta** com menção aos cenários afectados
- **Produção < 800k**: encontrar o cenário que cruza o limiar **mais cedo** e gerar **1 alerta**
- **Receita Estado**: encontrar a maior queda percentual e gerar **1 alerta**

Cada alerta incluirá na descrição quantos cenários são afectados (ex: "em 3 de 5 cenários").

**2. Per-block — adicionar filtro `pendingRealData`**
Linha 543: mudar de:
```typescript
const producing = oilBlocks.filter(b => b.dailyProduction > 0);
```
para:
```typescript
const producing = oilBlocks.filter(b => !b.pendingRealData && b.dailyProduction > 0);
```

### Resultado esperado
- De ~15+ alertas nacionais repetitivos → **3-4 alertas nacionais** (1 por tipo, apenas se aplicável)
- Eliminação de alertas per-block de blocos sem dados reais
- Cada alerta mantém a informação de quais cenários são afectados

### Ficheiro a alterar
- `src/lib/alertsEngine.ts` — função `evaluateForecastAlerts()`

