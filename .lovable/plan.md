

## Problema Identificado

A aba **Consórcio** tem informação duplicada:

1. **"Evolução do Grupo Empreiteiro"** -- mostra GE Inicial e **GE Actual** com barras de progresso + sumário de alterações
2. **"Parceiros Actuais"** -- repete exactamente a mesma lista do GE Actual com barras de progresso idênticas
3. **"Distribuição de Participações"** -- pie chart dos mesmos dados actuais

O card "Parceiros Actuais" é 100% redundante com a secção "GE Actual" do card de evolução.

Adicionalmente, na aba **Visão Geral**, a secção contratual (linhas 477-492) também mostra uma mini-tabela do GE Inicial que se repete na aba Consórcio.

## Plano

### 1. Remover o card "Parceiros Actuais" (linhas 931-955)
Eliminar o card duplicado. Tornar o pie chart "Distribuição de Participações" full-width para ocupar o espaço de forma adequada.

### 2. Redimensionar o pie chart
Tornar o card do pie chart `full-width` em vez de `md:grid-cols-2`, e ajustar o layout para ficar mais compacto (reduzir a altura do `ResponsiveContainer`).

### 3. Simplificar a mini-tabela GE Inicial na Visão Geral
Substituir a mini-tabela do GE Inicial na aba Visão Geral por uma linha resumo simples (ex: "GE Inicial: 5 parceiros") com link para a aba Consórcio, em vez de repetir todos os parceiros.

