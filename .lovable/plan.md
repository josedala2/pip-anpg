

## Plano: Consolidar 13 abas em 8

### Estrutura actual (13 abas)
1. Visão Geral
2. Estado da Concessão
3. Visão Económica
4. Financeiro & Contratual
5. Consórcio
6. Exploração
7. Produção
8. Projecções
9. Instalações
10. HSE & Ambiente
11. Análise SWOT
12. Documentos & Legislação
13. Homologações

### Nova estrutura (8 abas)

| # | Nova aba | Conteúdo fusionado |
|---|---|---|
| 1 | **Visão Geral** | Mantém (KPIs, info gerais, dados contratuais resumidos) |
| 2 | **Estado da Concessão** | Mantém (semáforo de decisão) |
| 3 | **Económico & Financeiro** | Fusão de "Visão Económica" + "Financeiro & Contratual" + "Consórcio". Sub-secções internas com headers visuais para separar: painéis económicos ANPG, CAPEX/investimento, composição do consórcio |
| 4 | **Exploração** | Mantém (sísmica, poços, prospectos, campos) |
| 5 | **Produção & Projecções** | Fusão de "Produção" + "Projecções". Gráfico de produção histórica seguido das projecções num fluxo contínuo |
| 6 | **Instalações & HSE** | Fusão de "Instalações" + "HSE & Ambiente". Secção de facilidades seguida de indicadores HSE e ambientais |
| 7 | **Análise SWOT** | Mantém (geração IA, conteúdo dinâmico — justifica aba própria) |
| 8 | **Documentos** | Fusão de "Documentos & Legislação" + "Homologações". Legislação + pesquisa de homologações numa só vista |

### Alterações técnicas

| Ficheiro | Alteração |
|---|---|
| `src/pages/BlockPage.tsx` | Reduzir TabsTriggers de 13 para 8. Mover conteúdo das abas fusionadas para dentro da aba-mãe com headers `<h3>` ou `<Card>` separadores. Remover states/imports que ficarem órfãos. |

### Detalhes de fusão

**Aba "Económico & Financeiro"**: Renderizar em sequência vertical:
1. `<EconomicVisionTab>` (se existir dados)
2. Secção CAPEX actual (gráfico + tabela)
3. Secção Consórcio (pie chart + tabela de parceiros)

**Aba "Produção & Projecções"**: Renderizar em sequência:
1. Conteúdo actual da aba Produção (gráfico área + campos)
2. Separador visual
3. Conteúdo actual da aba Projecções (cenários + gráfico linhas)

**Aba "Instalações & HSE"**: Renderizar em sequência:
1. `<FacilitiesTab>` (se existir facilityData)
2. `<HSEEnvironmentTab>`

**Aba "Documentos"**: Renderizar em sequência:
1. `<LegislationSearch>` (documentos e legislação)
2. `<HomologacoesPanel>` (com filtro por bloco)

