

# Integração de Dados Detalhados do Bloco 0

## Dados Identificados nas Imagens de Referência

Analisei as 9 imagens da ANPG e identifiquei as seguintes categorias de dados novos que ainda não existem no modelo:

### 1. Segurança e Ambiente (HSE) — Dados Completamente Novos
- **Indicadores de segurança** (2021-2025): FAT, LTI, RWC, MTC, FAC, NMI
- **Taxas**: HHR, TRIR, LTIR por ano
- **Derrames de óleo**: contagem e volume (bbl)
- **Concentração de óleo em água** (PPM): 5.17, 5.1, 4.75, 4.66, 6.53
- **Emissões CO2** (ton CO2eq): ~3.7M (2021) descendo para ~3.1M (2025)
- **Gás queimado** (MMSCFD): 17.519 → 10.54, com metas

### 2. Estado das Instalações — Dados Novos
- **Área A (Eficiência 85%)**: Takula, GIP-FOX, Mafumeira; problemas de corrosão e obsolescência
- **Área B (Eficiência 91%)**: Sanha, Sanha LPG, Nembas, EK, WK
- **Poços activos**: 358 OP, 78 WI, 27 GI
- **Produção 2025**: 43.539.025 bbls, perdas 2.830.691 bbls, eficiência 88%
- **Capacidade de produção**: 400.000 BOPD (Malongo Terminal)
- **Produção média 4T2025**: 119.285 BOPD
- **Reservas actuais**: 421 MMBO
- **Início de produção**: 1968
- **Vida útil**: até 2040 (Mafumeira Sul)

### 3. Visão Económica — Dados Novos
- **NPV Fullcycle**: GE 17% (54.410), Impostos 83% (272.177)
- **NPV Point Forward**: GE 37% (1.840 MMUSD), Conc 63% (3.098 MMUSD)
- **Cash flows negativos recorrentes para o GE**
- **Observações**: bloco maduro, infraestruturas envelhecidas

### 4. Cenários de Revitalização — Dados Novos
- **Cenário 1**: Continuidade do GE com incentivos fiscais
- **Cenário 2**: Investidor âncora para exploração
- **Cenário 3**: Novo investidor em áreas livres (modelo CPP)

### 5. Ajustes aos Dados Existentes
- **dailyProduction**: atualizar de 142.000 para 119.285 (dado real 4T2025)
- **estimatedReserves**: atualizar de 890 para 421 MMBO (dado real)
- **Produção acumulada**: 290.043.686.705 BO (até Dez 2025)
- **investmentPlan**: adicionar categorias "Administração e Serviços" e linha "Cash Call Sonangol"
- **Prospects**: atualizar com tabela real (105-B, 131-A, 107-C, 83-N, 71-T, 70-G, 95-I, 79-F, 68-D, 80-J) com distâncias ao FPSO

## Plano de Implementação

### Ficheiro 1: `src/data/angolaBlocks.ts` — Novos tipos e dados

**Novas interfaces**:
- `HSEData` — indicadores de segurança por ano (FAT, LTI, RWC, MTC, FAC, NMI, HHR, TRIR, LTIR)
- `EnvironmentalData` — derrames, óleo em água, emissões, gás queimado por ano
- `FacilityData` — eficiência por área, plataformas, poços activos, capacidades
- `EconomicVision` — NPV fullcycle, point forward, observações estratégicas
- `RevitalizationScenario` — cenários com propostas, incentivos e compromissos

**Actualizar `OilBlock`** com campos opcionais: `hseData?`, `environmentalData?`, `facilityData?`, `economicVision?`, `revitalizationScenarios?`

**Actualizar Block 0**:
- Corrigir `dailyProduction` para 119.285
- Corrigir `estimatedReserves` para 421
- Adicionar production acumulada
- Substituir prospects pela tabela real da ANPG
- Popular todos os novos campos com dados das imagens

### Ficheiro 2: `src/pages/BlockPage.tsx` — Novas secções de visualização

Adicionar novas abas ou secções nas abas existentes:
- **Aba "Visão Geral"**: integrar dados de instalações (eficiência, poços, plataformas)
- **Aba "Financeiro"**: adicionar NPV charts (pie charts), cash flow projection
- **Nova aba "HSE & Ambiente"**: tabela de indicadores de segurança, gráficos de derrames/emissões/gás queimado
- **Aba "Exploração"**: adicionar secção de Desafios e Cenários de Revitalização

### Estimativa: 4 ficheiros, ~500 linhas novas

