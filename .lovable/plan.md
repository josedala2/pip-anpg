

## Plano: Substituir overlay SVG por mapa Leaflet decorativo na página de login

### Problema
O overlay SVG com projecção linear simples não se alinha bem com a imagem de satélite — as coordenadas não correspondem visualmente.

### Abordagem
Substituir o `LoginPolygonsOverlay` por uma instância do `ConcessionMap` real (Leaflet), renderizado como fundo decorativo com opacidade reduzida e sem interactividade.

### Alterações

**1. `src/components/LoginPolygonsOverlay.tsx` — reescrever**
- Substituir o SVG manual por um `ConcessionMap` embebido dentro de um container absoluto
- Passar `oilBlocks` como dados, desactivar popup (`disablePopup={true}`)
- Handlers de click/hover vazios (no-op)
- Container com `opacity-20` e `pointer-events-none` para efeito decorativo
- Remover toda a lógica de projecção manual

**2. `src/pages/LoginPage.tsx` — sem alterações**
- O componente `LoginPolygonsOverlay` já está importado e posicionado correctamente

### Resultado
O mapa real com polígonos georreferenciados aparece como fundo subtil na página de login, com tile layer de satélite e blocos correctamente posicionados.

### Ficheiros
- `src/components/LoginPolygonsOverlay.tsx` — reescrito

