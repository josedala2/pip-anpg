

## Corrigir Redundância e Dados nos KPIs de Produção

### Problema identificado

1. **"Taxa de Declínio" e "Declínio Anualizado" são redundantes** — ambos usam exactamente a mesma lógica 3-vs-3 (first3 vs last3). A diferença é que um calcula `(first3-last3)/first3` e o outro `1 - (last3/first3)^(12/months)`. Com 12 meses de dados, produzem valores quase idênticos (ambos 2.1% na screenshot). Na prática medem a mesma coisa.

2. **"Média por Campo" mostra N/A** — porque `producingFields` filtra por `status === "Producing"` mas os campos do Bloco 0 podem não ter esse status exacto nos dados.

### Solução proposta

#### 1. Eliminar "Declínio Anualizado" (redundante)
- Remover o card e o cálculo de `annualDecline`
- Manter apenas "Taxa de Declínio" (3v3) que é mais intuitivo
- Ajustar grid de 6 para 5 colunas: `grid-cols-2 md:grid-cols-3 xl:grid-cols-5`

#### 2. Corrigir "Média por Campo"
- Alargar o filtro de campos produtores para incluir campos com `currentProduction > 0` ou `status` contendo "Produc" (case-insensitive), garantindo que o Bloco 0 calcula correctamente

#### 3. Limpar tooltipDescriptions
- Remover entrada "Declínio Anualizado" do dicionário

### Ficheiros afectados
- `src/pages/BlockPage.tsx` — remover card + cálculo redundante, corrigir filtro de campos, ajustar grid
- `src/lib/tooltipDescriptions.ts` — remover "Declínio Anualizado"

