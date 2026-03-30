

## Análise: Dados do Documento vs. Plataforma — Bloco 0

Analisei detalhadamente as 29 páginas do documento "Estado das Concessões — Bloco 0" e comparei com os dados actuais em `angolaBlocks.ts`. A maioria dos dados já está na plataforma. Seguem os **conteúdos em falta ou desactualizados**:

---

### Dados JA incluidos (confirmados correctos)
- Enquadramento geral, consórcio, condições fiscais, decretos
- Produção média 119,285 BOPD, Reservas 421 MMBO, Eficiência 88%
- Dados HSE 2019-2025 (FAT, LTI, RWDC, MTC, FAC)
- Dados ambientais (derrames, Oil-in-Water, gás queimado, CO2)
- Exploração (sísmica 2D/3D, poços, taxa de sucesso 62%)
- Visão económica (NPV, cash flows, custos, abandono)
- Projectos de desenvolvimento (Lifua, Nemba, Banzala, Malongo West, Mafumeira)
- Infraestruturas e Asset Tiering
- Recomendações técnicas (já parcialmente incluídas)

---

### Conteudos em FALTA (6 categorias)

#### 1. Dados HSE actualizados — RWDC/MTC inconsistentes
O documento mostra que em 2019-2025 o Bloco 0 tem **FAT=0, LTI=0, RWDC=0, MTC=0** na tabela principal (pag 10), mas depois menciona "MTC saltou de 1 em 2022 para 12 em 2023 e 16 em 2024, reduzindo para 7 em 2025" e "FAC crescente de 16 em 2021 para 34 em 2025". Os nossos dados HSE actuais têm RWDC com valores (3,7,2,3,9,3,5,2) que não correspondem ao documento. **Necessita reconciliação.**

#### 2. Análise SWOT do Bloco 0 (pag 26) — NAO EXISTE na plataforma
O documento inclui uma análise SWOT completa com Forças, Fraquezas, Oportunidades e Ameaças. Actualmente o `OilBlock` não tem campo para SWOT estática por bloco — apenas o chatbot Soba gera SWOTs dinâmicas via IA.

#### 3. Gás Natural — Balanço de Massa do Bloco 0 (pag 22) — NAO EXISTE
Dados específicos do B0: Reservas de gás 2,891 BSCF, Infraestrutura CRX 600 MMSCFD, Oportunidades ~3 TCF, Produção média gás 1,191 MMSCFD, GOR 3,631 SCF/STB. Índice de utilização: Injecção 38%, Combustível 12%, Queima 1%, Exportação 49%.

#### 4. Cenário Proposto Tier 1/Tier 2&3 (pag 23) — NAO EXISTE
Proposta estratégica de divisão do Bloco 0 em novas concessões por Tier, com medidas específicas para cada (redemarcação, cedência de IP, incentivos, perfuração entre poços existentes, monetização DROs de gás).

#### 5. Perfis de Produção por Tier (pag 24-25, 29) — NAO EXISTEM
Gráficos de previsão de produção 2026-2050 separados por Tier 1 (N'Dola Sul, Sanha Sul, Nemba, Mafumeira ~80k→20k BOPD) e Tier 2+3 (Takula, Lifua, Banzala, Malongo ~30k→5k BOPD).

#### 6. Escala de Equipamentos por Área (pag 28) — NAO EXISTE
Tabela detalhada com parâmetros por área (GTA, GMA, Area B, Mafumeira FPSO): capacidade de design, reservas originais, peso de topsides, nº de plataformas, geradores, turbinas, poços activos, potência instalada, compressores.

---

### Dados a CORRIGIR

#### Desempenho dos Projectos de Desenvolvimento (pag 17)
O documento dá descrições actualizadas mais detalhadas:
- **Lifua**: "Desempenho impactado por falhas de Bombas PSP. Recuperação em 2025, substituição das bombas"
- **Nemba Infills**: "Produção superou as expectativas" (actualmente temos status "Below Plan", deveria ser actualizado)
- **Banzala**: "Baixo índice de produção, poços fechados devido à emulsão" (actualmente temos "On Track", deveria ser "Below Plan")
- **Malongo West**: "Falhas mecânicas em ESP, poços do Lote 1 não entraram em produção, Lote 2 reservatório esgotado, Lote 3 removido"
- **Mafumeira Infills**: "Falta de pressão do reservatório, mais gás e menos óleo"

#### Total de Abandono
Documento diz MMUSD **3,665** mas temos MMUSD 3,420 no código. Corrigir.

#### Fases de Pesquisa (pag 9) 
Dados detalhados das fases de pesquisa actualizados: "1.º Poço 119-D perfurado em 2025, seco. 2.º e 3.º poços a serem agendados para 2026."

---

### Plano de Implementação

**Ficheiro a modificar**: `src/data/angolaBlocks.ts`

1. **Corrigir HSE** — Reconciliar valores de RWDC/MTC com documento oficial
2. **Adicionar campo SWOT** — Novo tipo `SwotAnalysis` no `OilBlock` com arrays de strings para Forças/Fraquezas/Oportunidades/Ameaças
3. **Adicionar dados de Gás do Bloco** — Novo campo `gasBalance` com reservas, produção média, GOR, índice de utilização
4. **Corrigir projectos de desenvolvimento** — Actualizar status e observações do Nemba, Banzala, Malongo West
5. **Corrigir valor de abandono** — 3,420 → 3,665 MMUSD
6. **Adicionar cenário estratégico Tier** — Expandir `revitalizationScenarios` com a proposta de divisão
7. **Adicionar escala de equipamentos** — Novo campo opcional na `FacilityData`

**Ficheiros de UI potencialmente afectados** (para mostrar novos dados):
- `src/components/dashboard/SwotAnalysis.tsx` — Renderizar SWOT estática quando disponível
- `src/components/dashboard/GasUtilizationPanel.tsx` — Mostrar balanço de gás por bloco

**Prioridade**: Itens 1-5 são correcções de dados (alta prioridade). Itens 6-7 são dados novos (média prioridade).

