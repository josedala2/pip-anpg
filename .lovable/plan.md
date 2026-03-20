

# Actualização dos Dados das Concessões com Base no Mapa ANPG (GAD202601DMC0009)

## Resumo da Análise

Cruzamento completo entre o Mapa de Concessões da ANPG (Janeiro 2026) e os dados em `src/data/angolaBlocks.ts`. Identificadas discrepâncias significativas nos operadores, composição dos consórcios e percentagens de participação.

## Discrepâncias Identificadas

### 1. ONSHORE - Cabinda

| Bloco | Campo | Actual (código) | Oficial (PDF) |
|-------|-------|-----------------|---------------|
| **Cabinda Norte** | Operador | ACREP | ACREP S.A. (74.36%) + Sonangol E&P (25.64%) -- OK |
| **FS Associações** | Concession | ETU 15%, Sonangol 63.6%, Others 21.4% | ETU Energias (OP) 15%, Sonangol E&P 63.6%, Sonangol 25.64% -- **Actualizar "Others"** |
| **FST Associações** | Concession | ETU 31.33%, Sonangol 25.64%, Others 43.03% | ETU Energias (OP) 31.33%, Sonangol E&P (05.04%) -- **Detalhes parceiros** |
| **Cabinda Centro** | Concession | Azule 42.5%, ExxonMobil 32.5%, Sonangol 25% | Azule Energy Ang B.V. (OP) 42.50%, ExxonMobil 32.50%, Sonangol E&P 25.00% -- OK |
| **Cabinda Sul** | Concession | ACREP 51%, Monka Oil 4%, Sonangol 45% | ACREP (OP) 55%, INTA Energias (OP) 40%, Monka Oil 4%, Omega 0% -- **GRANDE discrepância** |

### 2. ONSHORE - CON Blocks

| Bloco | Campo | Actual | Oficial |
|-------|-------|--------|---------|
| **CON1** | Concession | ETU 40%, Intank 10%, Omega 10%, Sonangol 40% | Azule Energy Ang B.V. (OP) 42.50%, ACREP (OP) 10.00%, ExxonMobil 32.50%, Sonangol E&P 25.00% -- **ERRADO (confusão com Cabinda Centro?)** |
| **CON2** | Concession | ETU 50%, 14K&A-IMI 50% | ETU Energias (OP) 50.00%, 14K & A-IMI -- Parece OK |
| **CON3** | Concession | ETU 37.5%, vários | ETU Energias (OP), Effimax 30%, Simples Oil 20% -- **Ajustar percentagens** |
| **CON4** | Concession | Walcot 100% | Walcot Limited (OP) 100% -- OK |
| **CON5** | Concession | MTI 50%, Prodoil 15%, Effimax 35% | MTI Energy (OP) 50%, Prodoil 15.00%, Effimax Energy 10.00% -- **Effimax: 35%→10%** |
| **CON6** | Concession | ETU 40%, Sonangol 60% | ETU Energias (OP) 40%, Prodiaman 11.67%, Simples Oil 20%, Prodoil 12.50%, Enagol 10% -- **Completamente diferente** |
| **CON8** | Concession | ETU 43.75%, Prodiaman 11.67%, Simples Oil 20%, Prodoil 12.5%, Mineral One 12.08% | ETU Energias (OP) 43.75%, Mineral One 43.75%, Simples Oil 20%, Prodoil 12.50%, Enagol 10% -- **Ajustar** |

### 3. SHALLOW WATER (Águas Rasas)

| Bloco | Campo | Actual | Oficial |
|-------|-------|--------|---------|
| **Block 0** | Concession | Chevron 39.2%, Sonangol 41%, TotalEnergies 10%, Azule 9.8% | CHEVRON (OP) 39.20%, SONANGOL E&P 41%, TOTALENERGIES 10%, Azule Energy Ang Production B.V. 9.8% -- OK |
| **Block 1/14** | Concession | Azule Expl. 35%, Equinor 30%, Sonangol 25%, ACREP 10% | Azule Energy Expl. (OP) 35%, Equinor Angola Blk 1/14 AS 30%, Sonangol E&P 25%, ACREP S.A. 10% -- OK |
| **Block 2/05** | Concession | SOMOIL 30%, FALCON 20%, etc. | Chevron (OP) 39.20%, Falcon Oil 24%, Prodoil 0%, Kotoil 15%, Poliedro 12.50% -- **Operador ERRADO (SOMOIL → Chevron?)** |
| **Block 3/05** | Operador | SNL P&P | Sonangol E&P (OP) 36%, Afentra Angola LTD 30%, Maurel & Prom Angola 26.68% -- **Actualizar operador e consórcio** |
| **Block 3/05A** | Operador | Afentra | Sonangol E&P (OP) 33.33%, Afentra Angola LTD 21.33%, Maurel & Prom 40%, ETU 13.33%, NIS-Naftgas 05.33% -- **Actualizar** |
| **Block 3/24** | Concession | Sonangol 33.33% | Afentra (OP) 40%, Afentra Angola LTD, Maurel & Prom 40%, ETU 10%, NIS-Naftgas 04%, Sonangol E&P 20% -- **Actualizar** |
| **Block 4/05** | Concession | RANGER 35%, SONANGOL UEE 35%, BHP 30% | Sonangol E&P (OP) 50%, ACREP S.A. 19.75%, ETU Energias 18.75%, Sonangol E&P (OP) -- **Completamente diferente** |
| **Block 5/06** | Concession | Sonangol 100% | Sonangol E&P (OP) 100% -- OK |
| **Block 6/24** | Concession | Sonangol 50% | Sonangol E&P (OP) 50% -- Ajustar parceiros |

