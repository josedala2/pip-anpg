

## Adicionar Lista de Instalações com Acesso Directo no Painel Principal

### Problema
O painel "Instalações" no menu principal (`FacilitiesIntegrityPanel`) mostra apenas análises agregadas (ranking de criticidade, gráficos idade vs risco, gargalos). Falta uma lista visual de todas as instalações com cards clicáveis que permitam aceder à ficha de detalhe individual (com tour virtual, fotos, documentos, manutenção).

### Solução
Adicionar uma nova tab "Lista de Instalações" ao `FacilitiesIntegrityPanel` que apresenta cards visuais de todas as instalações agrupadas por bloco. Ao clicar num card, abre a vista de detalhe individual (`FacilityDetailCard`) com tour Matterport, galeria, documentos e manutenção.

### Alterações

**1. `src/components/dashboard/FacilitiesIntegrityPanel.tsx`**
- Adicionar nova tab "Instalações" ao `TabsList` existente (junto de "Ranking", "Scatter", "Bottlenecks", "Tipos")
- Implementar estado `selectedFacility` para controlar a vista de detalhe
- Quando uma instalação é seleccionada, mostrar `FacilityDetailCard` com botão "Voltar"
- A tab mostra cards agrupados por bloco, cada card com: foto, nome, tipo, status, badge 360° se tiver Matterport, capacidade e idade
- Importar `FacilityDetailCard` e os dados necessários de fotos/documentos/manutenção de cada bloco
- Filtrar fotos, documentos e itens de manutenção relevantes para a instalação seleccionada (mesmo padrão usado no `FacilitiesTab`)

**2. Layout dos cards**
- Grid responsivo (1-4 colunas conforme viewport)
- Agrupados por bloco com header do nome do bloco
- Cada card inclui: imagem hero, badge de status, badge 360° se aplicável, nome, tipo, capacidade, profundidade, idade
- Cursor pointer com hover effect para indicar interactividade

