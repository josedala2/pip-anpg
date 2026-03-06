

# Redesign do Painel Overview

## Problema Actual
O Overview tem um layout de mapa full-screen com sidebar de 420px à direita. Quando a sidebar está aberta, o mapa ocupa o espaço restante mas há muito espaço vazio no interior do mapa (território angolano sem blocos, oceano vazio). A sidebar contém KPIs compactos, lista de blocos e tendências em abas separadas -- o que esconde informação útil.

## Proposta de Redesign

### 1. Layout Split: Mapa (60%) + Dashboard (40%)
Substituir o layout actual (mapa 100% + sidebar sobreposta) por um layout dividido lado a lado:
- **Esquerda (60%)**: Mapa de concessões com legenda integrada
- **Direita (40%)**: Painel de informação sem abas -- toda a informação visível num scroll vertical contínuo

### 2. Informação Sempre Visível (sem abas)
Em vez de esconder conteúdo em abas (KPIs/Blocos/Tendências), mostrar tudo em sequência vertical:
- **KPIs** no topo (5 cards em grelha 3+2)
- **Mini gráfico de produção** (trend 6 meses)
- **Produção por Bacia** (barras horizontais)
- **Distribuição por Fase** (indicadores compactos)
- **Filtros** colapsáveis
- **Lista de Blocos** agrupada por bacia (com pesquisa)

### 3. Melhorias de Cor e Contraste
- Fundo do painel direito com gradiente subtil (não apenas bg-background/85)
- KPI cards com bordas coloridas à esquerda (accent border) em vez de glass-card genérico
- Separadores visuais entre secções com labels uppercase
- Mapa com fundo oceânico mais saturado para dar mais vida
- Dark mode: fundo do painel ligeiramente mais claro que o background para criar profundidade

### 4. Ficheiros a Alterar

**`src/components/dashboard/OverviewSidebar.tsx`** -- Refactoring principal:
- Remover sistema de abas (KPIs/Blocos/Tendências)
- Layout vertical contínuo com todas as secções visíveis
- Filtros colapsáveis no topo
- KPIs com design de accent border lateral
- Secções com headers consistentes e separadores

**`src/pages/Index.tsx`** -- Ajuste do layout Overview:
- Mudar de `relative` com sidebar absoluta para flex layout (60/40)
- Mapa à esquerda, painel à direita como elementos irmãos

**`src/index.css`** -- Refinamentos de cor:
- Novo utility `.accent-border-card` para KPIs com borda colorida
- Gradiente subtil para painel lateral
- Melhor contraste no ocean gradient do mapa

### 5. Resultado Esperado
Um painel Overview tipo "command center" onde toda a informação crítica (KPIs, tendências, distribuição, blocos) está visível sem cliques adicionais, com o mapa de concessões a complementar visualmente à esquerda. Zero espaço desperdiçado.

