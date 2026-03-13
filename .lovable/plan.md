

## Mover Painéis Detalhados para baixo dos KPIs

Faz sentido — coloca os drill-downs numa posição de destaque imediato, antes do mapa e alertas. O utilizador executivo vê os KPIs e pode imediatamente aprofundar sem scroll.

### Alteração

**Ficheiro:** `src/components/dashboard/ExecutiveHome.tsx`

Mover o bloco "Painéis Detalhados" (botões + conteúdo expandido) da posição actual (depois da Zona F) para logo após o `<KPICards />` (Zona B), antes do grid Mapa + Alertas (Zona C+D).

Ordem final:
1. KPICards (Zona B)
2. **Painéis Detalhados** (botões + painel expandido)
3. Mapa + ThreatPanel (Zona C+D)
4. TrendProjection (Zona E)
5. QuickRecommendations (Zona F)

Sem alterações de lógica — apenas reordenação dos blocos JSX.