### 4. DEEP WATER (Águas Profundas)

| Bloco | Campo | Actual | Oficial |
|-------|-------|--------|---------|
| **Block 14** | Concession | Chevron 31%, Sonangol 20%, Galp 9%, Sonahydroc 10% | CABGOC (OP) 31%, Galp 09%, Sonahydroc 10%, Sonangol E&P 10%, SN des Pétroles du Congo (SNPC) 07.50% -- **Chevron→CABGOC, parceiros incompletos** |
| **Block 14K & A-IMI** | Concession | Actual data missing or incorrect | Trident Energy Cong SAU (OP), ETU Energias 20%, Sonangol 20%, Azule 10%, Sonangol E&P 10%, Galp -- **Novo bloco ou actualizar existente** |
| **Block 15** | Concession | Azule/ESSO 36% | ESSO (OP) 36%, Azule Energy Expl. (ANG) Ltd 24%, SSI 6.32%, Equinor Angola 12.16%, Sonangol E&P 10%, Total E&P Chissonga 15% -- **Actualizar** |
| **Block 15/06** | Concession | Azule 36.84% | Azule Energy Ang S.p.A (OP) 36.84%, SSI -- **Nome completo** |
| **Block 16** | Concession | - | TOTAL Energies (OP) 65%, Sonangol E&P 10%, Total E&P Chissonga LDT 15% -- **Verificar** |
| **Block 16/21** | Concession | - | TotalEnergies (OP) 100% -- **Confirmar** |
| **Block 17** | Concession | - | TotalEnergies ANG (OP) 33%, Sonangol E&P 30%, Azule Energy Expl. 15.84%, SSI 0%, Equinor Angola 10%, ETU Energias 27.50%, Falcon Oil 05% -- **Actualizar** |
| **Block 17/06** | Concession | TotalEnergies 40%, Sonangol 30%, Equinor 15%, ExxonMobil 15% | TotalEnergies (OP) 30%, Sonangol E&P 30%, SSI 0%, Equinor Angola 07.50% -- **Grandes alterações nas percentagens** |
| **Block 18** | Concession | - | Azule Energy ANG (Block 18) B.V. 36.34%, Sonangol E&P 16.28%, Azule Exploration Beta Ltd 9.66% -- **Actualizar** |
| **Block 18/15** | Concession | - | Azule Energy (OP) 80%, Sonangol E&P 20% -- **Confirmar ou criar** |

### 5. ULTRA-DEEP WATER

| Bloco | Campo | Actual | Oficial |
|-------|-------|--------|---------|
| **Block 31** | Concession | TotalEnergies OP | TotalEnergies (OP), Azule Energy Expl (ANGO) Ltd (OP), SSI -- **Actualizar parceiros** |
| **Block 31/21** | Concession | Azule 50%, Sonangol 30%, Equinor 20% | Azule Energy Expl (ANGO) Ltd (OP), SSI, ESSO 15% -- **Grandes discrepâncias** |
| **Block 32** | Concession | - | 26.60%, 50.00%, Sonangol E&P 30%, Equinor Angola 50% -- **Actualizar** |
| **Block 34** | Operador | - | ANPG 100% (Oferta Permanente) -- **Confirmar fase** |
| **Block 44** | Concession | Esso 60%, Sonangol 40% | Esso Expl. Prod. Ang. (Bloco 44) Ltd (OP) 60%, Sonangol E&P 40% -- OK |
| **Block 45** | Concession | Esso 60%, Sonangol 40% | Mesma -- OK |
| **Block 46** | Concession | Azule 40%, Equinor 40%, Sonangol 20% | Azule Energy Angola B.V. (OP) 40%, Equinor 40%, Sonangol E&P 20% -- OK |
| **Block 47** | Concession | - | Azule Energy Angola B.V. (OP), Equinor, Sonangol E&P -- **Verificar** |
| **Block 49** | Concession | - | CABGOC (OP) 45%, BG International 35%, Sonangol E&P 20% -- **Actualizar** |
| **Block 50** | Concession | CABGOC 45%, BG 35%, Sonangol 20% | Confirmar -- OK |

