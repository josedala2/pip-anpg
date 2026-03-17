

## Problema

O tab "Produção" na página de bloco tem apenas 2 gráficos (Tendência de Produção 12 meses + CAPEX Planeado vs Real). Há dados ricos disponíveis no bloco que não estão a ser aproveitados.

## Solução

Enriquecer o tab "Produção" em `src/pages/BlockPage.tsx` (linhas 1207-1251) com mais 4 secções, aproveitando dados já existentes:

### Novos componentes no tab Produção:

1. **KPIs de Produção** (linha de cards acima dos gráficos)
   - Produção actual (BOPD)
   - Pico vs actual (% do pico)
   - Nº de campos em produção
   - Taxa de declínio (calculada do histórico)

2. **Gráfico: Produção por Campo (Pie/Donut)** — usando `block.fields` com `peakProduction` para mostrar distribuição pelos campos do bloco

3. **Gráfico: Projecções de Produção (3 cenários)** — usando `block.projections` (conservador/base/expansão) como LineChart, actualmente isolado no tab "Projecções" mas faz sentido ter uma versão compacta aqui

4. **Tabela: Campos do Bloco** — listagem dos campos com status, ano de descoberta e pico de produção, usando `block.fields`

### Ficheiro alterado:
- **`src/pages/BlockPage.tsx`** — expandir o `TabsContent value="production"` (linhas 1207-1251) com os novos componentes acima, usando dados já presentes no objecto `block` (`fields`, `projections`, `productionHistory`, `dailyProduction`)

