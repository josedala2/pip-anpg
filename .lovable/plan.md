

# Redesign Visual da Plataforma ANPG Concession Vision

## Objetivo
Refinar o esquema de cores, tipografia e layout geral para alinhar com a identidade institucional da ANPG (#f4323f como cor primária de marca), melhorar a legibilidade dos textos e tornar a plataforma visualmente mais premium e atrativa.

## Alterações Planeadas

### 1. Esquema de Cores (src/index.css)
- **Cor primária**: Mudar de azul (199 89% 48%) para o vermelho ANPG (#f4323f → HSL ~355 90% 58%)
- **Accent**: Derivar do vermelho ANPG (tons suaves para fundos, tons fortes para destaques)
- **Ring/Focus**: Alinhar com a nova primária
- **Sidebar primary**: Alinhar com vermelho ANPG
- **Manter** as cores semânticas (success verde, warning amarelo, danger vermelho mais escuro) diferenciadas da primária
- **Modo escuro**: Ajustar os mesmos tokens para variantes escuras do vermelho ANPG
- **Linha de acento vermelha 4px** no topo do header (reforçar se já não estiver presente)

### 2. Legibilidade e Tipografia (src/index.css + componentes)
- **Foreground modo claro**: Aumentar contraste (escurecer ligeiramente o texto base)
- **Muted-foreground**: Garantir ratio WCAG AA mínimo (subir de 47% para ~40% luminosidade)
- **Tamanhos de texto mínimos**: Substituir `text-[8px]` e `text-[10px]` por `text-[10px]` e `text-xs` respetivamente nos KPIs e labels
- **Font-weight**: Reforçar peso em títulos de secção e labels de navegação

### 3. Header Institucional (src/pages/Index.tsx)
- Adicionar borda superior vermelha de 4px (`border-t-4 border-[#f4323f]`) no header
- Refinar o título: "Sistema de Gestão de Concessões" com subtítulo "Plataforma de Inteligência Petrolífera"
- Melhorar contraste dos tabs de navegação (active state com fundo subtil + texto mais escuro)
- Botões de ação (tema, relatórios) com hover states mais definidos

### 4. Cards e Painéis (src/index.css + componentes)
- **glass-card**: Refinar sombras para mais profundidade; adicionar subtil borda top vermelha em cards destacados
- **accent-border-card**: Usar vermelho ANPG como cor padrão do acento lateral
- **KPI cards**: Melhorar padding e espaçamento para respiração visual
- **Overview panel**: Gradiente mais suave e distinto

### 5. Mapa e Badges de Fase (src/index.css)
- Garantir que as cores de fase (production, development, exploration, etc.) mantêm contraste adequado contra o novo esquema
- Chart colors: Reordenar para o chart-1 usar vermelho ANPG

### Ficheiros Afetados
- `src/index.css` — Variáveis CSS (cores, sombras, utilitários)
- `src/pages/Index.tsx` — Header, tabs, estrutura
- `src/components/dashboard/OverviewSidebar.tsx` — Tamanhos de fonte mínimos
- `src/components/dashboard/KPICards.tsx` — Tamanhos de fonte mínimos
- `tailwind.config.ts` — Sem alterações estruturais necessárias (usa variáveis CSS)

