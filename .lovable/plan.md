

## Problema Identificado

Ao fazer scroll no conteúdo da página `/blocos`, a navbar e/ou a sidebar também se movem. O scroll deveria acontecer apenas na área de conteúdo (`<main>`), mantendo a navbar e a sidebar fixas.

## Análise Técnica

O layout actual em `DashboardLayout.tsx`:
```text
┌─────────────────────────────────┐
│ TopNavbar (shrink-0, z-50)      │  ← relative, não fixed/sticky
├──────┬──────────────────────────┤
│Sidebar│ Breadcrumbs + Main      │  ← flex-1, overflow-hidden
│      │  main: overflow-y-auto   │
└──────┴──────────────────────────┘
```

O problema provável: o `overflow-hidden` no container intermédio pode não estar a conter correctamente o scroll, ou o conteúdo do `BlocksPanel` (374 linhas de componente) está a forçar overflow no nível errado (e.g. no `body` ou no wrapper do `SidebarProvider` em vez de no `<main>`).

Adicionalmente, os overrides CSS em `index.css` forçam `position: sticky` na sidebar, mas a navbar não tem `sticky` — é apenas `relative`. Se o scroll acontece num nível acima do `<main>`, ambos se movem.

## Plano de Correcção

### 1. Fixar a Navbar com `sticky top-0`
**Ficheiro:** `src/components/layout/TopNavbar.tsx`
- Mudar o wrapper de `relative z-50` para `sticky top-0 z-50` para garantir que a navbar fica sempre fixa no topo, independentemente de onde o scroll aconteça.

### 2. Garantir que o layout impede scroll no nível errado
**Ficheiro:** `src/components/layout/DashboardLayout.tsx`
- Adicionar `overflow-hidden` ao wrapper principal (`min-h-screen flex flex-col w-full`) para impedir scroll no body.
- Garantir que apenas o `<main>` tem `overflow-y-auto`.

### 3. Fixar a Sidebar com posicionamento correcto
**Ficheiro:** `src/index.css`
- Verificar que o override `[data-sidebar="sidebar"]` usa `position: sticky; top: 0; height: 100%` correctamente para que a sidebar não se mova com o scroll do conteúdo.

### Resultado Esperado
- Navbar fixa no topo em todas as circunstâncias
- Sidebar fixa na lateral, sem mover ao scroll
- Apenas o conteúdo principal (`<main>`) faz scroll

