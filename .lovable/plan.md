

## Integração da Base de Dados de Homologações na Plataforma ANPG

### Análise dos Dados

A base de dados contém **~1.200 registos** de homologações (2024–2025) com as seguintes colunas:

| Campo | Descrição | Relevância |
|-------|-----------|------------|
| MÊS / BLOCO | Período e bloco petrolífero | Agrupamento primário |
| FORNECEDOR | Nome do prestador de serviços | Top fornecedores |
| SERVIÇOS | Descrição do serviço contratado | Categorização |
| TIPO_PROCESSO | Tipo de apreciação (DHC, Concursos, etc.) | Análise processual |
| MONTANTE SOLICITADO / APROVADO (USD) | Valores financeiros | KPIs principais |
| EXPLORAÇÃO / DESENVOLVIMENTO / OPERAÇÃO / A&S | Repartição por categoria de custo | Decomposição orçamental |
| ACTIVIDADE | Fase operacional | Filtro |
| MODALIDADE DE CONTRATAÇÃO | Concurso Público, Adjudicação Directa, etc. | Transparência |
| REGIME DE SERVIÇO | Preferência, Exclusividade, Concorrência | Conteúdo local |
| TIPO DE ENTIDADE | SCDA, SCA, SE | Classificação entidade |
| OWNER | CA, ADM | Nível decisório |
| DECISÃO | Aprovado / Não Aprovado | Controlo |

**Totais globais:** ~$9.89 mil milhões solicitados, ~$9.76 mil milhões aprovados (taxa de aprovação ~98.6%).

### Proposta de Implementação

#### 1. Nova página `/homologacoes` — Painel de Homologações

Criar uma página dedicada com 4 visões em tabs, orientada para o Conselho de Administração:

**Tab 1 — Dashboard Executivo (visão rápida)**
- 6 KPI cards no topo: Total Aprovado, Nº Processos, Taxa Aprovação, Top Bloco, Top Fornecedor, Split CA vs ADM
- Gráfico de barras: Montante aprovado por Bloco (top 10)
- Gráfico donut: Repartição por categoria (Exploração / Desenvolvimento / Operação / A&S)
- Gráfico de barras horizontal: Top 10 Fornecedores por montante
- Mini-gráfico: Evolução mensal dos montantes aprovados

**Tab 2 — Análise por Bloco**
- Tabela resumo com todos os blocos: nº processos, total solicitado, total aprovado, taxa aprovação
- Ao clicar num bloco, expande detalhes dos processos desse bloco
- Filtros por mês, modalidade de contratação, tipo de processo

**Tab 3 — Análise de Fornecedores & Contratação**
- Top fornecedores com montantes e nº de contratos
- Repartição por modalidade (Concurso Público vs Adjudicação Directa vs Renovação)
- Repartição por regime de serviço (Preferência vs Exclusividade vs Concorrência)
- Repartição por tipo de entidade (SCDA vs SCA vs SE)

**Tab 4 — Tabela Detalhada**
- Tabela completa pesquisável e filtrável com todos os registos
- Filtros: Bloco, Mês, Fornecedor, Tipo Processo, Modalidade, Owner, Decisão
- Exportação CSV/Excel

#### 2. Ficheiro de dados estático

- Copiar o ficheiro para `public/data/homologacoes-2025.xlsb` (ou converter para JSON)
- Criar `src/data/homologacoesData.ts` com o dataset parseado e tipado
- Definir interface `Homologacao` com todos os campos relevantes

#### 3. Integração na navegação

- Adicionar "Homologações" ao painel lateral do Index (na lista `allPanels`)
- Adicionar link na navegação principal
- Também acessível como tab dentro de cada BlockPage (filtrado para esse bloco)

#### 4. Detalhes técnicos

- Parsear os dados do XLSB em build-time para um JSON/TS estático (~1200 registos, viável em memória)
- Componentes: `HomologacoesPanel.tsx` (dashboard principal), reutilizando Card, Table, Badge, Tabs existentes
- Gráficos com Recharts (já instalado)
- Filtros interactivos com Select/Input existentes

### Ficheiros a criar/editar

| Ficheiro | Acção |
|----------|-------|
| `src/data/homologacoesData.ts` | Novo — dataset completo tipado |
| `src/components/dashboard/HomologacoesPanel.tsx` | Novo — painel principal com 4 tabs |
| `src/pages/Index.tsx` | Editar — adicionar "Homologações" à lista de painéis |
| `src/pages/BlockPage.tsx` | Editar — adicionar tab "Homologações" filtrada por bloco |
| `src/App.tsx` | Sem alteração (painel integrado no Index) |

