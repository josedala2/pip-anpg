

## Plan: Harmonizar o mapa de "Blocos Operados" no painel de Operadores

### Diagnóstico

O mapa dos operadores já utiliza o **mesmo componente `ConcessionMap`** — logo as melhorias recentes (círculos de produção com offset, tooltips, e z-ordering correcto) já estão aplicadas automaticamente.

No entanto, existe um conflito de alturas: o container no `OperatorsPanel` define `h-[400px]`, mas o `ConcessionMap` internamente define `min-h-[500px]`, o que pode causar overflow/clipping e prejudicar a interacção.

### Alterações

**Ficheiro: `src/components/dashboard/OperatorsPanel.tsx`**
- Aumentar a altura do container do mapa de `h-[400px]` para `h-[500px]` para alinhar com o `min-h` do `ConcessionMap` e garantir que toda a área do mapa (incluindo círculos de produção e tooltips) é visível e interactiva.

**Ficheiro: `src/components/dashboard/ConcessionMap.tsx`**
- Nenhuma alteração necessária — as melhorias (offset dos círculos, tooltips com nome+produção, renderização acima dos polígonos) já são partilhadas por todas as instâncias do componente.

### Resultado

O mapa na secção "Blocos Operados" do painel de Operadores terá a mesma experiência visual e interactiva que o mapa principal da Home Executiva, com altura adequada para evitar clipping.

