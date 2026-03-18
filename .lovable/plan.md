

## Plano: Polígonos de concessões como overlay na página de login

### Abordagem
Criar um componente SVG overlay que carrega os polígonos das concessões via `loadBlockPolygons()` e os renderiza sobre a imagem de fundo da página de login, com baixa opacidade (≈10-15%) e stroke subtil, criando um efeito decorativo que reforça o contexto petrolífero.

### Alterações

**1. Novo componente `src/components/LoginPolygonsOverlay.tsx`**
- Usa `useEffect` + `useState` para carregar `loadBlockPolygons()` assincronamente
- Converte coordenadas geográficas [lat, lng] para posições SVG no viewBox, usando uma projecção linear simples (bounding box da costa angolana: lat ~-18 a -4, lng ~8 a 14)
- Renderiza um `<svg>` absoluto cobrindo toda a tela, com cada bloco como `<polygon>` com `fill` primário a ~8% opacidade e `stroke` a ~15%
- Animação fade-in suave ao carregar

**2. Integração em `src/pages/LoginPage.tsx`**
- Inserir `<LoginPolygonsOverlay />` entre a imagem de fundo e o gradient overlay (linha ~104-105)
- Sem impacto no layout existente — é puramente decorativo e posicionado absolutamente

### Ficheiros
- `src/components/LoginPolygonsOverlay.tsx` — novo
- `src/pages/LoginPage.tsx` — inserção de 1 linha

