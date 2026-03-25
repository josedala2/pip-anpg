

## Remover todos os dados gerados por IA da plataforma

### Contexto
Os blocos com dados reais carregados são: **Bloco 0**, **Bloco 2/05** e **Bloco 3/05**. Dentro destes e noutros blocos, existem dados que foram gerados por IA em vez de carregados a partir de documentos oficiais.

### Dados a remover

**Bloco 0** (`block-0`):
- `fields` array (47 campos/descobertas, linhas ~583-629) — nomes reais mas datas e produções estimadas pela IA
- `prospects` array (10 prospectos, linhas ~659-670) — nomes e valores inventados pela IA

**Bloco 3/05** (`block-3`):
- `fields` array (3 campos: Punja, Caco, Gazela, linhas ~1515-1519) — gerado por IA
- `seismicData` array (linhas ~1497-1500 aprox.) — verificar se foi carregado ou gerado
- `wellsData` array (linhas ~1501-1513) — verificar se foi carregado ou gerado

**Bloco 1/14** (`block-1`):
- `productionHistory` (12 meses, linhas ~1885-1890) — gerado por IA
- `capexHistory` (5 anos, linhas ~1892-1895) — gerado por IA
- `projections` — gerado por IA
- `seismicData`, `wellsData`, `fields` (Caco Gazela), `explorationSummary` — gerado por IA
- Valores numéricos: `dailyProduction`, `estimatedReserves`, `accumulatedInvestment`, etc. — gerados por IA

### O que se mantém
- **Bloco 0**: Todos os dados excepto `fields` e `prospects` (contrato, sísmica, poços, HSE, ambiental, facilidades, económico, desenvolvimento, visão económica, cenários — tudo carregado pelo utilizador)
- **Bloco 2/05**: Todos os dados (contrato, consórcio, sísmica, poços, campos, prospects, explorationSummary — carregados pelo utilizador)
- **Bloco 3/05**: Dados de contrato e consórcio (carregados). Os `fields`, `seismicData` e `wellsData` precisam de confirmação
- **Todos os outros blocos**: Metadados estruturais do Mapa ANPG 2026 (operador, consórcio, fase, bacia) mantêm-se; já têm `pendingRealData: true` e arrays vazios

### Alterações técnicas

1. **`src/data/angolaBlocks.ts`**:
   - Bloco 0: remover `fields: [...]` (substituir por `fields: []`) e `prospects: [...]` (substituir por `prospects: []`)
   - Bloco 1/14: limpar `productionHistory`, `capexHistory`, `projections`, `seismicData`, `wellsData`, `fields`, `explorationSummary`; zerar valores numéricos fabricados (`dailyProduction: 0`, etc.); adicionar `pendingRealData: true`
   - Bloco 3/05: remover `fields` (substituir por `fields: []`) — sísmica e poços a confirmar com utilizador

2. **Sem alterações de UI**: Os componentes já tratam arrays vazios graciosamente (mostram "Sem dados" ou ocultam secções)

### Pergunta pendente
Os dados de **sísmica** e **poços** do Bloco 3/05 foram carregados por si ou também foram gerados? Isto determina se os mantemos ou limpamos.

