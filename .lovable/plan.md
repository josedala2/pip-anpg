## Refinamento dos 9 Documentos da Proposta PIP ANPG

Aplicar três melhorias transversais aos `.docx` em `/mnt/documents/proposta-anpg/`, mantendo o restante conteúdo intacto.

### 1. Logo ANPG na capa
- Converter `src/assets/anpg-logo-color-v2.svg` para PNG (1200px largura, fundo transparente) via `rsvg-convert` ou `sharp`, gravar em `/tmp/docs-anpg/assets/anpg-logo.png`.
- Inserir no topo da capa de cada documento (centrado, ~5cm largura) através do helper `common.js` (`buildCover()`), acima do título institucional.
- Aplicar também no cabeçalho (versão pequena ~1.5cm à esquerda) para reforço de identidade em cada página.

### 2. Diagramas Mermaid → PNG embutido
Renderizar todos os diagramas Mermaid descritos no plano original como PNG via `@mermaid-js/mermaid-cli` (`mmdc`) com tema institucional (cores `#0A3D62`, `#C9A227`, fundo branco, fonte Calibri).

Diagramas a gerar em `/tmp/docs-anpg/diagrams/`:
- `03_erd_canonico.png` — ERD completo (~35 entidades, 6 domínios)
- `03_erd_concessao.png`, `03_erd_operacional.png`, `03_erd_economico.png`, `03_erd_hse.png`, `03_erd_contratual.png`, `03_erd_governacao.png` — ERDs parciais por domínio
- `05_medalhao.png` — Arquitectura Bronze/Silver/Gold (flowchart)
- `05_estrela_bi.png` — Modelo dimensional estrela (Facts + Dimensions)
- `06_arquitectura_camadas.png` — 5 camadas técnicas (Apresentação→Integrações)
- `06_deployment.png` — Diagrama de deployment
- `06_fluxo_integracao.png` — Fluxos DPRO/DEX/DNEG/DEC/Sonangol/MIREMPET
- `07_gantt_roadmap.png` — Gantt das 5 fases (M1–M18)
- `09_dama_dmbok.png` — 11 áreas DAMA-DMBOK (mindmap/flowchart)
- `09_dimensoes_qualidade.png` — 6 dimensões de qualidade

Substituir nos `.docx` os blocos actuais de "código Mermaid" pelo `ImageRun` correspondente, com legenda numerada ("Figura X — …") e largura ajustada (15cm portrait / 24cm landscape).

### 3. Revisão terminológica institucional
Varrer os 9 documentos e harmonizar conforme directrizes ANPG:
- "Objetivo" → "Objectivo"; "ação"/"ações" → "acção"/"acções"; "projeto" → "projecto"; "atividade" → "actividade"; "produção" mantém.
- "Reservas" (uso genérico) → distinguir "Recurso Descoberto" (2C/2P, MMBO/BCF) vs "Recurso Prospectivo" (exploração).
- "Empresa operadora" → "Operador"; "campo petrolífero" → "Campo"; "área contratual" → "Concessão" ou "Bloco" conforme contexto.
- "Receita bruta" → "Receita do Estado" quando se refere a fluxo fiscal; "lifting" mantém em itálico.
- "KPI" mantém; "dashboard" → "painel"; "stakeholder" → "parte interessada" (excepto em secções técnicas onde mantém).
- "Compliance" → "Conformidade"; "deadline" → "prazo"; "milestone" → "marco".
- Garantir "ANPG" sempre por extenso na 1ª ocorrência de cada documento: "Agência Nacional de Petróleo, Gás e Biocombustíveis (ANPG)".
- Referências legais completas: "Lei n.º 10/04, de 12 de Novembro (Lei das Actividades Petrolíferas)", "Decreto Presidencial n.º 282/11".

### Abordagem técnica

```text
/tmp/docs-anpg/
├── assets/anpg-logo.png          (novo, gerado de SVG)
├── diagrams/*.png                (12+ PNGs Mermaid)
├── lib/
│   ├── common.js                 (actualizar buildCover, buildHeader)
│   ├── terminology.js            (novo: mapa de substituições + função applyTerminology)
│   └── mermaid.js                (novo: helpers para gerar/embutir PNGs)
└── scripts/01..09_*.js           (regenerar todos com logo + PNGs + termos revistos)
```

Processo:
1. Instalar `@mermaid-js/mermaid-cli` e `sharp` (ou usar `rsvg-convert` via nix).
2. Converter logo SVG → PNG uma vez.
3. Escrever todos os `.mmd` em `/tmp/docs-anpg/diagrams/src/` e renderizar batch via `mmdc -i x.mmd -o x.png -t neutral -b white -w 1600`.
4. Actualizar `common.js` com `buildCover(logo)` e `buildHeader(logoSmall)`.
5. Adicionar `terminology.js` com função que percorre todos os `TextRun` finais (aplicada no fim de cada script antes de `Packer.toBuffer`).
6. Re-executar os 9 scripts; manter mesmos nomes de ficheiro (sobrescrever em `/mnt/documents/proposta-anpg/`).
7. QA: para cada `.docx`, converter a PDF (LibreOffice) → imagens (pdftoppm) → inspecção visual (capa com logo, páginas com diagramas PNG legíveis, ortografia).
8. Entrega progressiva com `<presentation-artifact>` para cada documento aprovado.

### Não-objectivos
- Não alterar a estrutura, secções, ou volume de conteúdo dos documentos.
- Não modificar nenhum ficheiro do código-fonte da plataforma.
- Não alterar a paleta de cores nem o layout institucional já definido.
