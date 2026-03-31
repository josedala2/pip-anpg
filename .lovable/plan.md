

## Remover Galeria e Tornar Documentos e Manutenção Colapsáveis

### Alterações em `src/components/dashboard/FacilitiesTab.tsx`

#### 1. Remover card "Galeria de Instalações"
- Remover o bloco do card da galeria (linhas 320-359) e o Lightbox Dialog associado (linhas 361-403)
- Remover estado e funções relacionadas (`lightboxOpen`, `lightboxIndex`, `openLightbox`, `navigateLightbox`)
- Remover imports não utilizados (`Camera`, `ImageIcon`, `Dialog`, `DialogContent`, `DialogTitle`)

#### 2. Tornar "Documentos & Certificações" colapsável
- Envolver o card com `Collapsible` do Radix (já existe em `@/components/ui/collapsible`)
- O header (com título, badge e filtros) fica como `CollapsibleTrigger` com ícone ChevronDown/Up
- O conteúdo (grid de documentos) fica dentro de `CollapsibleContent`
- Começa fechado por defeito

#### 3. Tornar "Plano de Manutenção" colapsável
- Mesma abordagem: `Collapsible` + `CollapsibleTrigger` no header + `CollapsibleContent` no body
- Começa fechado por defeito

### Imports a adicionar
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` de `@/components/ui/collapsible`

