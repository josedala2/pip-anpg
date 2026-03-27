

## Adicionar Números nos Segmentos do Gráfico de Poços Perfurados (Vista Empilhada)

### O que muda
No gráfico de Poços Perfurados em `BlockPage.tsx` (linhas 928-932), cada `<Bar>` receberá um `<LabelList>` que mostra o valor numérico dentro do segmento empilhado, com a cor correspondente ao tipo de poço.

### Detalhes técnicos

Adicionar a cada um dos 5 componentes `<Bar>` um `<LabelList>` com:
- `dataKey` correspondente (pesquisa, avaliacao, etc.)
- `position="center"` para centrar no segmento
- `fill` com a mesma cor do bar (`hsl(199, 89%, 48%)`, `hsl(280, 65%, 60%)`, etc.)
- `fontSize={10}`, `fontWeight="bold"`
- `formatter` que oculta valores 0 (retorna string vazia)

Exemplo para o primeiro Bar:
```tsx
<Bar dataKey="pesquisa" ...>
  <LabelList dataKey="pesquisa" position="center" fill="hsl(199, 89%, 48%)" fontSize={10} fontWeight="bold" formatter={(v: number) => v > 0 ? v : ""} />
</Bar>
```

Para legibilidade na vista empilhada, os labels usarão cor branca (`#fff`) em vez da cor do tipo, dado que ficam sobre barras coloridas. Alternativamente, manter as cores do tipo mas com um leve text-shadow — vou usar **branco** para máxima legibilidade.

**Correcção**: O utilizador pediu especificamente que os números apareçam na cor correspondente ao tipo de poço. Vou usar a cor do tipo como `fill` do label. Em segmentos pequenos pode haver sobreposição mas respeita o pedido.

### Ficheiro
- `src/pages/BlockPage.tsx` — linhas 928-932, adicionar `<LabelList>` dentro de cada `<Bar>`

### Import
- Adicionar `LabelList` ao import de recharts (verificar se já existe)

