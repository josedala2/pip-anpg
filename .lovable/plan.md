

## Plano: Actualizar Dados do Bloco 0 com Base nas Capturas ANPG

### Discrepâncias Identificadas

Comparando os screenshots com os dados actuais em `angolaBlocks.ts`:

#### 1. Enquadramento Geral (contractInfo)
| Campo | Valor Actual | Valor Correcto (Screenshot) |
|-------|-------------|---------------------------|
| areaKm2 | 5800 | 5042 |
| signatureBonus | 210,000,000 | 100,000,000 |
| socialBonus | 80,000,000 | 40,000,000 |
| endOfLifeYear | 2040 | 2045 |
| endOfLifeField | "Mafumeira Sul" | "N'Dola Sul" |
| productionPeriodEnd | "2030-12-31" | "2050-12-31" |

Campos novos a adicionar ao contractInfo:
- **Taxa Admin Associação**: USD 2,500,000/ano (2022-2050)
- **Aprovisionamento Abandono**: USD 50,000,000/ano desde Jan 2023
- **Decreto original**: n.º 47380 de 14/Nov/1957
- **Alteração**: DLP n.º 1/23, de 21 de Abril
- Prorrogação por 20 anos (3.º estágio 2030-2050)
- Taxa dos Direitos de Concessão: 20% até 2026, 15% de 2027-2050
- Fiscal: Amortização 16%, TTP 70%

#### 2. HSE — RWDC Incorrectos
Os valores de RWDC estão todos a zero no código, mas o screenshot mostra valores reais:

| Ano | RWDC Actual | RWDC Correcto |
|-----|-------------|---------------|
| 2018 | 0 | 3 |
| 2019 | 0 | 7 |
| 2020 | 0 | 2 |
| 2021 | 0 | 3 |
| 2022 | 0 | 9 |
| 2023 | 0 | 3 |
| 2024 | 0 | 5 |
| 2025 | 0 | 2 |

#### 3. Dados Ambientais — Oil in Water PPM Incorrectos
| Ano | PPM Actual | PPM Correcto |
|-----|-----------|-------------|
| 2019 | 4.80 | 5.97 |
| 2020 | 5.00 | 5.76 |
| 2021 | 5.17 | 5.17 (ok) |
| 2022 | 5.10 | 5.10 (ok) |
| 2023 | 4.75 | 4.75 (ok) |
| 2024 | 4.66 | 4.66 (ok) |
| 2025 | 6.53 | 6.53 (ok) |

Targets de gás queimado a verificar:
- 2019: sem meta (0 no screenshot); 2020: 24; 2021: 24; 2022: ?; 2023: 14.0; 2024: 12.7; 2025: 12.5

#### 4. Capacidades de Instalações (facilityData)
Adicionar campos que faltam:
- Capacidade injecção de água: 570,000 BWIPD
- Capacidade água produzida: 300,000 BWP

### Ficheiro a Editar

**`src/data/angolaBlocks.ts`** — Block 0 (linhas 341-937):
- Corrigir areaKm2, signatureBonus, socialBonus
- Corrigir endOfLifeYear e endOfLifeField
- Estender contractInfo com novos campos fiscais e de abandono
- Corrigir RWDC no array hseData (8 entradas)
- Corrigir oilInWaterPPM para 2019 e 2020
- Actualizar gasFlaredTarget onde necessário
- Adicionar legislação do decreto original (1957) e DLP 1/23

### Impacto
- Painéis de HSE mostrarão barras RWDC correctas no gráfico de segurança
- Dados ambientais de Oil in Water PPM corrigidos nos gráficos
- Informação contratual alinhada com a documentação oficial ANPG
- Sem alterações de interface necessárias — apenas correcção de dados

