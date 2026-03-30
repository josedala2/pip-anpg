

## Adicionar Prospectividade Futura ao Bloco 0

### Dados do utilizador
- **STOOIP**: 3.292,1 MMBO
- **GIIP**: 61.797 BCF
- **Plays**: Terciário, Albiano, Pré-sal
- **Proximidade**: Mafumeira, Sanha, Vuco, Kungulo

### Problema actual
O array `prospects` do Bloco 0 está vazio (`prospects: []`). A interface `Prospect` actual tem campos por prospecto individual (name, reservoir, resourcesMMBO, resourcesBCF, pos), mas os dados fornecidos são **agregados por play**, sem prospectos individuais nomeados.

### Abordagem
Criar **3 prospectos** correspondentes aos 3 plays identificados, distribuindo os recursos proporcionalmente (estimativa razoável dado que o documento não detalha a repartição):

| Play | MMBO | BCF | Área referência |
|------|------|-----|----------------|
| Terciário | 1.097 | 20.599 | Mafumeira, Sanha |
| Albiano | 1.097 | 20.599 | Vuco, Kungulo |
| Pré-sal | 1.098 | 20.599 | Área geral |

**Nota**: Se o utilizador tiver a repartição exacta por play, poderemos ajustar. Sem essa informação, a distribuição uniforme é a mais conservadora.

### Alternativa recomendada
Como os dados são agregados e não por prospecto, pode ser mais fiel ao documento criar um **único registo** por play com o total, ou adicionar um campo `explorationPotential` ao bloco. Vou implementar a opção de 3 prospectos (1 por play) pois encaixa na estrutura existente e aparecerá correctamente no `ProspectsSummary` e `ProspectsTable`.

### Alteração

**Ficheiro**: `src/data/angolaBlocks.ts`
- Substituir `prospects: []` do Bloco 0 por 3 entradas com os plays Terciário, Albiano e Pré-sal
- Cada entrada terá `discoveryArea: "Bloco 0"`, o nome do play como `name`, o reservoir correspondente, e recursos divididos em 3

### Detalhe técnico
```typescript
prospects: [
  { discoveryArea: "Bloco 0", name: "Play Terciário", reservoir: "Terciário", resourcesMMBO: 1097.4, resourcesBCF: 20599, pos: 0 },
  { discoveryArea: "Bloco 0", name: "Play Albiano", reservoir: "Albiano", resourcesMMBO: 1097.4, resourcesBCF: 20599, pos: 0 },
  { discoveryArea: "Bloco 0", name: "Play Pré-sal", reservoir: "Pré-sal", resourcesMMBO: 1097.3, resourcesBCF: 20599, pos: 0 },
]
```

Os totais somam exactamente 3.292,1 MMBO e 61.797 BCF. O `pos` fica a 0 pois o documento não especifica probabilidade de sucesso. Os componentes `ProspectsSummary` e `ProspectsTable` mostrarão automaticamente estes dados.

