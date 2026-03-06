

## Plan: Adopt Reference Project Design System

### Analysis of Reference Design (angola-concessions-insight)

From the screenshot, the reference project uses:
- **Dark top navbar** (dark red/black gradient) with ANPG logo, title "Sistema de Gestão de Concessões", top-level nav links (Início, Concessões, Produção, Relatórios), search bar, notifications bell, and user avatar
- **Left sidebar** with menu sections (MENU PRINCIPAL: Dashboard, Upstream, Produção, Financeiro, Compliance, Documentos, Mapa GIS, Relatórios; ADMINISTRAÇÃO: Auditoria, Administração), ANPG branding at bottom
- **Breadcrumbs** below the navbar
- **Clean white content area** with large heading "Dashboard Executivo", subtitle, and a red "Nova Concessão" button
- **Quick-action cards** in a row (Dados de Produção, Compliance, Gerar Relatório) with red-tinted circular icons and arrow indicators
- **KPI stat cards** in a 6-column grid with uppercase labels, large mono numbers, trend indicators
- **Chart + sidebar alerts layout** (production trend chart alongside compliance alerts list)
- **Font**: Inter (already in use), clean and professional
- **Color scheme**: White background, dark navbar, red (#f4323f) accents for buttons and highlights, green for positive trends

### What Changes

This is a major layout restructure - transforming from a panel/tab presentation-style layout to a traditional **sidebar + navbar + main content** dashboard.

#### 1. Create Shared Layout Component (`src/components/layout/DashboardLayout.tsx`)
- **Dark top navbar**: ANPG logo, "Sistema de Gestão de Concessões" title, nav links, search input, notification bell, user avatar
- **Left sidebar** (~200px): Collapsible, with grouped menu items matching the reference (Dashboard, Upstream, Produção, Financeiro, Compliance, Documentos, Mapa GIS, Relatórios, plus ADMINISTRAÇÃO section), ANPG branding at bottom
- **Main content area**: Breadcrumbs at top, scrollable content below
- Active menu item highlighted with red left border

#### 2. Create Sidebar Component (`src/components/layout/Sidebar.tsx`)
- Menu items with icons, grouped by section
- Active state with red accent
- Collapsible sub-menus (e.g., Upstream > sub-items)
- Bottom branding block ("ANPG / Sector Petrolífero / República de Angola")

#### 3. Create Top Navbar Component (`src/components/layout/TopNavbar.tsx`)
- Dark background (dark red/charcoal gradient)
- ANPG white logo + "Sistema de Gestão de Concessões" + "Plataforma de Inteligência Petrolífera"
- Center nav links: Início, Concessões, Produção, Relatórios
- Right: Search bar, notification bell with badge, user avatar with name/role dropdown

#### 4. Redesign Index Page (Dashboard Executivo)
- Remove current panel/tab navigation system
- Replace with the reference layout:
  - Page header: "Dashboard Executivo" + subtitle + date badge + red "Nova Concessão" button
  - 3 quick-action cards row (Dados de Produção, Compliance, Gerar Relatório) with circular red icons
  - 6 KPI stat cards in a grid (Total Concessões, Activas, Operadores, Petróleo, Gás, Receita Est.)
  - 2-column layout: Production Trend chart (left ~70%) + Compliance Alerts list (right ~30%)
  - Bottom row: Produção por Bacia bar chart + Produção por Operador horizontal bars
- Move existing panels (Blocos, Exploração, Risk, Strategic) to separate sidebar-navigable pages

#### 5. Update CSS/Design Tokens
- Add dark navbar CSS variables
- Add sidebar styling
- Ensure the clean white content area styling
- Keep existing ANPG red tokens

#### 6. Update Routing (`src/App.tsx`)
- Wrap all pages in the new `DashboardLayout`
- Add routes for the sidebar menu items that currently exist as panels

#### 7. Update BlockPage and ReportsPage
- Wrap in the shared layout
- Keep existing content but ensure consistent header/breadcrumb pattern

### Technical Details

**New files:**
- `src/components/layout/DashboardLayout.tsx` - Main layout wrapper
- `src/components/layout/TopNavbar.tsx` - Dark top navbar
- `src/components/layout/Sidebar.tsx` - Left sidebar navigation

**Modified files:**
- `src/pages/Index.tsx` - Complete redesign to dashboard layout
- `src/App.tsx` - Updated routing with layout wrapper
- `src/index.css` - New navbar/sidebar CSS tokens
- `tailwind.config.ts` - Any needed color additions

**Preserved:** All existing data, charts, and component logic. The panels content moves to routable pages accessible via sidebar.

