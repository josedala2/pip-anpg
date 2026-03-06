

## Plano: Integração completa de dados económicos do Bloco 0

### Dados extraídos do PDF da ANPG

**Custos Incorridos e Previsão (MMUSD):**
- 2004-2021: Capex 4,872 + Opex 41,361 (total ~46,233)
- 2022-2025: Capex 3,431 + Opex 8,303
- 2026-2050: Capex 3,873 + Opex 22,855

**Plano de Investimentos Quinquenal (MMUSD) — 2026-2030:**
| Ano  | Exploração | Desenvolvimento | Operação | Total  |
|------|-----------|-----------------|----------|--------|
| 2026 | 168       | 825             | 1,160    | 2,011  |
| 2027 | 175       | 759             | 1,217    | 1,851  |
| 2028 | 169       | 654             | 1,161    | 1,595  |
| 2029 | 228       | 684             | 1,200    | 1,669  |
| 2030 | 228       | 656             | 1,195    | 1,600  |

**Partilha de Produção GE (MMBO):**
- 2026: 48, 2027: 46, 2028: 44, 2029: 39, 2030: 36 (Total: 213)

**Abandono:**
- Total: MMUSD 3,420
- Valor para fundeamento: MMUSD 1,300 (depositado: MMUSD 102)
- Dívida Sonangol: MMUSD 48

**Operação:**
- Opex por barril 2025: USD 26,3
- Receitas do Estado: 57% (até 2021), 16% (2026-2050, apenas royalty 15%)

---

### Alterações

#### 1. Novo tipo `EconomicData` em `angolaBlocks.ts`

Criar interface para dados económicos do bloco:

```typescript
export interface InvestmentPlanYear {
  year: number;
  exploracao: number;    // MMUSD
  desenvolvimento: number;
  operacao: number;
  total: number;
}

export interface EconomicData {
  costHistory?: {
    period: string;
    capex: number;   // MMUSD
    opex: number;
  }[];
  investmentPlan?: InvestmentPlanYear[];
  productionShareGE?: { year: number; mmbo: number }[];
  abandonment?: {
    total: number;
    fundingRequired: number;
    fundingDeposited: number;
  };
  opexPerBarrel?: number;   // USD/BO (2025)
  opexPerBarrelYear?: number;
  sonangolDebt?: number;
  stateRevenueShare?: { period: string; percentage: number }[];
  observations?: string[];
}
```

#### 2. Adicionar `economicData?` ao tipo `OilBlock`

Campo opcional na interface existente.

#### 3. Povoar `economicData` no Block 0

Com todos os dados extraídos do PDF.

#### 4. Actualizar `capexHistory` do Block 0

Adicionar os anos 2026-2030 com CAPEX planeado (total por ano) e actual = 0 (previsão).

#### 5. Nova secção na aba "Financeiro & Contratual" em `BlockPage.tsx`

Adicionar, após o gráfico CAPEX existente, novas secções visuais:
- **Plano de Investimentos Quinquenal** — gráfico de barras empilhadas (Exploração, Desenvolvimento, Operação)
- **Partilha de Produção GE** — gráfico de barras com valores MMBO
- **Custos Históricos** — cards com custos por período
- **Abandono & Dívida** — indicadores-chave (total, fundeado, dívida Sonangol)
- **Observações Estratégicas** — lista de bullet points com as observações do PDF

### Ficheiros a modificar
- `src/data/angolaBlocks.ts` — novo tipo + dados do Block 0
- `src/pages/BlockPage.tsx` — novas secções na aba financeira

