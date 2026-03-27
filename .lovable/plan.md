

## Actualização dos Dados dos 3 Blocos Verificados — Relatório Estado das Concessões 2026

Analisei detalhadamente o documento PDF e comparei com os dados actuais em `angolaBlocks.ts`. Resumo das diferenças encontradas:

### Dados Nacionais (sem alterações necessárias)
- Produção média 2025: **1,036,000 BOPD** — já alinhado no código
- Quota ANPG: **441,609 BOPD** — já alinhado
- Reservas: 2.6 Gbbls óleo, 4.4 TCF gás — já alinhado

### Bloco 0 — Sem alterações significativas
Os dados no código já correspondem ao documento:
- Produção: 119,285 BOPD ✓
- Reservas: 421 MMBO ✓
- OPEX: $26.3/bbl ✓
- Consórcio: Cabgoc 39.2%, SNL 41%, TotalEnergies 10%, Azule 9.8% ✓
- Abandono: 3,665 MMUSD, depositado 102, dívida Sonangol 48 ✓
- Eficiência: 88% ✓

### Bloco 2/05 — Actualização menor
- Produção: 14,907 BOPD ✓ (doc também menciona 15,171 como "produção actual" na secção de infraestrutura — vou actualizar para **15,171** pois é o valor mais recente)
- Reservas: 79.4 MMBO ✓
- OPEX: $10.07/bbl ✓
- **Novo dado**: Capacidade total: 165,000 BOPD; Taxa de utilização: 35.7%

### Bloco 3/05 — Alterações CRÍTICAS
| Campo | Valor Actual | Valor Documento | Acção |
|---|---|---|---|
| `dailyProduction` | 19,680 | **20,578** | Actualizar |
| `estimatedReserves` | 889 | **33.35** | Corrigir (889 era STOOIP) |
| `executionRate` | 92 | **87** | Actualizar (eficiência) |
| `productionHistory` | 49-50k/mês | ~20k/mês | Corrigir (valores eram absurdos) |
| Profit Oil table | Antigo | Actualizado | Actualizar fiscal terms |

### Detalhes técnicos

**Ficheiro**: `src/data/angolaBlocks.ts`

**1. Bloco 2/05** (linha ~2816):
- `dailyProduction`: 14907 → **15171** (produção actual mais recente)
- Actualizar `productionHistory` para reflectir valores consistentes com ~15k BOPD

**2. Bloco 3/05** (linhas ~1395-1435):
- `dailyProduction`: 19680 → **20578**
- `estimatedReserves`: 889 → **33.35** (reservas provadas, não STOOIP)
- `executionRate`: 92 → **87** (eficiência 2025)
- Corrigir `productionHistory`: valores de 49-50k são impossíveis para um bloco de 20k BOPD. Recalcular com variação realista em torno de 20k
- Actualizar `projections` para serem coerentes com a produção real
- Actualizar fiscal terms (Profit Oil):
  - `<10%: ANPG 20%, GE 80%`
  - `10-20%: ANPG 40%, GE 60%`
  - `20-30%: ANPG 60%, GE 40%`
  - `>30%: ANPG 75%, GE 25%`

**3. SWOT Updates** — O documento traz SWOT actualizados para os 3 blocos. Vou actualizar os existentes no código com o conteúdo mais recente.

**4. Dados de infraestrutura Bloco 3/05**:
- 11 plataformas de produção, 3 de processamento
- Vida útil: 2040
- Capacidade: 46,278 BOPD
- Injecção de água: 100,000 BWPD
- Produção acumulada: 1,369,300 MMBO

### Impacto
- Os KPIs nacionais, Matriz de Decisão CA e Scores Estratégicos recalculam automaticamente
- O Bloco 3/05 passará de ~19.7k para ~20.6k BOPD (+4.6%)
- As reservas do Bloco 3/05 baixam drasticamente (889→33.35 MMBO) o que afectará o score económico significativamente

### Ficheiros a modificar
1. `src/data/angolaBlocks.ts` — dados dos Blocos 2/05 e 3/05

