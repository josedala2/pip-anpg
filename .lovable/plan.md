

## Adicionar Gráfico de Previsão de Fornecimento de Gás (2025–2050)

### O que será construído
Um gráfico de barras empilhadas (stacked bar chart) replicando a imagem oficial, mostrando a previsão de fornecimento de gás à ALNG de 2025 a 2050, com três categorias de fonte e uma linha de capacidade máxima.

### Dados a adicionar
Extraídos da imagem oficial (valores aproximados em MMSCFD por ano, 2025-2050):

| Categoria | Descrição |
|-----------|-----------|
| ALNG | Blocos 0, 14, 15, 17, 18, 31, 32, Quiluma e Maboqueiro (5.1 TCF reservas comerciais) |
| Oportunidade de Desenvolvimento | B0 Kambala/Vanza/Longui, 80I, 121C, Minzu, Livuite, etc. |
| Blocos em Exploração & Avaliação | B1/14, B20/11, B24, NGC Fase 2-4 |

Linha de referência: **Capacidade Máxima ALNG = 3.900 MMSCFD**

### Alterações

**1. `src/data/gasUtilization.ts`** — Adicionar array `gasSupplyForecastYearly` com dados anuais (2025-2050) para as 3 categorias (ALNG, desenvolvimento, exploração), extraídos da imagem.

**2. `src/components/dashboard/GasUtilizationPanel.tsx`** — Substituir o card estático de "Previsão de Fornecimento" por um novo `ComposedChart` com:
- Barras empilhadas para as 3 categorias (cores: laranja ALNG, roxo desenvolvimento, cinza exploração)
- `ReferenceLine` horizontal a 3.900 MMSCFD (capacidade máxima ALNG)
- Linha tracejada a ~1.100 MMSCFD (nível actual de fornecimento)
- KPIs laterais (Produção @2025, Utilidades, Fornecimento ALNG) mantidos
- Pressupostos e notas de demanda como texto abaixo do gráfico

O card de médias por período (2025-2030, 2031-2040, 2041-2050) será convertido num resumo compacto abaixo do gráfico.

