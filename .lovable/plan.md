

## Roteiro de Evolução — Plataforma Nacional de Inteligência Petrolífera

O documento partilhado descreve uma plataforma completa de inteligência decisória. Após análise do estado actual da aplicação, identifico o que já existe, o que falta e proponho uma implementação faseada.

---

### Estado actual vs Visão

```text
┌──────────────────────────────────┬───────────┐
│ Capacidade                       │ Estado    │
├──────────────────────────────────┼───────────┤
│ Mapa de concessões               │ ✅ Existe  │
│ KPIs nacionais (prod, reservas)  │ ✅ Parcial │
│ Painel de Blocos & Concessões    │ ✅ Existe  │
│ Painel de Produção               │ ✅ Existe  │
│ Painel de Exploração             │ ✅ Existe  │
│ Painel de Operadores             │ ✅ Existe  │
│ Risk & Performance (scatter)     │ ✅ Existe  │
│ Strategic Forecast (cenários)    │ ✅ Existe  │
│ Detalhe do bloco (12 abas)       │ ✅ Existe  │
│ Visão Económica (Bloco 0)        │ ✅ Existe  │
│ Estado da Concessão (semáforo)   │ ✅ Existe  │
│ Comparativo de blocos            │ ✅ Existe  │
│ Relatórios configuráveis         │ ✅ Existe  │
│ Auth + roles                     │ ✅ Existe  │
├──────────────────────────────────┼───────────┤
│ Dashboard Contratual/Negocial    │ ❌ Falta   │
│ Dashboard Integridade Instalações│ ❌ Falta   │
│ Dashboard Recomendação Conselho  │ ❌ Falta   │
│ Motor de Scoring Estratégico     │ ❌ Falta   │
│ Alertas inteligentes centrais    │ ❌ Falta   │
│ KPIs executivos completos        │ ⚠️ Parcial │
│ Branding "Inteligência Petrol."  │ ❌ Falta   │
│ Previsão de declínio por campo   │ ⚠️ Básico  │
└──────────────────────────────────┴───────────┘
```

---

### Fase 1 — Rebranding + KPIs Executivos Completos

**Objectivo:** Alinhar a plataforma com a identidade "Plataforma Nacional de Inteligência Petrolífera" e completar os KPIs do Dashboard Executivo Nacional.

**Alterações:**

1. **Header (Index.tsx):** Alterar título para "Plataforma de Inteligência Petrolífera" e subtítulo para "Sistema Integrado de Monitorização, Análise e Apoio à Decisão". Remover "Q4 2024".

2. **KPIs expandidos (KPICards.tsx ou novo componente):** Adicionar os KPIs em falta do documento:
   - Nº concessões activas / em produção / em exploração / sem produção
   - Nº blocos em risco crítico
   - Receita estimada do Estado
   - Variação produção m/m e y/y

---

### Fase 2 — Dashboard Contratual e Negocial (novo painel)

**Objectivo:** Painel nacional que cruza dados contratuais de todos os blocos para identificar riscos negociais.

**Novo componente:** `src/components/dashboard/ContractCompliancePanel.tsx`
**Integração:** Novo painel no Index.tsx ("Contratos & Compliance")

**Conteúdo:**
- Calendário de marcos contratuais (timeline horizontal com blocos agrupados por data de expiração)
- Semáforo de compliance por operador (tabela com indicadores verde/amarelo/vermelho)
- Contratos a expirar em 12/24/36 meses (lista com urgência)
- Matriz de concessões por urgência negocial
- Obrigações em incumprimento (extraídas de `contractInfo` e `executionRate`)

---

### Fase 3 — Dashboard de Integridade de Instalações (novo painel)

**Objectivo:** Visão centralizada do estado das infraestruturas críticas.

**Novo componente:** `src/components/dashboard/FacilitiesIntegrityPanel.tsx`
**Integração:** Novo painel no Index.tsx ("Integridade de Instalações")

**Conteúdo:**
- Ranking de instalações por criticidade (idade, eficiência, falhas)
- Gráfico idade vs risco (scatter plot)
- Nº instalações críticas, idade média, vida útil remanescente
- Produção em risco por integridade
- Gargalos operacionais (capacidade instalada vs utilização)

Dados já disponíveis em `facilityData` (platformSpecs, areas, maintenancePlan).

---

### Fase 4 — Motor de Scoring Estratégico + Dashboard de Recomendação

**Objectivo:** Implementar o "Strategic Concession Score" e o painel de recomendações para o Conselho.

**Novo ficheiro:** `src/lib/strategicScoring.ts`
- Função pura que calcula score composto por bloco:
  - 25% desempenho produtivo (produção actual vs pico, declínio)
  - 20% integridade das instalações (eficiência, idade)
  - 15% viabilidade económica (break-even, OPEX)
  - 15% estado contratual (tempo restante, compliance)
  - 15% potencial exploratório (prospectos, recursos)
  - 10% risco ESG
- Classificação automática: Revitalizar / Manter / Renegociar / Monitorar / Preparar Abandono / Relicitar

**Novo componente:** `src/components/dashboard/CouncilRecommendationsPanel.tsx`
**Integração:** Novo painel no Index.tsx ("Recomendações ao Conselho")

**Conteúdo:**
- Tabela de blocos com score, classificação, urgência, decisão recomendada, impacto esperado, risco de inação
- Radar chart de saúde por bloco (6 dimensões do score)
- Top 5 acções prioritárias
- Explicabilidade: para cada recomendação, listar as variáveis que mais influenciaram

---

### Fase 5 — Sistema de Alertas Centrais

**Objectivo:** Motor de alertas automáticos que cruza todas as dimensões.

**Novo ficheiro:** `src/lib/alertEngine.ts`
- Regras de negócio parametrizáveis (as da "Camada 1" do documento):
  - Contrato expira em < 12 meses → alerta vermelho
  - Integridade < 50% → alerta vermelho
  - Declínio > 15% por 12 meses → declínio crítico
  - OPEX > receita → revisão económica
  - Capacidade ociosa alta + reservas → avaliar revitalização

**Integração:** Badge de alertas no header + painel dedicado acessível de qualquer lugar.

---

### Resumo de ficheiros por fase

| Fase | Ficheiros | Tipo |
|------|-----------|------|
| 1 | `Index.tsx`, `KPICards.tsx` | Editar |
| 2 | `ContractCompliancePanel.tsx`, `Index.tsx` | Criar + Editar |
| 3 | `FacilitiesIntegrityPanel.tsx`, `Index.tsx` | Criar + Editar |
| 4 | `strategicScoring.ts`, `CouncilRecommendationsPanel.tsx`, `Index.tsx` | Criar + Editar |
| 5 | `alertEngine.ts`, `AlertsBadge.tsx`, `Index.tsx` | Criar + Editar |

### Recomendação

Sugiro implementar **Fase 1 + Fase 2** em conjunto (rebranding + dashboard contratual), pois são as de maior impacto imediato e menor complexidade. As fases 3-5 podem seguir iterativamente. Qual fase quer implementar primeiro?

