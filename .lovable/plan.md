

## Adicionar Filtro por Bloco ao Painel de Alertas

### Alterações em `src/components/dashboard/AlertsPanel.tsx`

1. **Novo estado** `selectedBlock` (default `"all"`)
2. **Extrair lista de blocos** únicos a partir dos alertas gerados (usando `blockName`)
3. **Adicionar `<select>`** na barra de filtros existente (junto aos filtros de categoria e severidade), com as opções dos blocos disponíveis
4. **Aplicar filtro** no `useMemo` de `filtered`, adicionando condição `a.blockName === selectedBlock`

Sem novos ficheiros — apenas uma adição incremental ao padrão de filtros já existente.

