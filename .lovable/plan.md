

## Dados do Documento Ainda Não Incluídos na Plataforma

Após análise detalhada do PDF vs. dados em `angolaBlocks.ts`, identifiquei **6 categorias** de dados novos que existem no documento mas não estão na plataforma:

---

### 1. Dados Nacionais — Previsão de Produção 2025-2050 por Bacia
**Página 3 do documento** — Gráfico "Produção de Petróleo, Angola 2025-2050" com projecções até 1.682k BOPD, discriminado por:
- Produção de Base (blocos actuais)
- Oportunidades descobertas com data FID (IP 2026-2030+)
- Oportunidades descobertas sem data FID
- Breakdown por bacia (Baixo Congo, Kwanza, Benguela, Namibe, Bacias Interiores)

**Dados específicos**: Lista completa de projectos com datas de IP esperadas (ex: B0 Banzala Pilot IP 2026, B17 Dalia Deep EPS IP 2027, etc.)

**Actualmente na plataforma**: Não existe nenhuma estrutura de dados nacional de previsão de produção.

### 2. Dados Nacionais — Utilização do Gás Natural (2017-2025)
**Página 6** — Tabela completa com 9 anos de dados:
- Gás Injectado, Combustível, Queimado, Exportado ALNG, Gas Lift (MMSCFD)
- Previsão de fornecimento de gás à ALNG com défice estrutural de 1.5 TCF a partir de 2035
- Médias de fornecimento: 2025-2030 (1.165 MMSCFD), 2031-2040 (3.284), 2041-2050 (2.168)

**Actualmente na plataforma**: Não existe.

### 3. Dados Nacionais — Levantamentos Acumulados (1988-2025)
**Página 5** — Distribuição de levantamentos acumulados por entidade:
- Total: 13.189 MMBO
- GE: 7.888 (60%), SNL: 2.123 (16%), Conc.: 3.214 (24%)
- Top contribuintes ANPG: B17 1.371 (43%), B15 1.211 (38%), B3/05 298 (9%), B14 272 (8%)

**Actualmente na plataforma**: Não existe.

### 4. Bloco 0 — Tabela de Recomendações Técnicas (Medidas Possíveis)
**Página 15** — Tabela detalhada com 8 linhas:

| Oportunidade | Medidas | Impacto | Urgência |
|---|---|---|---|
| Simplificação modelo operacional | Simplificar estrutura, reduzir plataformas tripuladas | Redução estrutural OPEX | Muito Alta |
| Racionalização plataformas | Converter em unmanned, consolidar hubs | Redução significativa custos | Alta |
| Optimização logística | Racionalizar frota PSV/AHTS, optimizar helicópteros | -10-20% custo logístico | Alta |
| Maximizar recuperação | Optimizar injecção água/gás, recompletação poços | Aumentar produção | Alta |
| Digitalização operações | Centros de operação, digital twins | Redução pessoal offshore | Média |
| etc. | ... | ... | ... |

**Actualmente**: Existe SWOT mas não existe esta tabela de medidas/recomendações técnicas.

### 5. Bloco 2/05 — Tabela de Recomendações Técnicas
**Página 34/44** — Similar ao Bloco 0, com 7 medidas específicas (optimização energética, sistemas de segurança, racionalização plataformas, etc.)

**Actualmente**: Não existe.

### 6. Bloco 0 — Escala de Equipamentos por Área (Anexo)
**Página 25** — Tabela detalhada com capacidades por área (GTA, GMA, Area B/Mafumeira, FPSO):
- Design capacity, reservas originais, peso total topside, nº plataformas
- Nº geradores, turbinas, poços activos, compressores
- Potência instalada, capacidade LPG, etc.

**Actualmente**: Existe `platformSpecs` genérico mas não este nível de detalhe por área operacional.

---

### Resumo de Prioridade

| # | Dados | Impacto Visual | Complexidade |
|---|---|---|---|
| 1 | Previsão Produção Nacional 2025-2050 | Alto (novo painel executivo) | Alta |
| 2 | Utilização Gás Natural | Alto (novo painel estratégico) | Média |
| 3 | Levantamentos Acumulados | Médio (complementa dados existentes) | Baixa |
| 4 | Recomendações Técnicas B0 | Alto (complementa SWOT) | Média |
| 5 | Recomendações Técnicas B2/05 | Alto (complementa SWOT) | Média |
| 6 | Escala Equipamentos B0 | Baixo (detalhe técnico) | Média |

### O que recomendo

Os itens **4 e 5** (tabelas de Recomendações Técnicas/Medidas Possíveis) são os mais úteis para o CA — mostram acções concretas com urgência e impacto. Podem ser integrados como novo campo no tipo `OilBlock` e apresentados como painel adicional na página do bloco.

Os itens **1 e 2** (Previsão Nacional e Gás) seriam painéis novos no dashboard executivo com alto valor estratégico.

Que itens gostaria de priorizar para inclusão?

