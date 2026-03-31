

## Separar Aba "Instalações & HSE" em Duas Abas no Detalhe do Bloco

### Contexto
No `BlockPage.tsx`, existe uma única aba `facilities-hse` que contém tanto o conteúdo de Instalações (`FacilitiesTab`, Equipment Scale) como o de HSE & Ambiente (`HSEEnvironmentTab`). O utilizador quer duas abas separadas.

### Alterações — `src/pages/BlockPage.tsx`

1. **TabsTrigger** (linha ~385): Substituir o trigger único `facilities-hse` por dois:
   - `facilities` — "Instalações" com ícone `Building2`
   - `hse` — "HSE & Ambiente" com ícone `ShieldCheck`

2. **TabsContent** (linhas ~1432-1534): Dividir em dois `TabsContent`:
   - `facilities` — contém `FacilitiesTab` + tabela Equipment Scale (conteúdo existente até linha ~1522)
   - `hse` — contém `HSEEnvironmentTab` (conteúdo existente linhas ~1524-1533)

3. **Import**: Adicionar `ShieldCheck` ao import do lucide-react (já existe `Leaf` mas `ShieldCheck` é mais consistente com a sidebar)

### Ficheiro afectado
- `src/pages/BlockPage.tsx`

