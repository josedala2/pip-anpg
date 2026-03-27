

## Adicionar Coluna de Ranking por Produção Diária na Matriz de Decisão

### O que muda
Uma nova coluna **"Rank Prod."** será adicionada à tabela da Matriz de Decisão, mostrando a posição de cada bloco ordenado por produção diária (1.º = maior produtor). A coluna é independente do score composto e permite ordenação por clique.

### Detalhes técnicos

**Ficheiro**: `src/components/dashboard/ConselhoPanel.tsx`

1. **Calcular ranking** — No `useMemo` que gera `concessions` (ou no `sorted`), atribuir a cada concessão um `productionRank` baseado na ordenação decrescente de `dailyProduction`.

2. **Adicionar tipo de sort** — Expandir o tipo de `sortBy` para incluir `"production"`:
   ```typescript
   useState<"health" | "score" | "contract" | "action" | "production">("health")
   ```

3. **Adicionar case no sort** — No `switch(sortBy)`:
   ```typescript
   case "production": cmp = a.block.dailyProduction - b.block.dailyProduction; break;
   ```

4. **Nova coluna no header** — Entre "Operador" e "Produção" (ou logo após "Produção"), adicionar:
   ```tsx
   <TableHead className="text-[10px] text-center cursor-pointer" onClick={() => toggleSort("production")}>
     Rank <SortIcon col="production" />
   </TableHead>
   ```

5. **Nova célula no body** — Mostrar o rank com destaque visual (medalha para top 3):
   ```tsx
   <TableCell className="py-2 text-xs text-center font-mono font-semibold">
     {rank}º
   </TableCell>
   ```

6. **Ajustar colSpan** da linha expandida de `9` para `10`.

### Resultado
A Matriz terá uma coluna visual clara de ranking por produção, clicável para ordenar, separada dos scores compostos.

