

## Plano: Verificação e Limpeza do Mapa de Concessões

### Diagnóstico

Após análise detalhada do código, identifiquei os seguintes problemas:

#### 1. Erros de sintaxe em ~9 blocos
Blocos em licitação (22, 25, 26, 34, 35, 36, 37, 39, 40) têm arrays `concession` com vírgulas soltas: `concession: [\n,\n]`. Isto cria arrays com slots vazios e pode causar erros runtime.

#### 2. Tipo `WaterDepth` inconsistente
O tipo define `"Ultra-Deep Water"` (com hífen), mas vários blocos (33, 41, 42, 43) usam `"Ultra Deep Water"` (sem hífen) — causando potenciais erros de tipo TypeScript.

#### 3. Blocos sem polígonos no XLSX (~20 blocos)
Estes blocos existem em `oilBlocks` mas NÃO têm coordenadas no ficheiro de polígonos, portanto não aparecem no mapa:
- Sub-blocos: 14K, 15/06, 17/06, 31/21, 15/14 (LIRA), 3/24, 3/05A, 5/06, 6/24, 3/15, 2/15, 16/21, 18/15, 20/11, 22/11, 37/11, 14/23-ZIC
- Outros: FS/FST, FS Associações, FST Associações

Estes são sub-concessões ou rondas posteriores que partilham a geometria do bloco-mãe. São concessões ANPG legítimas — devem manter-se no dataset mas não necessitam de polígono próprio.

#### 4. Dados fabricados remanescentes no Bloco 2/05
O bloco `block-2-05` ainda tem `productionHistory` gerado com `Math.random()` (linha 3047) — mock data que escapou à limpeza anterior.

### Alterações propostas

| Ficheiro | Alteração |
|---|---|
| `src/data/angolaBlocks.ts` | Corrigir `concession: [,]` → `concession: []` nos 9 blocos. Corrigir `"Ultra Deep Water"` → `"Ultra-Deep Water"` em 4 blocos. Limpar `productionHistory` mock do Bloco 2/05. |
| `src/components/dashboard/ConcessionMap.tsx` | Remover secção de polígonos órfãos (já não necessária com todos os IDs cobertos no dataset). Remover parâmetro `orphanIds` do `BlockLabels`. |

### Sem remoção de elementos do mapa
Todos os elementos actualmente no mapa (cidades, limites marítimos, bacias, reservas naturais, zonas de profundidade) correspondem a informação real do PDF do Mapa de Concessões ANPG — nenhum precisa de ser removido.

