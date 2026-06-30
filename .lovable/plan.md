## Geração de 9 Documentos Institucionais — Proposta Técnica e Comercial PIP ANPG

### Objectivo
Produzir 9 documentos `.docx` autónomos, técnico-detalhados (10–20 páginas cada), em Português institucional ANPG, reflectindo o **estado-alvo (to-be)** da plataforma, prontos para anexar à proposta técnica e comercial. Cada documento incluirá capa, índice, controlo de versões, glossário e diagramas visuais (PNG renderizados a partir de Mermaid) quando aplicável.

### Identidade Visual e Convenções
- Logo ANPG na capa (usar `src/assets/anpg-logo-color-v2.svg`)
- Tipografia: Calibri/Arial 11pt corpo, títulos H1 16pt bold, H2 13pt bold
- Paleta institucional: azul ANPG `#0A3D62`, dourado `#C9A227`, cinza `#4A4A4A`
- Cabeçalho com referência do documento, rodapé com paginação
- Terminologia conforme directrizes ANPG: "Objectivo", "Recurso Descoberto" (MMBO/BCF), "Recurso Prospectivo", "Concessão", "Bloco", "Operador"

### Documentos a Gerar

#### 1. Especificação de Requisitos (RF + RNF) — `01_Especificacao_Requisitos.docx`
- Introdução, âmbito, stakeholders (CA, DPRO, DEX, DNEG, DEC, Conselho)
- **Requisitos Funcionais** numerados RF-001 a RF-~180, agrupados por módulo (16 módulos da plataforma)
- **Requisitos Não Funcionais** RNF-001 a RNF-~60: desempenho, segurança, disponibilidade, escalabilidade, usabilidade, acessibilidade, internacionalização, auditoria, conformidade legal (Lei 10/04, RGPD, Decreto Presidencial 282/11)
- Casos de uso principais e fluxos críticos

#### 2. Matriz de Rastreabilidade de Requisitos (RTM) — `02_RTM.docx`
- Tabela cruzada: Requisito ↔ Módulo ↔ Componente Técnico ↔ Caso de Teste ↔ Critério de Aceitação ↔ Stakeholder
- Cobertura bidireccional (forward & backward traceability)
- Indicadores de cobertura por módulo

#### 3. Modelo de Dados Canónico (ERD + Modelo Lógico) — `03_Modelo_Dados_Canonico.docx`
- Diagrama ERD completo (Mermaid → PNG): ~35 entidades em 6 domínios (Concessão, Operacional, Económico-Fiscal, HSE, Contratual, Governação)
- Modelo lógico relacional: PKs, FKs, cardinalidades, normalização 3FN
- Regras de integridade referencial e domínios de valores

#### 4. Dicionário de Dados Institucional — `04_Dicionario_Dados.docx`
- Para cada entidade: nome, descrição, owner (direcção responsável), classificação (Pública/Interna/Restrita/Confidencial)
- Para cada atributo: nome técnico, nome de negócio, tipo, tamanho, obrigatoriedade, domínio, unidade de medida, fonte autoritativa, regra de validação, exemplo
- Cobertura: ~35 entidades × ~10-25 atributos cada

#### 5. Modelo de Dados Analítico (BI-ready) — `05_Modelo_Analitico.docx`
- Arquitectura medalhão (Bronze/Silver/Gold)
- Modelo dimensional em estrela/floco: ~8 Fact tables (FactProducao, FactLifting, FactHomologacao, FactHSE, FactFinanceiro, FactReservas, FactExploracao, FactCompliance) e ~12 Dimensions
- Grain de cada Fact, SCDs (Slowly Changing Dimensions) Type 2 onde aplicável
- Camada semântica e KPIs canónicos (definição matemática de cada KPI exposto na plataforma)
- Diagrama estrela (Mermaid → PNG)

