

## Tornar "Especificações das Plataformas" e "Diagrama Esquemático" Colapsáveis

### Contexto
O painel Instalações & HSE já usa `Collapsible` (de Radix) para as secções "Plano de Manutenção" e "Documentos", com `ChevronDown` animado. Vamos replicar o mesmo padrão.

### Alterações

#### 1. `src/components/dashboard/FacilitiesTab.tsx`
- Adicionar dois novos estados: `specsOpen` (default `false`) e `schematicOpen` (default `false`)
- Envolver o card "Especificações das Plataformas" (linhas 267-308) num `Collapsible`, com `CollapsibleTrigger` no `CardHeader` e `CollapsibleContent` no `CardContent`, incluindo `ChevronDown` com rotação animada (`transition-transform [&[data-state=open]>svg]:rotate-180`)
- Envolver `<FacilitiesSchematic />` (linha 264) num `Collapsible` semelhante, com um `Card` wrapper cujo header contenha o título "Diagrama Esquemático — Infraestrutura" e a seta

#### 2. `src/components/dashboard/FacilitiesSchematic.tsx`
- Exportar uma prop opcional `isCollapsible` ou, mais simples, mover o wrapper colapsável para `FacilitiesTab.tsx` extraindo o conteúdo do schematic sem o `Card` externo. Alternativa preferida: aceitar prop `hideCard` para renderizar apenas o conteúdo interno, permitindo que o `FacilitiesTab` controle o `Card` + `Collapsible`.

**Abordagem mais simples (preferida):** Manter o `FacilitiesSchematic` tal como está (já renderiza um `Card`), e no `FacilitiesTab` envolvê-lo num `Collapsible` onde o trigger é um `Card`/`CardHeader` separado acima, e o `CollapsibleContent` contém o `<FacilitiesSchematic />`. Porém isto criaria dois cards aninhados.

**Abordagem limpa:** Adicionar uma prop `renderAsContent?: boolean` ao `FacilitiesSchematic` que, quando true, omite o `Card`/`CardHeader` externo e renderiza apenas o `CardContent` interno. Assim o `FacilitiesTab` controla o Card colapsável.

### Ficheiros afectados
- `src/components/dashboard/FacilitiesTab.tsx` — estados, wrappers colapsáveis
- `src/components/dashboard/FacilitiesSchematic.tsx` — prop `renderAsContent` para omitir Card exterior

