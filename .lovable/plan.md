

## Ajustar KPI "Investimento Executado" no Estado da Concessão — mostrar apenas valor

### Alteração

**`src/components/dashboard/ConcessionStatusTab.tsx`** (linhas 209-217) — Quando `investmentExecuted` existir, mostrar o valor total formatado (`$49.7B`) em vez da percentagem, e remover o sub-texto de comparação. Manter o fallback actual para blocos sem `investmentExecuted`.

Lógica:
- Se `investmentExecuted` existe → `value: "$49.7B"`, sem `sub`, cor `text-warning` (igual à Visão Geral)
- Senão → manter lógica actual com percentagem e comparação

