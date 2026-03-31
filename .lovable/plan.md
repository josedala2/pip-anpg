

## Adicionar KPI OPEX e Alerta OPEX ao Painel Estado da Concessão

### Alterações

**`src/components/dashboard/ConcessionStatusTab.tsx`**:

1. **Novo KPI "OPEX/BO 2025"** — Adicionar ao array `kpiCards` (após Investimento Executado):
   - Usa `block.economicVision?.technicalCost?.opex2025` (26.3 para Bloco 0)
   - Valor: `$26.3 USD/BO`
   - Sub-texto: breakdown CAPEX/BO + OPEX/BO (ex: `CAPEX: $17.0 + OPEX: $11.7`)
   - Cor: `text-warning` se > 25, `text-success` se ≤ 25
   - Ícone: `Gauge`

2. **Novo critério de alerta OPEX** — Adicionar à lista `alerts` (critério 7):
   - Threshold: OPEX_BO 2025 > 25 → amarelo; > 35 → vermelho
   - Mensagem: `OPEX elevado: $26.3 USD/BO (2025)`
   - Ícone: `Gauge`

3. **Actualizar grid** — O `md:grid-cols-7` passa a `md:grid-cols-8` para acomodar o KPI extra, e o contador de critérios nos Alertas reflectirá o novo critério.

