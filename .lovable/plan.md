

## Plano: Adicionar Tooltips explicativos aos cards da plataforma

### Contexto
A plataforma tem diversos tipos de cards (KPI cards na Home Executiva, cards de exploração, cards de produção, painéis de concessão, etc.) que mostram valores técnicos sem contexto explicativo. Novos utilizadores podem não entender o significado de métricas como "STOOIP", "TRIR", "Taxa de Sucesso", etc.

### Abordagem
Criar um componente utilitário `InfoTooltip` reutilizável que renderiza um ícone `HelpCircle` (ou `Info`) com um tooltip ao hover. Este componente será adicionado ao lado dos labels dos cards em toda a plataforma.

### Componente
**Novo ficheiro: `src/components/ui/info-tooltip.tsx`**
- Recebe `text: string` como prop
- Renderiza um ícone pequeno (14px) com `Tooltip` do Radix
- Estilo discreto (cor `muted-foreground`, opacity reduzida) para não poluir visualmente

### Locais de aplicação (por prioridade)

**1. Home Executiva — KPI Cards** (`ExecutiveKPICard.tsx`)
- Já tem `drillDownInfo` no tooltip do card inteiro — manter, mas adicionar também o `InfoTooltip` junto ao label para ser mais visível e intuitivo

**2. Página de Bloco — Aba Exploração** (`BlockPage.tsx`, ~linhas 1100-1175)
- Cards: Sísmica 2D, Sísmica 3D, Sísmica 4D, STOOIP, Poços Perfurados, Resultados, Taxa de Sucesso

**3. Página de Bloco — Cards de resumo** (`BlockPage.tsx`, cards de Produção, Reservas, Investimento, Risco, Compliance)

**4. Aba Concessão** (`ConcessionStatusTab.tsx`)
- Cards: Timeline da Concessão, Condições Fiscais, Progresso de Investimento

**5. Aba HSE** (`HSEEnvironmentTab.tsx`)
- Métricas: TRIR, LTI, LTIR, Fatalidades

**6. Aba Facilidades** (`FacilitiesTab.tsx`)
- Eficiência, Capacidade

### Dicionário de tooltips
Será definido um objecto centralizado com as descrições em português, por exemplo:
```text
"Sísmica 2D"       → "Quilómetros lineares de levantamento sísmico bidimensional"
"Sísmica 3D"       → "Área coberta por levantamento sísmico tridimensional"
"STOOIP"           → "Stock Tank Original Oil In Place — volume estimado de óleo in-situ"
"Taxa de Sucesso"  → "Rácio entre descobertas (comerciais + não comerciais) e poços de pesquisa"
"TRIR"             → "Total Recordable Incident Rate — taxa total de incidentes registáveis"
"LTI"              → "Lost Time Injuries — número de acidentes com tempo perdido"
"Poços Perfurados" → "Total de poços de pesquisa e avaliação perfurados no bloco"
...
```

### Ficheiros a criar/editar
| Ficheiro | Acção |
|----------|-------|
| `src/components/ui/info-tooltip.tsx` | **Criar** — componente reutilizável |
| `src/lib/tooltipDescriptions.ts` | **Criar** — dicionário centralizado de descrições |
| `src/components/dashboard/ExecutiveKPICard.tsx` | Editar — adicionar `InfoTooltip` junto ao label |
| `src/pages/BlockPage.tsx` | Editar — adicionar tooltips nos cards de exploração e resumo |
| `src/components/dashboard/ConcessionStatusTab.tsx` | Editar — tooltips nos CardTitle |
| `src/components/dashboard/HSEEnvironmentTab.tsx` | Editar — tooltips nas métricas HSE |
| `src/components/dashboard/FacilitiesTab.tsx` | Editar — tooltips nos indicadores |

### Notas
- O componente é puramente visual, sem impacto em dados ou lógica
- Estilo consistente com o design system existente (glass-card, cores muted)
- O dicionário centralizado facilita futuras traduções ou alterações de texto

