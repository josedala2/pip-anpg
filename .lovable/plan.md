

## Redesign do Dashboard Executivo ANPG — Centro de Comando Estratégico

### Visão Geral

Transformar o dashboard actual numa plataforma de "mission control" executivo com identidade institucional premium, leitura em camadas (30 segundos para o PCA), e nova paleta "azul petróleo + grafite".

---

### 1. Nova Paleta de Cores — Institucional Premium

**Ficheiro:** `src/index.css`

Substituir a paleta actual (vermelho primário) por:

| Variável | Actual | Novo (Light) | Conceito |
|----------|--------|--------------|----------|
| `--primary` | 355 90% 58% (vermelho) | 200 45% 28% (azul petróleo) | Autoridade |
| `--background` | 210 18% 96% | 220 14% 96% (off-white) | Clareza |
| `--card` | 0 0% 100% | 210 20% 99% | Limpeza |
| `--accent` | 355 60% 94% | 200 30% 92% | Subtileza |
| `--success` | 152 69% 40% | 152 50% 38% (verde discreto) | Conformidade |
| `--warning` | 38 92% 50% | 38 75% 48% (âmbar) | Atenção |
| `--danger` | 0 72% 45% | 0 65% 42% (vermelho controlado) | Criticidade |
| `--muted-foreground` | 215 16% 40% | 215 12% 50% (grafite) | Rigor |

Dark mode: azul petróleo escuro como base (`210 35% 8%`), mantendo mesma semântica.

---

### 2. Zona A — Cabeçalho Estratégico Redesenhado

**Ficheiro:** `src/pages/Index.tsx` (header section)

Alterações:
- Adicionar **data/hora da última actualização** (simulada)
- Adicionar **período de análise activo** com selector: Actual / 6M / 12M / 24M
- Adicionar **indicador de qualidade dos dados** (badge com %)
- Remover link "Comparar" da barra principal → mover para menu de utilizador
- Reduzir densidade dos ícones no header
- Faixa superior mais sóbria: border-top em azul petróleo em vez de vermelho

---

### 3. Zona B — KPIs Executivos Redesenhados

**Ficheiros:** `src/components/dashboard/KPICards.tsx`, novo `src/components/dashboard/ExecutiveKPICard.tsx`

Criar novo componente `ExecutiveKPICard` com:
- Valor principal grande (JetBrains Mono)
- Variação percentual com seta e cor semântica
- **Mini-sparkline** de tendência (6 meses)
- **Semáforo de criticidade** (ponto verde/amarelo/vermelho)
- Hover → tooltip com drill-down info

KPIs a mostrar na home (10 cartões, 2 linhas de 5):
1. Produção Nacional Actual
2. Produção Acumulada do Ano
3. Variação vs Período Anterior
4. Concessões Activas
5. Blocos em Produção
6. Blocos sem Produção
7. Blocos em Risco Crítico
8. Instalações Críticas
9. Receita Estimada do Estado
10. Contratos próximos do vencimento

---

### 4. Zona C — Home Executiva com Layout de 6 Zonas

**Ficheiro:** `src/pages/Index.tsx` (panel "Overview")

Transformar o Overview actual (mapa + sidebar) num layout de centro de comando com 6 zonas:

```text
┌────────────────────────────────────────────────┐
│  Zona A — Cabeçalho Estratégico (header)       │
├────────────────────────────────────────────────┤
│  Zona B — KPIs Executivos (2 linhas de 5)      │
├──────────────────────┬─────────────────────────┤
│  Zona C — Mapa       │  Zona D — Alertas       │
│  Nacional (60%)      │  Estratégicos (40%)     │
│                      │  (top 8 priorizados)    │
├──────────────────────┴─────────────────────────┤
│  Zona E — Tendências (produção hist + proj)    │
├────────────────────────────────────────────────┤
│  Zona F — Recomendações ao Conselho (top 5)    │
└────────────────────────────────────────────────┘
```

- **Zona C:** Mapa existente (`ConcessionMap`) com cores semáforo nos blocos (verde=saudável, amarelo=atenção, vermelho=crítico, azul=exploratório, cinza=inactivo). Popup do bloco com ficha resumida (nome, operador, produção, score, recomendação).
- **Zona D:** Lista compacta dos top alertas do `alertsEngine`, estilizada como "painel de ameaças" — sem parecer notificações banais. Fundo escuro, badges de severidade.
- **Zona E:** Gráfico de área com produção histórica + projectada (3 cenários sobrepostos: base, optimista, conservador). Compact, clean.
- **Zona F:** Top 5 recomendações do `strategicScoring` com classificação, urgência, impacto e risco de inação. Cada linha clicável para drill-down.

---

### 5. Mapa com Cores Semáforo e Popup Executivo

**Ficheiro:** `src/components/dashboard/ConcessionMap.tsx`

- Alterar coloração dos polígonos: usar score estratégico para determinar cor (verde ≥70, amarelo 40-70, vermelho <40, azul=Exploration, cinza=Suspended)
- Popup ao clicar: ficha executiva compacta com 6 campos + recomendação automática

---

### 6. Estilo Visual — Refinamentos CSS

**Ficheiro:** `src/index.css`

- `.glass-card` → reduzir blur, aumentar contraste de bordas (mais institucional, menos "glassmorphism")
- Novas classes: `.executive-card` (sombra sutil, borda esquerda semáforo), `.threat-panel` (fundo escuro para alertas)
- Remover `.glow-*` (demasiado comercial) → substituir por sombras subtis
- Tipografia: manter Inter + JetBrains Mono, mas aumentar peso dos labels (semibold → bold para KPIs)

---

### 7. Navegação Simplificada

**Ficheiro:** `src/pages/Index.tsx`

Reduzir tabs visíveis. A home executiva passa a conter as 6 zonas integradas. Tabs restantes:
- **Home Executiva** (as 6 zonas)
- **Concessões** (BlocksPanel actual)
- **Produção & Declínio** (ProductionPanel)
- **Exploração** (ExplorationPanel)
- **Instalações** (FacilitiesIntegrityPanel)
- **Contratos** (ContractCompliancePanel)
- **Cenários** (StrategicForecast)

Alertas, Recomendações e Risk passam a estar integrados na Home e acessíveis via drill-down.

---

### Resumo de Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `src/index.css` | Editar (paleta + classes) |
| `src/pages/Index.tsx` | Editar (layout Home, header, tabs) |
| `src/components/dashboard/KPICards.tsx` | Reescrever (novo design) |
| `src/components/dashboard/ExecutiveKPICard.tsx` | Criar |
| `src/components/dashboard/ExecutiveHome.tsx` | Criar (orquestrador das 6 zonas) |
| `src/components/dashboard/ThreatPanel.tsx` | Criar (Zona D — alertas estilizados) |
| `src/components/dashboard/TrendProjection.tsx` | Criar (Zona E — produção hist+proj) |
| `src/components/dashboard/QuickRecommendations.tsx` | Criar (Zona F — top 5) |
| `src/components/dashboard/ConcessionMap.tsx` | Editar (cores semáforo + popup) |
| `tailwind.config.ts` | Editar (novas cores se necessário) |

### Abordagem de Implementação

Implementação em **2 passos** dado o volume:
1. **Passo 1:** Paleta, header estratégico, KPIs redesenhados, Home Executiva com 6 zonas, navegação simplificada
2. **Passo 2:** Mapa com semáforo, popup executivo, refinamentos CSS finais

