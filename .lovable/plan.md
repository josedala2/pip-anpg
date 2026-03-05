

## Plan: Aba Financeira & Contratual nos Blocos

### Objectivo
Adicionar uma nova aba **"Financeiro & Contratual"** (com ícone `DollarSign`) na página de detalhes de cada bloco, consolidando e expandindo a informação financeira e contratual que actualmente está dispersa na aba "Visão Geral".

### O que já existe
A aba "Visão Geral" já mostra parcialmente: bónus (assinatura, social, produção), condições fiscais (IRP/IPP/ITP), períodos de pesquisa, GE Inicial, e investimento acumulado. Estes dados vêm da interface `ContractInfo` e `FiscalConditions` no `angolaBlocks.ts`.

### Nova Aba — Secções

1. **Resumo Financeiro** — Cards de destaque:
   - Investimento Acumulado vs Planeado (com barra de progresso)
   - Taxa de Execução
   - Bónus Total (soma de assinatura + social + produção)
   - Contribuições Regulatórias e Projectos Sociais

2. **Evolução CAPEX** — Gráfico de barras (já existe `capexHistory` nos dados) mostrando Planeado vs Actual por ano, com totais

3. **Estrutura Contratual** — Informação legal e contratual:
   - Decreto-Lei, tipo de contrato, datas (assinatura, efectiva, período de produção)
   - GE Inicial (consórcio inicial com percentagens)
   - Períodos de pesquisa (fases inicial e subsequente, obrigações de poços e sísmica)

4. **Condições Fiscais** — Grelha detalhada:
   - Cost Recovery (pré e pós-produção)
   - IRP, IPP, ITP com visualização destacada
   - Prémios de produção e investimento
   - Notas especiais (taxa para empresas angolanas, reduções)

5. **Bónus & Obrigações** — Timeline/cards visuais:
   - Bónus de Assinatura, Social, Produção
   - Projectos Sociais (valor + período)
   - Contribuição Regulatória (valor + período)

6. **Notas Históricas** — Timeline com as notas contratuais históricas

### Alterações Técnicas

**Ficheiro: `src/pages/BlockPage.tsx`**
- Adicionar nova `TabsTrigger` com value `"financial"` e ícone `DollarSign`, posicionada após "Visão Geral"
- Adicionar novo `TabsContent` com value `"financial"` contendo as 6 secções acima
- Usar Recharts `BarChart` para visualização CAPEX (reutilizando padrão existente)
- Simplificar a aba "Visão Geral" removendo os cards financeiros/contratuais detalhados (mantendo apenas KPIs resumidos)

Nenhum ficheiro novo necessário — toda a informação já está no modelo de dados `OilBlock`.

