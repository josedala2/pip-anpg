

## Plano: Página dedicada por bloco com informações completas

### Objectivo
Criar uma rota `/block/:blockId` com página completa de informações para cada bloco, incluindo secções de Exploração (sísmica, poços), Produção, CAPEX, Consórcio, Risco e Projecções. No painel BlocksPanel e no mapa, adicionar botão "Mais Detalhes" que navega para essa página.

### Estrutura da nova página

```text
/block/:blockId
┌──────────────────────────────────────────────┐
│  Header: Nome do Bloco + Badge Fase + Voltar │
├──────────────────────────────────────────────┤
│  Tab 1: Visão Geral                         │
│    - Info grid (Operador, Bacia, Contrato..) │
│    - Risk Score + Compliance donut           │
│    - KPIs (Produção, Reservas, Investimento) │
├──────────────────────────────────────────────┤
│  Tab 2: Consórcio                            │
│    - Tabela de parceiros com % e barras      │
│    - Gráfico pie/donut do consórcio          │
├──────────────────────────────────────────────┤
│  Tab 3: Exploração & Sísmica                │
│    - Dados sísmicos do bloco (2D/3D/4D)     │
│    - Poços perfurados (Pesquisa/Avaliação)  │
│    - Objectivos geológicos                   │
├──────────────────────────────────────────────┤
│  Tab 4: Produção                             │
│    - Production Trend chart (12 meses)       │
│    - CAPEX vs Plan chart                     │
├──────────────────────────────────────────────┤
│  Tab 5: Projecções                           │
│    - Conservative / Base / Expansion lines   │
└──────────────────────────────────────────────┘
```

### Passos de implementação

1. **Expandir dados no `OilBlock` interface** (`angolaBlocks.ts`)
   - Adicionar campos opcionais: `seismicData` (array com `{ year, km2D, km3D, km4D }`), `wellsData` (array com `{ year, pesquisa, avaliacao }`), `geologicalObjectives` (string[]), `fields` (array de campos/descobertas com nome e status)
   - Preencher dados de exemplo para os blocos principais (Block 0, 14, 15, 17, etc.)

2. **Criar página `BlockPage.tsx`** (`src/pages/BlockPage.tsx`)
   - Rota: `/block/:blockId`
   - Usa `useParams` para obter o blockId e encontrar o bloco em `oilBlocks`
   - Layout com header fixo (nome, fase, botão voltar)
   - Tabs (Radix UI Tabs já instalado): Visão Geral, Consórcio, Exploração, Produção, Projecções
   - Cada tab renderiza secção dedicada com gráficos recharts

3. **Adicionar rota em `App.tsx`**
   - `<Route path="/block/:blockId" element={<BlockPage />} />`

4. **Adicionar botão "Mais Detalhes" no BlocksPanel**
   - No `BlockCard` expandido, adicionar link/botão que navega para `/block/${block.id}` usando `useNavigate`
   - Também acessível a partir do mapa (ao clicar num bloco, popup com opção "Ver Detalhes")

5. **Actualizar `ConcessionMap.tsx`**
   - No tooltip/popup de cada bloco, adicionar link "Mais Detalhes" que navega para a página do bloco

### Detalhes técnicos
- Usar `react-router-dom` `useParams` + `useNavigate` (já instalado)
- Usar `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` de `@/components/ui/tabs`
- Gráficos com `recharts` (PieChart para consórcio, AreaChart para produção, BarChart para sísmica/poços, LineChart para projecções)
- Página 404 se blockId não existir
- Botão "Voltar" navega para `/` com o painel de blocos activo

