

## Auditoria e Correcção de Responsividade da Plataforma

### Problemas Identificados

1. **Sidebar sem acesso mobile** — A sidebar usa `hidden md:block`, ficando completamente inacessível em ecrãs <768px. Não existe menu hamburger nem drawer alternativo.

2. **BlockPage — Tabs com overflow** — 9 TabsTriggers em `flex-wrap` ficam desorganizados em tablets e ilegíveis em mobile.

3. **Header — Selector de período oculto em mobile** — O selector "Actual / 6M / 12M / 24M" usa `hidden md:flex` sem alternativa mobile.

4. **Home Executiva — Painéis Detalhados** — Grid `md:grid-cols-5` no drill-down buttons pode ficar apertado em tablets (768-1024px).

5. **KPICards** — Grids de KPIs executivos podem não ter breakpoints intermédios adequados.

### Alterações Propostas

#### 1. Sidebar Mobile — `src/components/ui/sidebar.tsx` + `src/pages/Index.tsx`
- A sidebar do shadcn já suporta modo Sheet (drawer) em mobile — verificar se está activo
- Se não, garantir que o `SidebarTrigger` fica visível em mobile e abre o drawer

#### 2. BlockPage Tabs — `src/pages/BlockPage.tsx`
- Envolver a `TabsList` num scroll horizontal em mobile: `overflow-x-auto` + `flex-nowrap` em vez de `flex-wrap`
- Adicionar `scrollbar-hide` para ecrãs pequenos

#### 3. Header Period Selector — `src/pages/Index.tsx`
- Remover `hidden md:flex` e usar layout compacto em mobile (ícone com dropdown ou tamanho menor)

#### 4. Drill-down Buttons — `src/components/dashboard/ExecutiveHome.tsx`
- Alterar grid de `md:grid-cols-5` para `grid-cols-2 md:grid-cols-3 xl:grid-cols-5` com melhor progressão

#### 5. Verificação geral de overflow
- Garantir que todas as tabelas usam `overflow-x-auto`
- Verificar que gráficos Recharts usam `ResponsiveContainer` (já usado na maioria)

### Ficheiros afectados
- `src/pages/Index.tsx`
- `src/pages/BlockPage.tsx`
- `src/components/dashboard/ExecutiveHome.tsx`
- `src/components/ui/sidebar.tsx` (verificação)

