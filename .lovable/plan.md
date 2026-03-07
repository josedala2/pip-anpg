

# Melhorar Layout da página Risk & Performance

## Problema
A página é composta por um Heatmap + Tabela completa, ambos listando todos os blocos sem qualquer forma de condensar a informação. Resulta num scroll excessivo.

## Proposta de Layout Compacto

### Estrutura: Layout lado-a-lado com tabs

```text
┌─────────────────────────────────────────────────────┐
│  KPI Summary Bar (4 mini-cards em linha)            │
│  [Blocos Críticos: 3] [On Target: 8] [Avg Risk: 5] │
│  [Investment Total: $X,XXX M]                       │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   Risk Heatmap       │   Block Rankings Table       │
│   (grid compacto)    │   (com scroll interno,       │
│                      │    max-height fixo)          │
│                      │                              │
├──────────────────────┴──────────────────────────────┤
│  (tudo visível sem scroll na maioria dos ecrãs)     │
└─────────────────────────────────────────────────────┘
```

### Alterações concretas

1. **KPI Summary Bar** (nova secção no topo)
   - 4 mini-cards: Blocos Críticos (risk>=8), Below Plan (exec<70%), On Target (exec>=90%), Investimento Total
   - Uma linha, compacta, dá contexto imediato

2. **Layout lado-a-lado (md+)**
   - Heatmap à esquerda (~40% largura), Tabela à direita (~60%)
   - Em mobile: empilhados verticalmente
   - Heatmap com grid mais compacto (cells menores)
   - Tabela com `max-height` e `ScrollArea` para scroll interno em vez de expandir a página

3. **Heatmap compacto**
   - Reduzir padding das células
   - Grid 6 colunas em desktop (já existe em 2xl, trazer para md)
   - Remover texto do operador para economizar espaço (mostrar em tooltip on hover)

4. **Tabela com scroll interno**
   - Envolver em `ScrollArea` com `max-height: 500px`
   - Header sticky dentro do scroll
   - Mantém ordenação e badges existentes

### Ficheiro afetado
- `src/components/dashboard/RiskPerformance.tsx` — reestruturar layout

