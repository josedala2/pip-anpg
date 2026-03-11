

## Detalhe expandível nas linhas da tabela de dados

### Problema
Actualmente, a tabela de Blocos no painel de gestão (`AdminDataPage`) já tem o estado `expandedBlock` e o click handler, mas não renderiza nenhum conteúdo expandido ao clicar numa linha.

### Plano

**Modificar `src/pages/AdminDataPage.tsx`** para adicionar uma linha expandível abaixo de cada `TableRow` quando `expandedBlock === block.id`:

1. **Linha de detalhe expandível** -- Após cada `TableRow` no tab "Blocos", renderizar condicionalmente uma `TableRow` com um `TableCell` de `colSpan={8}` contendo o detalhe completo do bloco.

2. **Conteúdo do detalhe** organizado em secções com grid layout:
   - **Informação Geral**: parceiros, data contrato, profundidade de água, área, tipo de contrato
   - **Produção**: produção diária, reservas estimadas, investimento acumulado/planeado, taxa de execução
   - **Exploração**: dados sísmicos (2D/3D/4D totais), poços (pesquisa/avaliação), descobertas comerciais/não comerciais, taxa de sucesso geológico
   - **Consórcio**: lista completa de parceiros com participações
   - **Campos/Descobertas**: lista de fields com status e ano de descoberta
   - **HSE**: últimos indicadores (TRIR, LTI) se disponíveis
   - **Facilidades**: eficiência geral, capacidade, terminal

3. **Indicador visual**: Adicionar ícone chevron (ChevronDown/ChevronUp) na primeira coluna para indicar que a linha é expansível.

4. **Animação**: Transição suave com classes Tailwind para o conteúdo expandido.

5. **Aplicar o mesmo padrão aos tabs Produção e Concessões** com detalhes relevantes a cada contexto.

### Ficheiros a modificar
- `src/pages/AdminDataPage.tsx` -- Adicionar componente `BlockDetailRow` e integrá-lo nas 3 tabelas

