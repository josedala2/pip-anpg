

## Filtrar Painel do CA para 3 Blocos Verificados

### O que muda
No ficheiro `ConselhoPanel.tsx`, linha 153, o filtro actual é:
```typescript
const activeBlocks = oilBlocks.filter(b => b && b.phase !== "Bidding");
```
Isto inclui ~100+ blocos com apenas metadados estruturais, distorcendo KPIs, semáforos e a Matriz de Decisão.

### Alteração
Substituir o filtro por:
```typescript
const activeBlocks = oilBlocks.filter(b => b && !b.pendingRealData && b.phase !== "Bidding");
```

Isto usa a flag `pendingRealData: true` já presente nos blocos sem dados operacionais, filtrando automaticamente para os 3 blocos verificados (Bloco 0, 2/05 e 3/05).

### Impacto
- **Macro KPIs** (produção total, receita estimada, scores médios) reflectirão apenas dados reais
- **Matriz de Decisão** mostrará apenas 3 linhas com análise fundamentada
- **Semáforo de Saúde** será calculado sobre dados operacionais verificados
- **Alertas e Tendências** derivarão apenas dos 3 blocos
- A secção "Blocos em Licitação" (linha 568) mantém-se inalterada pois é informativa

### Ficheiros
- `src/components/dashboard/ConselhoPanel.tsx` — 1 linha alterada (linha 153)

