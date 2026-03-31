

## Adicionar KPI "Investimento Executado" na Visão Geral do Bloco 0

### Contexto
A imagem de referência mostra o investimento executado dividido em dois períodos com breakdown CAPEX/OPEX:
- **2004–2021**: CAPEX 18.228 + OPEX 23.132 = **41.361 MMUSD**
- **2022–2025**: CAPEX 4.872 + OPEX 3.431 = **8.303 MMUSD**
- **Total**: ~49.664 MMUSD

### Alterações

**1. `src/data/angolaBlocks.ts`** — Adicionar campo `investmentExecuted` ao interface `EconomicVision` e popular os dados no Bloco 0:
```typescript
investmentExecuted?: {
  periods: { label: string; capex: number; opex: number }[];
};
```
Dados: `[{ label: "2004 - 2021", capex: 18228, opex: 23132 }, { label: "2022 - 2025", capex: 4872, opex: 3431 }]`

**2. `src/pages/BlockPage.tsx`** — Na grid de KPIs da aba "Visão Geral" (linha ~397), substituir o KPI "Investimento Quinquenal" / "Investimento Acum." por um novo KPI "Investimento Executado" que mostra o total dos dois períodos (~$49.664M → `$49,7B`) quando `investmentExecuted` existe, com sub-texto indicando os dois períodos.

**3. Actualizar `accumulatedInvestment`** do Bloco 0 de 5.400 para 49.664 para consistência (ou manter separado se usado noutros contextos — verificar impacto).

### Resultado
O card KPI na Visão Geral mostrará: **Investimento Executado: $49,7B** com sub-texto "2004–2021: $41.361M + 2022–2025: $8.303M".

