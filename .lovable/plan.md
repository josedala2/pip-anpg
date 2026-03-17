

## Visita Virtual às Instalações (Matterport)

### Resumo

Adicionar a cada instalação a possibilidade de incorporar um tour virtual Matterport via iframe. Na ficha de detalhe de cada plataforma/FPSO aparecerá um botão "Visita Virtual 360°" que abre um painel com o iframe do Matterport embebido. Cada `PlatformSpec` receberá um campo opcional `matterportUrl`.

### Alterações

**1. Modelo de dados — `src/data/angolaBlocks.ts`**
- Adicionar campo `matterportUrl?: string` à interface `PlatformSpec`
- Adicionar URLs de exemplo (demo Matterport públicos) a algumas plataformas do Bloco 0 para demonstração (ex: `https://my.matterport.com/show/?m=SxQL3iGyvJk`)

**2. Componente de Tour Virtual — `src/components/dashboard/VirtualTourViewer.tsx`** (novo)
- Componente que recebe `matterportUrl` e `facilityName`
- Renderiza um iframe responsivo (aspect-ratio 16:9) apontando ao URL Matterport
- Inclui botão de ecrã inteiro (fullscreen toggle)
- Estado de loading com skeleton enquanto o iframe carrega
- Fallback visual quando não há URL configurado

**3. Ficha de detalhe — `src/components/dashboard/FacilityDetailCard.tsx`**
- Importar `VirtualTourViewer`
- Adicionar secção "Visita Virtual 360°" entre a galeria de fotos e os documentos
- Só aparece se `spec.matterportUrl` existir
- Card com ícone de câmara 360° e o viewer embebido

**4. Lista de instalações — `src/components/dashboard/FacilitiesTab.tsx`**
- Adicionar badge "360°" nos cards de instalações que têm `matterportUrl`, para indicar visualmente que têm tour disponível

### Notas técnicas
- O Matterport funciona inteiramente via iframe — não precisa de SDK nem API key
- Os URLs de demo são públicos e servem para demonstrar a funcionalidade
- Quando houver URLs reais das instalações, basta substituir no campo `matterportUrl`

