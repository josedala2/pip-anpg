

## Actualizar Diagrama Esquemático com Infraestrutura Completa do Bloco 0

### Contexto
O esquemático actual tem apenas 10 nós genéricos. A imagem de referência mostra a infraestrutura real com ~30 instalações organizadas em 6 áreas operacionais, com tipologia de campos (Tier 1/2/3) e diferentes tipos de pipeline.

### Alterações — `src/components/dashboard/FacilitiesSchematic.tsx`

#### 1. Expandir tipos de nó e de ligação
- Adicionar tipo `"refinery"` ao `SchematicNode` (para Cabinda Refinery, Power Plant)
- Adicionar campo opcional `tier?: 1 | 2 | 3` e `area?: string` ao interface
- Adicionar tipo de link `"gas"` e `"water-injection"` (da legenda da imagem)

#### 2. Substituir array `nodes` (~10 → ~28 nós)
Organizados por área conforme a imagem:

**Onshore/Terminal** (direita-topo):
- Terminal Malongo, Cabinda Refinery, Malongo Power Plant, Futila Terminal (SNL)

**Greater Taluka Area** (esquerda-topo):
- N'Sando, Ssanefa, Barcala, Malongo North, Takula, Numbi, LPA/TK4, GG

**Greater Malongo Area** (centro-direita):
- GIP, Malongo South, Limba

**Area B** (esquerda-centro):
- Lomba N/S, Nemba, Vuko, Kungulo, Bamboco, Kokongo

**FPSO** (centro):
- Sanha FPSO, Sanha LPG

**Mafumeira** (direita-baixo):
- Mafumeira N., Mafumeira S., Lavuala, Livuite

**Exterior**:
- N'Dola (ligação Angola LNG), BBLT (Block 14)

#### 3. Substituir array `links` (~9 → ~25 ligações)
Reflectir os pipelines da imagem: crude oil (preto/escuro), gás (verde), water injection (azul), planned future (tracejado)

#### 4. Adicionar zonas de agrupamento (SVG `<rect>` ou `<ellipse>` semi-transparentes)
Substituir as 3 faixas de profundidade por contornos de área:
- Greater Taluka Area — contorno rosa
- Greater Malongo Area — contorno azul
- Area B — contorno verde/teal
- Mafumeira — contorno azul claro
- Terminal — contorno cinza

#### 5. Actualizar legenda
Incluir Tier 1/2/3 (cores dos campos) e tipos de pipeline (Crude, Gas, Water Injection, Planned)

#### 6. Ajustar viewBox
Expandir para ~1100×600 para acomodar os nós adicionais com espaçamento adequado

### Ficheiro afectado
- `src/components/dashboard/FacilitiesSchematic.tsx`

