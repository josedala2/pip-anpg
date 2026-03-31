

## Adicionar KPIs Quota ANPG e Quota SNL E.P. ao Resumo Financeiro do Bloco 0

### Alterações

#### 1. Dados — `src/data/angolaBlocks.ts`
- Adicionar campos `quotaANPG_BOPD` e `quotaSNL_BOPD` à interface `EconomicVision`
- Adicionar os valores ao Bloco 0: `quotaANPG_BOPD: 48900` e `quotaSNL_BOPD: 48900` (valores a confirmar — estimativa baseada na participação de 41% Sonangol E.P. na produção de 119.285 BOPD)

#### 2. KPI Cards — `src/pages/BlockPage.tsx`
- Adicionar 2 novos cards após o card "Custo de Abandono" (card 4), dentro do grid `xl:grid-cols-4` → mudar para `xl:grid-cols-6` ou manter 4 colunas com wrap:
  - **Card 5: Quota ANPG** — valor em BOPD, ícone `Droplets`, tooltip descritivo
  - **Card 6: Quota SNL E.P.** — valor em BOPD, ícone `Building2`, tooltip descritivo
- Sub-texto: percentagem da produção total do bloco (ex: "41.0% da produção")

### Nota
Os valores exactos das quotas por bloco dependem dos dados certificados. Se o utilizador tiver valores específicos, poderão ser ajustados após implementação.