#### 6. Arquitectura Funcional e Técnica — `06_Arquitectura.docx`
- Arquitectura funcional: 16 módulos organizados em 5 domínios (Governação, Operacional, Negócios, Estratégia, IA)
- Arquitectura técnica em camadas (Mermaid → PNG): Apresentação (React/Vite) → API/Edge Functions → Serviços (Auth, Soba IA, Relatórios, Alertas) → Dados (PostgreSQL, Storage, Cache) → Integrações (DPRO, DEX, DNEG, DEC, Sonangol, MIREMPET)
- Stack tecnológica detalhada, padrões arquitecturais (CQRS para BI, RBAC, event-driven para alertas)
- Diagrama de deployment, fluxos de integração, segurança e observabilidade

#### 7. Plano de Implementação e Roadmap — `07_Roadmap.docx`
- 5 fases: Fundação (M1-M3), Operacional (M4-M7), Analítico (M8-M11), Inteligência (M12-M15), Governação Total (M16-M18)
- Cronograma Gantt (Mermaid gantt → PNG)
- Marcos contratuais, entregáveis, equipa por fase, dependências, gestão de risco, plano de comunicação e change management

#### 8. Backlog Funcional Estruturado — `08_Backlog.docx`
- Hierarquia: Épicos (16) → Features (~60) → User Stories (~250)
- Para cada US: ID, narrativa "Como X, quero Y, para Z", critérios de aceitação (Gherkin), prioridade MoSCoW, estimativa Fibonacci, dependências
- Roadmap de releases por sprint (sprints de 2 semanas × 36 sprints)

#### 9. Framework de Governação e Qualidade de Dados — `09_Governacao_Qualidade_Dados.docx`
- Modelo DAMA-DMBOK adaptado: 11 áreas de conhecimento
- Papéis: Data Owner, Data Steward, Data Custodian, Data Consumer (mapeados a direcções ANPG)
- 6 dimensões de qualidade (Completude, Conformidade, Consistência, Exactidão, Integridade, Tempestividade) com métricas, thresholds e KPIs de qualidade
- Políticas: classificação, retenção, ciclo de vida, MDM (Master Data Management) para Blocos/Operadores/Campos
- Conformidade: Lei 10/04 das Actividades Petrolíferas, Lei de Protecção de Dados, ANPG, BNA, AGT
- Processos de auditoria, lineage, catálogo de dados, gestão de incidentes de dados

### Abordagem Técnica de Geração

1. **Setup**: criar scripts em `/tmp/docs-anpg/` (Node.js com `docx` library + Python com `mermaid-cli` para PNG)
2. **Renderização de diagramas**: Mermaid CLI gera PNGs em `/tmp/docs-anpg/diagrams/` (ERD, arquitectura camadas, estrela BI, Gantt roadmap)
3. **Geração**: 1 script Node por documento, com módulo partilhado para capa/cabeçalho/rodapé/estilos
4. **QA obrigatório**: cada `.docx` → PDF (LibreOffice) → imagens (pdftoppm) → inspecção visual de capa, índice, primeiras 3 páginas com tabelas, páginas com diagramas, e última página. Correcção e re-geração até clean pass.
5. **Entrega**: 9 ficheiros em `/mnt/documents/proposta-anpg/` com tags `<presentation-artifact>` para download imediato

### Estimativa
- ~2.500–4.000 linhas de conteúdo por documento
- Geração e QA: processo iterativo, entrega progressiva dos documentos à medida que cada um passa QA

### Ficheiros a Produzir
```
/mnt/documents/proposta-anpg/
├── 01_Especificacao_Requisitos.docx
├── 02_RTM.docx
├── 03_Modelo_Dados_Canonico.docx
├── 04_Dicionario_Dados.docx
├── 05_Modelo_Analitico.docx
├── 06_Arquitectura.docx
├── 07_Roadmap.docx
├── 08_Backlog.docx
└── 09_Governacao_Qualidade_Dados.docx
```

Nenhum ficheiro do código-fonte da plataforma será alterado — todos os artefactos são gerados em `/mnt/documents/`.
