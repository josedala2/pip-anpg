

## Reorganizar Navegação Principal com Sidebar Agrupada

### Problema
São actualmente **15 tabs numa linha horizontal**, o que dificulta a leitura e navegação, especialmente em ecrãs menores. Vários painéis são tematicamente relacionados mas aparecem ao mesmo nível.

### Solução
Substituir a barra de tabs horizontal por uma **sidebar colapsável à esquerda** com secções agrupadas por tema, usando o componente Sidebar do shadcn/ui.

### Agrupamento proposto

```text
┌─────────────────────┐
│ 🏠 Home Executiva   │  ← sempre visível no topo
├─────────────────────┤
│ ▾ Governance        │
│   CA                │
│   Homologações      │
├─────────────────────┤
│ ▾ Operacional       │
│   Concessões        │
│   Produção          │
│   Exploração        │
│   Instalações       │
├─────────────────────┤
│ ▾ Negócios          │
│   Contratos         │
│   Económico         │
├─────────────────────┤
│ ▾ Estratégia        │
│   Cenários          │
│   Previsão Geral    │
│   Previsão Nacional │
│   Gás Natural       │
│   Levantamentos     │
├─────────────────────┤
│ ✦ Soba (IA)         │
└─────────────────────┘
```

### Comportamento
- Sidebar colapsável para modo ícone (mini) com `collapsible="icon"`
- Grupos expandem/colapsam independentemente
- Item activo destacado com cor primária
- Modo apresentação mantém-se (sidebar esconde automaticamente)
- Header simplificado — remove a barra de tabs, mantém logo, período, alertas e acções
- Navegação por teclado (←→) e swipe mantém-se funcional

### Detalhes técnicos

**Ficheiros novos:**
1. `src/components/AppSidebar.tsx` — Sidebar com os 5 grupos, ícones por secção, highlight do painel activo

**Ficheiros editados:**
1. `src/pages/Index.tsx` — Envolver layout com `SidebarProvider`, remover barra de tabs horizontal, colocar `SidebarTrigger` no header, manter toda a lógica de painéis existente (só muda a navegação)

### O que NÃO muda
- Conteúdo de cada painel
- Drill-downs da Home Executiva
- Modo apresentação (sidebar esconde)
- Lógica de alertas, período, tema
- Header institucional com logo ANPG

