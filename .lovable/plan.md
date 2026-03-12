

# Plano: Nova Aba "Operadores"

## Resumo

Criar um novo painel/aba "Operadores" no dashboard principal que agrega toda a informação por operador, permitindo a gestores uma visão 360° de cada empresa operadora em Angola.

## Dados Disponíveis

Toda a informação já existe no ficheiro estático `angolaBlocks.ts`. A nova aba agrega por operador (campo `operator` de cada `OilBlock`), cruzando:
- Blocos operados, fase, bacia, tipo de águas
- Produção total e por bloco (BOPD)
- Reservas estimadas
- Investimento acumulado e planeado
- Consórcio e participações (shares)
- Dados contratuais (datas, bónus, tipo contrato)
- Exploração (poços, sísmica, discoveries)
- HSE e dados ambientais
- Instalações e capacidade
- Dados económicos (NPV, Opex/barril)

## Estrutura da Nova Aba

### 1. Vista Geral (lista de operadores)
- Cards/tabela com todos os operadores únicos
- Para cada operador: nº blocos, produção total, reservas, investimento, compliance médio
- Barra de pesquisa e ordenação por produção/blocos/investimento
- Gráfico de quota de produção por operador (Pie/Bar chart)

### 2. Detalhe do Operador (ao clicar num operador)
Painel expandido ou slide-in com sub-abas:

- **Perfil**: Nome, nº blocos, produção total, reservas totais, investimento total, score compliance médio
- **Blocos Operados**: Tabela com todos os blocos (fase, bacia, produção, reservas, contrato)
- **Produção**: Produção total do operador, breakdown por bloco (bar chart), histórico mensal agregado
- **Contratos & Consórcio**: Detalhes contratuais de cada bloco, parceiros e shares, bónus, condições fiscais
- **Exploração**: Agregação de poços, sísmica, discoveries por bloco
- **Financeiro**: Investimento acumulado/planeado, Opex/barril médio, NPV agregado
- **HSE**: Indicadores agregados de segurança e ambientais
- **Instalações**: Listagem de plataformas, FPSOs, capacidade total

## Ficheiros a Criar/Modificar

1. **`src/components/dashboard/OperatorsPanel.tsx`** (novo) — Componente principal com lista de operadores e detalhe
2. **`src/pages/Index.tsx`** — Adicionar "Operadores" ao array `allPanels` e renderizar `<OperatorsPanel />` no conteúdo
3. **`src/hooks/useUserRole.ts`** — Adicionar "Operadores" às permissões de cada role em `PANEL_PERMISSIONS`

## Detalhes Técnicos

- Dados derivados com `useMemo` agrupando `oilBlocks` por `operator`
- Reutilização dos componentes existentes: `ChartWrapper`, `AnimatedCounter`, `Badge`, `Table`, `Tabs`, `Collapsible`
- Gráficos com Recharts (PieChart para quota, BarChart para produção por bloco)
- Estado local para operador selecionado e sub-aba activa
- Sem alterações na base de dados — tudo derivado do dataset estático existente