### 6. KON Blocks - Discrepâncias mais Relevantes

| Bloco | Campo | Actual | Oficial |
|-------|-------|--------|---------|
| **KON2** | Concession | MTI 10%, Intank 50%, MTI Inc. 40% | MTI Energy (OP), Intank Group (OP) 50%, MTI Energy Inc. 40% -- **Ajustar** |
| **KON4** | Concession | Sonangol 60%, ACREP 40% | Sonangol E&P (OP), Intank Group 30%, ANPG 100% -- **Discrepância** |
| **KON5** | Concession | Vazio (Bidding) | ANPG 100% -- **Confirmar** |
| **KON6** | Concession | Sonangol 30%, Simples Oil 10%, Sonangol 60% | Simples Oil (OP), Brite's Oil and Gas 25%, Alfort (OP), Apex 20%, Simples Oil 20%, Omega Risk 05% -- **Discrepância total** |
| **KON11** | Concession | Alfort 50%, Sonangol 50% | Sonangol E&P (OP) 30%, Brite's Oil and Gas 25%, Apex 20%, Simples Oil 20%, Omega Risk 05% -- **Discrepância** |
| **KON12** | Concession | Sonangol 30%, MTI 30%, Apex 25%, Omega 15% | Sonangol E&P (OP) 30%, MTI Energy Inc. 30%, Apex (OP) 25%, Omega Risk 15% -- Basicamente OK, ajustar nomes |
| **KON15** | Concession | Afentra 45%, Sonangol 55% | Sonangol E&P (OP) 55%, Afentra 45% -- **Trocar operador** |
| **KON16** | Concession | Apex 30%, Sonangol 55%, Brite's 15% | Apex (OP) 35%, Sonangol E&P (OP) 55%, Intank Group 30%, MTI Energy Inc. 20%, Brite's 15% -- **Discrepância** |
| **KON17** | Concession | MTI 60%, Brite's 20%, Mineral One 20% | MTI Energy (OP), Brite's 20%, Mineral One 20%, Enagol 10% -- **Ajustar** |
| **KON19** | Não existe | - | ACREP (OP), Brite's 20%, Afentra 45%, Mineral One 20%, Enagol 10% -- **NOVO bloco a criar** |
| **KON20** | Não existe | - | MTI Energy (OP), Afentra 45%, Brite's 50% -- **NOVO bloco a criar** |

### 7. Blocos Referidos no Mapa que Não Existem no Código

- **Block CON7** (ETU Energias OP)
- **Block 14/23-ZIC** (referido no mapa, dados de concessão por confirmar)
- **Block 20/11** (TotalEnergies OP 40%, Sonangol E&P 37.7%, Petronas 40%)
- **Block 22/11** (mencionado no mapa)
- **Block 23** (Afentra Angola LTD 40%)
- **Block 24** (referido, TotalEnergies & ExxonMobil 42.80%)
- **Block 25** (22.80%)
- **Block 27** (Sonangol E&P (OP) 100%)
- **Block 28** e **Block 29** (mencionados)
- **Block 30** (Esso Expl. Prod. Ang. (Block 30) Ltd OP)
- **Block 37/11** (mencionado)
- **Block 38** (mencionado)
- **KON19**, **KON20**, **KON23** (mencionados)

## Plano de Implementação

### Tarefa 1: Corrigir Concession Partners dos Blocos Existentes (~35 blocos)
- Actualizar `concession[]`, `operator` e `partners[]` para todos os blocos onde foram identificadas discrepâncias com o mapa oficial
- Padronizar nomes das entidades (ex: "Chevron" → "CABGOC" no Bloco 14, nomes completos das empresas)

### Tarefa 2: Adicionar Blocos em Falta (~15 blocos)
- Criar entradas para: CON7, Block 20/11, Block 22/11, Block 23, Block 24, Block 25, Block 27, Block 28, Block 29, Block 30, Block 37/11, Block 38, KON19, KON20, KON23
- Incluir dados mínimos: id, name, operator, concession, phase, basin, waterDepth, mapPosition

### Tarefa 3: Validar Totais de Blocos por Fase
- Após as alterações, confirmar que a distribuição por fase (Production/Development/Exploration/Bidding) permanece alinhada com os dados oficiais da ANPG

## Notas Técnicas
- O PDF tem OCR de qualidade variável -- algumas percentagens podem ter erros de leitura (ex: "0.00%" vs "10.00%")
- Ficheiro a editar: `src/data/angolaBlocks.ts`
- Impacto: KPIs, mapa, painel de blocos, comparação de operadores serão automaticamente actualizados via derivação dos dados

