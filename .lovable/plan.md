

## Mover Recomendações Técnicas para o Painel de Produção

### Alteração
Mover o bloco `TechnicalRecommendationsPanel` da aba **Exploração** (linhas 1091-1094) para o final da aba **Produção** (antes do `</TabsContent>` na linha 1489).

### Ficheiro
`src/pages/BlockPage.tsx`

1. **Remover** das linhas 1091-1094 (dentro da tab Exploração):
   ```tsx
   {/* Technical Recommendations */}
   {block.technicalRecommendations && block.technicalRecommendations.length > 0 && (
     <TechnicalRecommendationsPanel recommendations={block.technicalRecommendations} blockName={block.name} />
   )}
   ```

2. **Adicionar** antes do `</TabsContent>` da tab `prod-proj` (antes da linha 1489):
   ```tsx
   {block.technicalRecommendations && block.technicalRecommendations.length > 0 && (
     <TechnicalRecommendationsPanel recommendations={block.technicalRecommendations} blockName={block.name} />
   )}
   ```

Nenhuma alteração a imports ou a outros ficheiros — o import do `TechnicalRecommendationsPanel` já existe no topo do ficheiro.

