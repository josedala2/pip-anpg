

## Plan: Aba "Estado da Concessão" na página de detalhe do Bloco

### Objectivo
Adicionar uma nova aba chamada **"Estado da Concessão"** no `BlockPage.tsx` que apresenta um resumo visual e accionável do estado contratual, prazos críticos e alertas para apoiar decisões rápidas dos gestores.

### Conteúdo da aba

A aba reunirá dados já existentes no modelo (`contractInfo`, `contractDate`, `phase`, `concession`, `economicData`, `fields`) e apresentará:

1. **Semáforo de Estado** — indicador visual (verde/amarelo/vermelho) baseado em:
   - Proximidade do fim do contrato (`productionPeriodEnd`)
   - Fase actual (`phase`)
   - Taxa de execução do investimento (`executionRate`)
   - Compliance score

2. **Timeline da Concessão** — barra horizontal mostrando:
   - Data de assinatura → Período de pesquisa → Início de produção → Fim do contrato
   - Posição actual marcada com "hoje"

3. **KPIs de Decisão** — cards compactos:
   - Tempo restante do contrato (anos/meses)
   - % do investimento executado vs planeado
   - Break-even price (de `economicData`)
   - Reservas restantes estimadas
   - NPV point-forward (se disponível)

4. **Alertas e Acções** — lista de alertas automáticos, ex.:
   - "Contrato expira em < 3 anos"
   - "Taxa de execução abaixo de 70%"
   - "Compliance score abaixo de 85%"
   - "Produção em declínio > 15% y/y"

5. **Quadro Resumo Contratual** — dados do `contractInfo` (tipo de contrato, decreto-lei, bónus, condições fiscais)

### Alterações técnicas

**Ficheiro:** `src/pages/BlockPage.tsx`
- Adicionar nova `TabsTrigger` com value `"concession-status"` e ícone `Landmark`, posicionada como segunda aba (após Visão Geral)
- Adicionar `TabsContent` correspondente com o componente `ConcessionStatusTab`

**Novo ficheiro:** `src/components/dashboard/ConcessionStatusTab.tsx`
- Componente que recebe `block: OilBlock` como prop
- Calcula alertas e semáforo a partir dos dados existentes
- Renderiza timeline, KPIs, alertas e resumo contratual
- Usa componentes UI existentes (Card, Badge, Progress)

Nenhuma alteração ao modelo de dados — todos os campos necessários já existem nas interfaces `OilBlock`, `ContractInfo`, `EconomicData` e `FiscalConditions`.

