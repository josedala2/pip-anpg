

## Análise Comparativa: Planilha vs Plataforma — Bloco 0

Comparei campo a campo os dados da planilha Excel com os valores em `src/data/angolaBlocks.ts`. Segue o resultado:

---

### ✅ Dados Correctos (correspondem à planilha)

| Secção | Planilha | Plataforma | Estado |
|--------|----------|------------|--------|
| NPV até 2021 | GE: 49.038 / Imp: 261.049 | ge: 49038, impostos: 261049 | ✅ OK |
| NPV 2022-2025 | GE: 3.532 / Imp: 8.030 | ge: 3532, impostos: 8030 | ✅ OK |
| NPV Point Forward | GE: 1.840 / Imp: 3.098 | ge: 1840, impostos: 3098 | ✅ OK |
| Abandono Total | 3.420 | 3420 | ✅ OK |
| Abandono Pontual | 2.365 | 2365 | ✅ OK |
| Fundeamento | 1.300 | 1300 | ✅ OK |
| Fundeado | 102 | 102 | ✅ OK |
| Dívida Sonangol | 48 | 48 | ✅ OK |
| Opex/barril 2025 | 26,3 | 26.3 | ✅ OK |

---

### ❌ Dados Incorrectos ou Incompletos

#### 1. Fluxo de Caixa (cashFlowTimeSeries) — **VALORES TODOS ERRADOS**

Exemplo de divergências (MMUSD):

| Ano | Planilha GE | Plataforma GE | Planilha Imp | Plataforma Imp |
|-----|------------|---------------|-------------|----------------|
| 2004 | 3.577 | 800 | 736 | 2.200 |
| 2005 | 5.067 | 1.200 | 680 | 3.500 |
| 2008 | 8.301 | 3.500 | 532 | 9.000 |
| 2011 | 8.905 | 2.800 | 1.627 | 7.500 |
| 2026 | 528 | 500 | 80 | 400 |

Os 47 anos de dados (2004-2050) precisam ser substituídos pelos valores reais da planilha.

#### 2. Custos Incorridos (costHistory) — **VALORES TROCADOS/ERRADOS**

| Período | Planilha CAPEX | Plataforma CAPEX | Planilha OPEX | Plataforma OPEX |
|---------|---------------|-----------------|--------------|----------------|
| 2004-2021 | 23.132 | 4.872 | 18.228 | 41.361 |
| 2022-2025 | 3.431 | 3.431 | 4.872 | 8.303 |
| 2026-2050 | 3.873 | 3.873 | 18.982 | 22.855 |

O primeiro período tem CAPEX e OPEX aparentemente trocados/incorrectos.

#### 3. Plano de Investimentos (investmentPlan) — **VALORES ERRADOS**

| Ano | Campo | Planilha | Plataforma |
|-----|-------|---------|------------|
| 2026 | Exploração | 87 | 168 |
| 2026 | Desenvolvimento | 596 | 825 |
| 2026 | Admin & Serviços | 168 | 58 |
| 2026 | Cash Call | 825 | -200 |
| 2027 | Exploração | 7 | 175 |
| 2027 | Desenvolvimento | 453 | 759 |

Parece que os valores de Exploração e Admin foram trocados, e Cash Call Sonangol tem o valor do Desenvolvimento. Os 5 anos precisam de correcção.

#### 4. Partilha de Produção GE (productionShareGE) — **INCOMPLETA + VALORES DIFERENTES**

A plataforma tem apenas 5 anos (2026-2030) com valores em MMBO genéricos. A planilha tem **25 anos** (2026-2050) com valores detalhados em milhares de barris (ex: 2026 GE = 28.095; 2027 = 27.161). Faltam 20 anos de dados.

#### 5. Repartição de Receitas (revenueShare) — **VALORES MMUSD EM FALTA**

A plataforma tem apenas percentagens e MMBO. A planilha fornece os valores absolutos em MMUSD:
- Até 2021: GE 58.135 / Imp 76.647
- 2022-2025: GE 10.899 / Imp 5.829  
- 2026-2050: GE 25.845 / Imp 4.773

Estes valores MMUSD não estão no modelo de dados actual.

---

### Plano de Correcção

Actualizar `src/data/angolaBlocks.ts` (bloco block-0) com:

1. **cashFlowTimeSeries** — substituir os 47 registos pelos valores exactos da planilha
2. **costHistory** — corrigir os 3 períodos com valores reais de CAPEX e OPEX
3. **investmentPlan** — corrigir os 5 anos com valores correctos (Exploração, Desenvolvimento, Operação, Admin, Cash Call)
4. **productionShareGE** — expandir de 5 para 25 anos (2026-2050) com valores GE da planilha
5. **revenueShare** — adicionar campos `geMMUSD` e `impostosMMUSD` ao modelo `RevenueSharePeriod` e preencher com os valores absolutos
6. **Interface RevenueSharePeriod** — adicionar campos opcionais `geMMUSD` e `impostosMMUSD`
7. **EconomicVisionTab** — mostrar os valores MMUSD da repartição de receitas quando disponíveis

