

## Plan: Adicionar dados contratuais e legislativos aos Blocos 2/05, 3/05 e 4

### Objectivo
Popular os blocos existentes (block-2-05, block-3, block-4-05) com dados reais extraídos dos anexos, incluindo contractInfo, legislationDocs, e actualização do consórcio/concession.

### Dados Extraídos dos Anexos

**Bloco 2/05:**
- Decreto 69/05, 26 de Setembro | CPP | Assinatura: 04/10/2005 | Efectiva: 01/11/2005
- Área: 3.437,81 km² | Offshore Bacia do Baixo Congo
- GE Inicial: SOMOIL (Op.) 30%, SNL 50%, KOTOIL 10%, POLIEDRO OIL 10%
- GE Actual: SOMOIL (Op.) 30%, FALCON 20%, KOTOIL 12.5%, POLIEDRO 12.5%, PRODOIL 12.5%, ACREP S 12.5%
- Pesquisa: F. Inicial 3 anos (1 poço), F. Subs. 2 anos (1 poço)
- Produção: 20 anos a partir da DDC | 1ª Produção: 3 anos a partir da DDC
- Fiscal: Amortização C.Desenv. 25%/ano, IRP 50%, Cost Oil 80%/85%, Uplift 1.40
- Bónus Proj. Sociais: US$ 500.000
- Situação: Em fase de produção

**Bloco 3/05:**
- Decreto-Lei 73/05, 28 de Setembro | CPP | Assinatura: 04/10/2005 | Efectiva: 01/11/2005
- Área: 162,14 km² | Offshore Bacia do Baixo Congo
- GE Inicial: SNLP&P (Op.) 25%, CHINA SONANGOL 25%, AJOCO 20%, ENI 12%, SOMOIL 10%, NIS-NAFTASGAS 5%, INA 4%
- GE Actual: SNL P&P (Op.) 50%, AJOCO 20%, ENI 12%, SOMOIL 10%, NIS-NAFTASGAS 5%, INA 4%
- Produção: 20 anos | Fiscal: C.Desenv. 25%/ano, IRP 50%, Cost Oil 50%/65%, Uplift 1.33
- Estado/GE: 70% / 30% | Bónus Assinatura: US$ 17.5M | Contr. Proj. Sociais: US$ 12.5M (faseado)
- Situação: Operador solicitou unificação dos CPP do Bloco 3/05 e 3/05A

**Bloco 4 (actualizar block-4-05):**
- Decreto 75/91, 13 de Dezembro | CPP | Assinatura: 10/09/91 | Efectiva: 01/07/92
- Área: 4.999,65 km² | Offshore Bacia do Kwanza
- GE Inicial: RANGER 80%, SONANGOL UEE 20%
- GE Actual (Último): RANGER 35%, SONANGOL UEE 35%, BHP PETROLEUM PTY LDA 20%
- Pesquisa: F. Inicial 3 anos (3 poços + sísmica 2D 1500km), 1ª F. Subs 1 ano (1 poço), 2ª F. Subs 1 ano (1 poço)
- Produção: 20 anos a partir da DDC | Fiscal: Amort. C.Desenv. 25%/ano, IRP 50%, Uplift 1.45*
- Descobertas: Poço 4/23-1 (DDC 20/09/93, suspenso), Campo Kiame (DDC 08/12/94, marginal), Poço 4/31-1-1-3 (18/07/96, não comercial)
- Situação: Concessão caducada
- Notas históricas: Ranger cedeu 20% à Sonangol (10/09/91), contrato assistência técnica, Sonangol EP abandonou Kiame (14/09/97)

### Passos de Implementação

1. **Actualizar Block 2/05** (id: block-2-05, ~linha 2636):
   - Actualizar `operator` para "SOMOIL", `areaKm2` para 3437.81
   - Actualizar `concession` com GE Actual real
   - Adicionar `contractInfo` completo (decreto, fiscal, pesquisa, bónus)
   - Adicionar `legislationDocs` (Decreto 69/05, DDC, notas fiscais)

2. **Actualizar Block 3/05** (id: block-3, ~linha 1176):
   - Actualizar `operator` para "SNL P&P", `areaKm2` para 162.14
   - Actualizar `concession` com GE Actual real
   - Adicionar `contractInfo` completo
   - Adicionar `legislationDocs` (Decreto-Lei 73/05, bónus assinatura, notas unificação 3/05A)

3. **Actualizar Block 4/05** (id: block-4-05, ~linha 1338):
   - Renomear para "Block 4" (Bacia do Kwanza), actualizar operador para "Ranger"
   - Actualizar `concession` com GE Actual, `phase` manter "Suspended" (concessão caducada)
   - Adicionar `contractInfo` completo (decreto, períodos de pesquisa detalhados, fiscal)
   - Adicionar `fields` com descobertas (Poço 4/23-1, Kiame)
   - Adicionar `legislationDocs` (Decreto 75/91, contratos assistência técnica, notas históricas)
   - Adicionar `historicalNotes` extensas com timeline de eventos

### Ficheiro a Modificar
- `src/data/angolaBlocks.ts` — 3 entradas de blocos existentes a actualizar com dados reais

