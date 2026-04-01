

## Substituir Fonte de Polígonos: Excel por GeoJSON Oficial

### Contexto
O sistema actual carrega coordenadas de blocos a partir de um ficheiro Excel (`block-coordinates.xlsx`) via a biblioteca `xlsx` (lazy-loaded). O utilizador forneceu um GeoJSON oficial (`Concessoes_Angola.geojson`) com ~310 features, incluindo blocos (com `Lease_ID` como "BL 55", "KON21", "CON 1") e áreas/campos individuais (com `BLOCO` como "Bloco 17", "Bloco 31" e `Nome` como "Girassol", "Kalimba").

### Vantagens da migração
- Elimina a dependência pesada da biblioteca `xlsx` (~200KB gzipped)
- GeoJSON é nativo para Leaflet (sem parsing manual)
- Dados oficiais com geometrias MultiPolygon completas
- Inclui metadados adicionais (área, operador, categoria, nome do campo)

### Alterações

#### 1. Copiar GeoJSON para `public/data/`
- `public/data/concessoes-angola.geojson`

#### 2. Reescrever `src/data/blockPolygonsLoader.ts`
- Remover toda a lógica de parsing Excel e o mapeamento manual `nameToId`
- Carregar o GeoJSON via `fetch("/data/concessoes-angola.geojson")`
- Extrair o `Nome` ou `Lease_ID` de cada feature e mapear para os IDs da app (ex: "Bloco 55" -> "block-55", "KON21" -> "block-kon21", "CON 1" -> "block-con1")
- Converter coordenadas de `[lng, lat, z]` (GeoJSON) para `[lat, lng]` (Leaflet)
- Para MultiPolygons, usar o primeiro anel do primeiro polígono
- Manter a interface `BlockPolygonMap` e a função `loadBlockPolygons()` inalteradas
- Aplicar simplificação (maxPoints) para performance

#### 3. Consumidores (sem alteração de interface)
- `ConcessionMap.tsx` — continua a usar `loadBlockPolygons()` sem alteração
- `LoginPolygonsOverlay.tsx` — idem

#### 4. Limpeza
- Remover `public/data/block-coordinates.xlsx` (se existir)
- A dependência `xlsx` pode ser removida do `package.json` se não for usada noutro local

### Mapeamento de nomes GeoJSON -> IDs da app
O GeoJSON usa dois padrões:
- Blocos: `Nome` = "Bloco 55" ou `Lease_ID` = "BL 55", "KON21", "CON 1"
- Campos/áreas: `Nome` = "Girassol", `BLOCO` = "Bloco 17" (estes são sub-áreas, não blocos principais)

Apenas os features com `Lease_ID` preenchido serão mapeados como blocos. A conversão segue: "BL 55" -> "block-55", "KON21" -> "block-kon21", etc.

### Ficheiros afectados
- `public/data/concessoes-angola.geojson` (novo)
- `src/data/blockPolygonsLoader.ts` (reescrita)
- `package.json` (remoção de `xlsx` se não usado noutro local)

