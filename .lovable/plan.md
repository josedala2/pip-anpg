

## Plan: Adicionar legenda de cores ao Treemap de Produção por Campo

### Problema
O treemap usa cores para agrupar campos por bloco, mas não existe legenda — o utilizador não sabe qual cor corresponde a qual bloco.

### Alteração

**Ficheiro: `src/components/dashboard/FieldProductionBreakdown.tsx`**

Após o `</ResponsiveContainer>` do treemap (linha ~141) e antes do `<p>` de rodapé, adicionar uma legenda horizontal com chips coloridos:

- Derivar a legenda a partir de `blocksWithFields` (já disponível), mapeando cada bloco ao seu índice de cor (`COLORS[i % COLORS.length]`)
- Renderizar uma `div` com `flex flex-wrap gap-2` contendo chips com:
  - Um pequeno quadrado colorido (`w-3 h-3 rounded-sm`) com a cor do bloco
  - O nome do bloco em texto `text-xs`
- Estilizar de forma consistente com o padrão visual existente (fundo transparente, texto `text-muted-foreground`)

Nenhuma outra alteração necessária.

