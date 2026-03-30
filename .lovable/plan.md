

## Actualização Completa da Visão Económica do Bloco 0

Três grandes alterações baseadas nas 4 imagens do documento oficial.

### 1. Actualizar dados económicos existentes (`src/data/angolaBlocks.ts`)

**Observações estratégicas** — substituir/complementar com os dados das imagens:
- Custos quinquénio: MMUSD 8.726
- Sonangol 41% (MMUSD 3.578)
- MMUSD 115 alocado a exploração (poços 105-B e 131-A)
- CAPEX MMUSD 1.710 para South Ndola e MRWO Mafumeira
- OPEX previsto: MMUSD 22.855
- Cash flows negativos desde 2025 → não pagamento de IRP e ITP
- Custo operacional por barril 2025: USD 26,3

**Observações de abandono** — adicionar notas ao `cashFlowNotes` ou criar campo `abandonmentNotes`:
- Valor total: MMUSD 3.665 (MMUSD 1.300 conta de garantia + MMUSD 2.365 abandonos pontuais)
- Valor fundeado: MMUSD 102
- Dívida Sonangol: MMUSD 48 desde 2023
- Próxima submissão PAPR: 2026

Dados existentes já coincidem com o documento (custos, investmentPlan, abandonment, technicalCost). Apenas observações precisam de complemento.

### 2. Novo painel: Realização e Previsão de Levantamentos (`src/data/angolaBlocks.ts` + `EconomicVisionTab.tsx`)

**Novos dados** no interface `OilBlock` / `EconomicVision`:
- `liftingsAccumulated`: { geMMBO: 2479, snlMMBO: 1563, totalMMBO: 4041, totalReservesMMBO: 4599, percentLifted: 88 }
- `liftingsForecast`: array anual 2026-2050 com { year, geMMBO, snlEPMMBO, receitaGE, receitaSNL } — 25 entradas extraídas da imagem (GE 59%, SNL EP 41%)

**Novo sub-componente** dentro do `EconomicVisionTab.tsx`:
- Gráfico de barras (Levantamentos Acumulados 1988-2025): GE vs SNL E.P
- Gráfico combinado (Previsão 2026-2050): barras empilhadas SNL E.P + GE com linhas de receita
- Observações laterais (3 bullet points da imagem)

### 3. Novo painel: Gás Natural por Bloco (`src/components/dashboard/BlockGasPanel.tsx`)

**Dados** — já existem no `gasBalance` do Bloco 0 + expandir com:
- `gasBalanceHistory`: array com histórico e previsão do balanço de massa (2017-2040) por categoria (injectado, combustível, queimado, exportado ALNG, por categorizar)
- `gasSupplyForecast`: array com histórico e previsão de fornecimento B0/14 + oportunidades
- `gasRecommendation`: string com recomendação do documento
- `gasBreakevenRange`: "$3-16 MMBTU"
- `gasDRONote`: string sobre DROs e netback

**Novo componente** `BlockGasPanel.tsx`:
- Gráfico de barras empilhadas: Balanço de Massa (2017-2040)
- Gráfico de barras empilhadas: Fornecimento de Gás (B0/14-Exportado + Oportunidades)
- Painel de Pressupostos (KPIs + Índice de Utilização)
- Recomendação em destaque

**Integração** no `BlockPage.tsx` — adicionar na aba Produção (onde já existe o `gasBalance` inline), substituindo o bloco actual de gás por este novo painel completo.

### Ficheiros a alterar
1. `src/data/angolaBlocks.ts` — interfaces + dados do Bloco 0
2. `src/components/dashboard/EconomicVisionTab.tsx` — adicionar secção de Levantamentos
3. `src/components/dashboard/BlockGasPanel.tsx` — novo componente
4. `src/pages/BlockPage.tsx` — substituir bloco inline de gás pelo novo painel

