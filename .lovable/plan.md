

## Plano: Actualizar dados de poços do Block 15 com dados reais do ficheiro Excel

### Dados Actuais vs Dados Reais (Excel)

Os dados actuais do Block 15 em `wellsData` estão incompletos — faltam os campos de resultados (`descobertaComercial`, `descobertaNaoComercial`, `seco`) e há discrepâncias nos valores de pesquisa/avaliação. Exemplo:

| Ano  | Actual (pesq/aval) | Excel (pesq/aval/com/ncom/seco) |
|------|--------------------|---------------------------------|
| 1998 | —                  | 5/1/4/0/1                       |
| 1999 | 4/4               | 2/3/2/0/0                       |
| 2000 | 2/0               | 6/1/5/1/0                       |
| 2003 | 7/4               | 4/3/4/0/0                       |
| 2006 | 3/3               | 0/3/0/0/0                       |
| 2022 | 1/0               | 1/0/1/0/0                       |
| 2024 | 0/1               | 1/0/1/0/0                       |

### Alteração

**Ficheiro**: `src/data/angolaBlocks.ts` (linhas 628-641)

Substituir o array `wellsData` do Block 15 pelos dados correctos do Excel, incluindo todos os campos de resultado:

```typescript
wellsData: [
  { year: 1998, pesquisa: 5, avaliacao: 1, descobertaComercial: 4, descobertaNaoComercial: 0, seco: 1 },
  { year: 1999, pesquisa: 2, avaliacao: 3, descobertaComercial: 2, descobertaNaoComercial: 0, seco: 0 },
  { year: 2000, pesquisa: 6, avaliacao: 1, descobertaComercial: 5, descobertaNaoComercial: 1, seco: 0 },
  { year: 2001, pesquisa: 1, avaliacao: 1, descobertaComercial: 1, descobertaNaoComercial: 0, seco: 0 },
  { year: 2002, pesquisa: 1, avaliacao: 2, descobertaComercial: 1, descobertaNaoComercial: 0, seco: 0 },
  { year: 2003, pesquisa: 4, avaliacao: 3, descobertaComercial: 4, descobertaNaoComercial: 0, seco: 0 },
  { year: 2006, pesquisa: 0, avaliacao: 3, descobertaComercial: 0, descobertaNaoComercial: 0, seco: 0 },
  { year: 2008, pesquisa: 0, avaliacao: 2, descobertaComercial: 0, descobertaNaoComercial: 0, seco: 0 },
  { year: 2009, pesquisa: 0, avaliacao: 2, descobertaComercial: 0, descobertaNaoComercial: 0, seco: 0 },
  { year: 2022, pesquisa: 1, avaliacao: 0, descobertaComercial: 1, descobertaNaoComercial: 0, seco: 0 },
  { year: 2024, pesquisa: 1, avaliacao: 0, descobertaComercial: 1, descobertaNaoComercial: 0, seco: 0 },
],
```

Os anos sem actividade (2004-2005, 2007, 2010-2021, 2023) são omitidos, mantendo o padrão dos outros blocos. O antigo entry de 1997 é removido pois não consta no ficheiro Excel oficial.

### Impacto
- Correcção de dados apenas — sem alteração de UI
- Os gráficos de poços na aba Exploração do Block 15 e no painel agregado reflectirão automaticamente os dados correctos

