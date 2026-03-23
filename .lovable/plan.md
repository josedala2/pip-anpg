

# Integração de Dados do Documento "Estado das Concessões 2026"

## Resumo do Documento

O PDF contém 50 páginas do relatório oficial ANPG "Estado das Concessões 2026", com dados detalhados para 3 blocos (Bloco 0, Bloco 2/05, Bloco 3/05) e dados nacionais de enquadramento.

## Dados Novos Identificados

### 1. Correcções Críticas no Bloco 2/05

O dataset actual tem dados **incorrectos** para o Bloco 2/05:

| Campo | Valor Actual | Valor Correcto (PDF) |
|---|---|---|
| Operador | SOMOIL (30%) | ETU ENERGIAS (Op.) (36%) |
| Parceiros | FALCON, KOTOIL, POLIEDRO, PRODOIL, ACREP S | FALCON OIL (24%), PRODOIL (15%), KOTOIL (12.5%), POLIEDRO (12.5%) |
| Produção diária | 15,005 BOPD | 14,907 BOPD |
| Reservas | 85 MMBO | 79.4 MMBO (FR 27%) |
| Início produção | 1988 | 1979 |
| Vida útil instalações | 2035 | 2030 (até 2040 com adenda) |
| Taxa sucesso exploração | N/D | 88% |
| OPEX/bbl | 11.68 (estimado) | 10.07 (real 2025) |
| Sísmica 2D | 480+200+80 km | 18,495 Km |
| Sísmica 3D | 350+280+180 km² | 4,713 Km² |
| Poços exploração | 10 | 92 (24 pesquisa, 68 avaliação) |
| Descobertas | 3 comerciais | 21 (14 comerciais, 7 não comerciais), 3 secos |
| HSE | Dados fabricados (padrão genérico) | Dados reais 2018-2024 com HHR específicos |
| Abandono | 120 MMUSD | 700 MMUSD (défice fundo SNL: 691 MMUSD) |
| Capacidade por plataforma | N/D | Essungo 25k, Bagre 45k, Lombo Este 75k, Morsa West 20k |

### 2. Actualizações no Bloco 3/05 (id "block-3")

| Campo | Actualização |
|---|---|
| Parceiros | Adicionar ETU (10%) e NIF NAFTAGAS (4%); Maurel corrigir para 20% |
| Decreto | Adicionar DP 190/23 |
| Produção início | 1985 |
| Capacidade | 46,278 BOPD |
| Plataformas | 11 WHP, 4 processamento, 6 turbinas (3 operacionais), 500km pipelines |
| Poços | 59 total (38 produção, 21 fechados) |
| Fiscal | Profit Oil GE 60% (10% se incumprimento), Cost Oil 80%/85% |
| Taxa sucesso | 57% |
| Instalações | Estado acentuado de degradação, corrosão, obsolescência de gruas e sistemas |

### 3. Enriquecimento do Bloco 0

Embora já detalhado, o PDF acrescenta:
- **Development Projects** com métricas de desempenho (Lifua 120%, Nemba 100%, Banzala 80%, Malongo West 40%, Mafumeira 0%)
- **Prospectos** com recursos BCF (valores em falta no dataset)
- **Custo Técnico breakdown**: Capex/bbl 17.0, Opex/bbl 11.7 (actual), Total 28.7
- **Abandono detalhado**: Pontual 2,365 MMUSD vs Fundeamento 1,300 MMUSD
- **Cenários de revitalização** (Divisão do bloco em Tier 1/2+3, novos consórcios, CPP)
- **SWOT real** da ANPG (forças, fraquezas, oportunidades, ameaças)
- **Dados de gás**: Reservas 2,891 BSCF, infraestrutura CRX 600 MMSCFD, GOR 3,631 SCF/STB

### 4. Dados Nacionais (Enquadramento)

- Produção média 2025: 1,036,000 BOPD (quota ANPG: 441,609)
- Reservas certificadas: 2.6 Gbbls óleo, 4.4 TCF gás
- Recursos prospectivos: 152,611 Gbbls óleo, 45,328 TCF gás
- Previsão ALNG com défice estrutural de 1.5 TCF a partir de 2035
- Dados de utilização de gás 2017-2025

---

## Plano de Implementação

### Passo 1: Corrigir Bloco 2/05 em `angolaBlocks.ts`
- Corrigir operador, parceiros, consórcio, produção, reservas
- Actualizar HSE com dados reais (2018-2024)
- Actualizar explorationSummary com dados correctos
- Corrigir economicData (abandono, OPEX, investment plan)
- Actualizar facilityData com plataformas reais (Essungo, Bagre, Lombo Este, Morsa West)
- Actualizar wellsData e seismicData
- Adicionar campos correctos (Sulele, Raia, Espadarte, Essungo, Cavala, Estrela, etc.)
- Remover `pendingRealData` se existir

### Passo 2: Actualizar Bloco 3/05 em `angolaBlocks.ts`
- Corrigir parceiros e percentagens no consórcio
- Actualizar facilityData com dados reais (11 WHP, 59 poços, 4 processamento)
- Actualizar explorationSummary (taxa sucesso 57%, descobertas)
- Adicionar dados fiscais detalhados (Profit Oil tiers)
- Adicionar campos correctos (Impala, Cobo, Pambi, Pacassa, Búfalo, etc.)
- Actualizar decreto e período de produção (até 2040)

### Passo 3: Enriquecer Bloco 0 em `angolaBlocks.ts`
- Adicionar `developmentProjects` com métricas (Lifua, Nemba, Banzala, Malongo West, Mafumeira)
- Actualizar prospectos com valores BCF
- Adicionar `economicVision.technicalCost` com breakdown Capex/Opex/bbl
- Adicionar `economicVision.abandonmentDetail` com valores pontual/fundeamento
- Adicionar `revitalizationScenarios` com cenários do PDF
- Adicionar dados de gás natural ao bloco

### Passo 4: Actualizar KPIs nacionais
- Verificar se os KPIs globais (KPICards) reflectem os novos totais: 1,036,000 BOPD, 67 blocos adjudicados

---

## Impacto na Plataforma

- **Bloco 2/05** passa de dados parciais/fabricados a dados verificados completos
- **Bloco 3/05** recebe dados operacionais e de infraestrutura detalhados
- **Bloco 0** ganha painéis novos de Development Projects e Cenários
- **Eliminação de fallbacks**: O OPEX real ($10.07/bbl para 2/05) substitui o fallback de $20/bbl

Ficheiro principal a editar: `src/data/angolaBlocks.ts` (alterações extensas nos 3 blocos).

