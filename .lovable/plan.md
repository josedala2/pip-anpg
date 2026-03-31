

## Separar "Instalações" e "HSE & Ambiente" em Dois Painéis Independentes na Sidebar

### Contexto
Actualmente existe um único item "Instalações" na sidebar que renderiza o `FacilitiesIntegrityPanel`. O painel nacional de HSE (`HSENationalPanel`) só é acessível via drill-down na Home Executiva. O utilizador quer dois itens distintos na sidebar.

### Alterações

#### 1. `src/pages/Index.tsx`
- Adicionar `"HSE & Ambiente"` ao array `allPanels`, após `"Instalações"`
- Importar `HSENationalPanel`
- Adicionar renderização condicional: `{panels[activePanel] === "HSE & Ambiente" && <HSENationalPanel />}`

#### 2. `src/components/AppSidebar.tsx`
- Importar `ShieldCheck` do lucide-react
- Adicionar `{ panel: "HSE & Ambiente", icon: ShieldCheck }` ao grupo "Operacional", após "Instalações"

### Ficheiros afectados
- `src/pages/Index.tsx`
- `src/components/AppSidebar.tsx`

