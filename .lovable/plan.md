

## Melhorar Profundidade e Profissionalismo do Soba

### Diagnóstico

Duas causas principais para respostas vagas:

1. **Contexto incompleto** — `buildBlocksSummary()` não serializa dados cruciais: `cashFlowTimeSeries`, `investmentPlan`, `productionShareGE`, dados de facilities, HSE, prospects. O modelo não responde em detalhe porque simplesmente não recebe os dados.

2. **System prompt superficial** — As instruções são genéricas ("seja conciso"). Falta orientação para análise profissional com estrutura analítica, cálculos derivados, e tom executivo.

3. **Modelo leve** — Usa `gemini-2.5-flash` que é mais rápido mas menos preciso. Para análise profissional, `gemini-2.5-pro` produz respostas significativamente melhores.

---

### Plano de Correcção

#### 1. Enriquecer `buildBlocksSummary()` em `SobaChat.tsx`

Adicionar serialização dos dados que faltam:
- **cashFlowTimeSeries** — todos os anos de fluxo de caixa (GE/Impostos por ano)
- **investmentPlan** — plano de investimentos detalhado (Exploração, Desenvolvimento, Operação, Admin, Cash Call)
- **productionShareGE** — partilha de produção por ano
- **HSE data** (`hseData`) — incidentes, emissões, derrames
- **Facilities** — instalações e estado
- **Prospects** — prospectos exploratórios

#### 2. Reescrever o System Prompt na edge function `soba-chat/index.ts`

Novo prompt profissional com:
- Tom de **analista sénior de petróleo** (não assistente genérico)
- Instruções para incluir sempre: valores absolutos, variações percentuais, comparações com médias do sector
- Estrutura obrigatória: Resumo Executivo → Dados Detalhados → Análise/Observações
- Instrução para calcular métricas derivadas (produção per capita do consórcio, OPEX/barril, taxa de declínio)
- Regras para tabelas comparativas obrigatórias quando >1 bloco mencionado

#### 3. Upgrade do modelo para `gemini-2.5-pro`

Mudar de `gemini-2.5-flash` para `gemini-2.5-pro` para respostas mais profundas e analíticas.

---

### Ficheiros a modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/dashboard/SobaChat.tsx` | Expandir `buildBlocksSummary()` com cashFlow, investmentPlan, productionShare, HSE, facilities, prospects |
| `supabase/functions/soba-chat/index.ts` | Reescrever system prompt profissional + mudar modelo para `gemini-2.5-pro` |

