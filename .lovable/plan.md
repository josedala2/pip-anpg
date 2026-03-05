

## Plan: Módulo de Relatórios Automáticos

### Objectivo
Criar uma nova página `/reports` com um sistema de geração de relatórios personalizados, onde o utilizador selecciona blocos, tipo de relatório e período, e obtém um relatório formatado com os dados existentes, pronto para exportar.

### Estrutura

**1. Nova página `src/pages/ReportsPage.tsx`**
- Formulário de configuração do relatório com:
  - **Tipo de relatório**: Resumo Executivo, Contractual & Fiscal, Exploração & Produção, Consórcio & Participações, Legislação & Documentos
  - **Selecção de blocos**: Multi-select com todos os blocos disponíveis (ou "Todos")
  - **Opções adicionais**: Incluir gráficos, incluir tabelas comparativas
- Área de pré-visualização do relatório gerado
- Botão "Exportar PDF" (via `window.print()` com CSS `@media print`)
- Botão "Copiar para Clipboard"

**2. Componente `src/components/reports/ReportPreview.tsx`**
- Renderiza o relatório com base nas selecções do utilizador
- Secções dinâmicas conforme o tipo escolhido:
  - **Resumo Executivo**: KPIs agregados (produção total, investimento, reserves), tabela comparativa dos blocos seleccionados
  - **Contractual & Fiscal**: Decreto-lei, condições fiscais, bónus, períodos de pesquisa por bloco
  - **Exploração & Produção**: Sísmica, poços, descobertas, taxas de sucesso
  - **Consórcio**: Evolução GE Inicial → Actual por bloco
  - **Legislação**: Lista consolidada de todos os documentos dos blocos seleccionados
- Cabeçalho com logo ANPG, data de geração, título do relatório
- Estilos `print:` para formatação limpa na exportação

**3. Componente `src/components/reports/ReportConfigurator.tsx`**
- UI do formulário de configuração com checkboxes, selects, e radio groups
- Validação: pelo menos 1 bloco e 1 tipo seleccionado

**4. Integração no App**
- Nova rota `/reports` no `App.tsx`
- Link de navegação no dashboard principal (ícone FileText na barra superior)

### Ficheiros a Criar/Modificar
- **Criar**: `src/pages/ReportsPage.tsx`
- **Criar**: `src/components/reports/ReportConfigurator.tsx`
- **Criar**: `src/components/reports/ReportPreview.tsx`
- **Modificar**: `src/App.tsx` (adicionar rota)
- **Modificar**: `src/pages/Index.tsx` (adicionar link na navegação)

### Tecnologia
- Dados locais do `angolaBlocks.ts` (sem backend necessário)
- `window.print()` com CSS `@media print` para exportação PDF
- Clipboard API para copiar conteúdo

