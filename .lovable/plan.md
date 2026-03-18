

## Plano: Actualizar dados sísmicos do Bloco 0 com dados reais do ficheiro Excel

### Contexto
O ficheiro `Bloco_0.xlsx` contém dados sísmicos reais de 1960 a 2025 (2D, 3D, 4D). Os dados actuais em `angolaBlocks.ts` (linhas 425-449) começam apenas em 1993 e contêm valores que não correspondem aos dados reais fornecidos.

### Dados reais vs actuais
- **Ficheiro Excel**: 23.816 km (2D), 20.583 km² (3D), 0 km² (4D) — dados desde 1960
- **Dados actuais**: começam em 1993, incluem valores de 4D significativos (ex: 1.232 km² em 2017)

### Discrepância importante
Os dados actuais incluem valores de 4D substanciais, mas o ficheiro Excel mostra 4D = 0 para todos os anos. Antes de proceder:

### Alteração
Substituir o array `seismicData` do Bloco 0 (linhas 425-449 de `src/data/angolaBlocks.ts`) pelos dados reais do Excel, incluindo apenas anos com valores não-nulos:

```text
1960: 2D=195
1962: 2D=600
1966: 2D=52
1967: 2D=2020
1969: 2D=1883
1970: 2D=1180
1971: 2D=910
1972: 2D=1704
1973: 2D=1202
1974: 2D=286
1975: 2D=92
1978: 2D=80
1980: 2D=1380
1981: 2D=910
1982: 2D=62, 3D=60
1983: 2D=24, 3D=320
1984: 2D=2572, 3D=135
1985: 2D=3951
1986: 2D=1358
1987: 2D=241
1988: 2D=1099, 3D=470
1989: 3D=345
1990: 3D=240
1991: 3D=156
1992: 3D=5240
1993: 2D=962, 3D=1489
1995: 3D=2751
1996: 3D=761
1997: 2D=224
2003: 2D=829
2004: 3D=197
2006: 3D=4209
2009: 3D=1050
2010: 3D=3160
Total: 23.816 km 2D, 20.583 km² 3D, 0 km² 4D
```

### Ficheiro a editar
- `src/data/angolaBlocks.ts` — substituir `seismicData` do block-0 (linhas 425-449)

### Impacto
- Painel de Exploração mostrará dados históricos desde 1960 (cobertura muito mais ampla)
- Totais de sísmica 2D e 3D serão actualizados nos KPIs
- Valores de 4D passarão a 0 para este bloco (conforme dados reais)
- Gráficos de sísmica terão mais pontos de dados históricos

