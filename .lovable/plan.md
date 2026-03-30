

## Actualizar Dados do Bloco 0 com Documento Oficial

### Análise: o que já está correcto vs o que falta

A maioria dos dados do Bloco 0 já está alinhada com o documento. Foram identificadas as seguintes diferenças:

| Campo | Valor actual | Valor do documento |
|-------|-------------|-------------------|
| `estimatedReserves` | 21,000 (STOOIP) | Deve manter-se; falta campo separado para **Reservas Actuais: 421 MMBO** |
| Recovery Factor | Não existe | **20%** |
| Research Period (alterado) | Fase inicial 7 anos/7 poços | **Contrato Alterado: 2022-2031**, 3+3 poços (1.º poço 119-D perfurado 2025) |
| N'Dola Sul primeiro óleo | Não registado | **Dezembro 2025** |
| Actividades-chave | Não existem | 5 prioridades estratégicas do documento |
| Programa de trabalho adicional | Não existe | Longui, N'Dola Sul, Banzala piloto, revisão DROs |

### Alterações

**1. `src/data/angolaBlocks.ts` — Interface `OilBlock`**
- Adicionar campos opcionais: `currentReservesMMBO?: number`, `recoveryFactorPercent?: number`, `keyActivities?: string[]`, `workProgram?: string[]`

**2. `src/data/angolaBlocks.ts` — Dados do Block 0**
- Adicionar `currentReservesMMBO: 421`
- Adicionar `recoveryFactorPercent: 20`
- Actualizar `contractInfo.researchPeriod` com detalhes do contrato alterado (2022-2031, 3+3 poços)
- Adicionar `keyActivities` com as 5 prioridades estratégicas extraídas do documento
- Adicionar `workProgram` com os 4 itens (Longui, N'Dola Sul, Banzala, DROs)

**3. Páginas de detalhe do bloco** — Verificar se os novos campos são exibidos nos separadores relevantes (Visão Geral, Estado da Concessão). Se não forem renderizados automaticamente, adicionar exibição nos componentes correspondentes.

### Ficheiros a alterar
1. `src/data/angolaBlocks.ts` — interface + dados Block 0
2. Componentes de detalhe do bloco (se necessário para renderizar novos campos)

