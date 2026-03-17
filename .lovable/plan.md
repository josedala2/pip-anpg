

## Chatbot "Soba" — Nova aba na plataforma

### Conceito
Adicionar uma aba "Soba" ao painel principal que funciona como assistente inteligente. O chatbot recebe como contexto **todos os dados dos blocos** (serializado do `angolaBlocks.ts`) e responde perguntas sobre produção, economia, contratos, exploração, etc.

### Arquitectura

1. **Edge Function `soba-chat`** — recebe as mensagens do utilizador + contexto dos dados dos blocos, chama Lovable AI (streaming SSE) com um system prompt especializado em petróleo angolano, e devolve a resposta em stream.

2. **Componente `SobaChat.tsx`** — interface de chat com:
   - Input de mensagem na parte inferior
   - Histórico de mensagens (user/assistant) com rendering markdown (`react-markdown`)
   - Streaming token-by-token
   - Sugestões rápidas pré-definidas (ex: "Qual bloco produz mais?", "Resumo económico do Bloco 0")

3. **Integração no Index.tsx** — adicionar "Soba" ao array `allPanels` e renderizar o componente no switch de painéis.

### Ficheiros a criar/modificar

| Ficheiro | Acção |
|----------|-------|
| `supabase/functions/soba-chat/index.ts` | **Criar** — edge function com streaming, system prompt com contexto dos blocos |
| `supabase/config.toml` | **Modificar** — adicionar `[functions.soba-chat]` com `verify_jwt = false` |
| `src/components/dashboard/SobaChat.tsx` | **Criar** — componente de chat com streaming e markdown |
| `src/pages/Index.tsx` | **Modificar** — adicionar "Soba" ao `allPanels`, importar e renderizar `SobaChat` |

### Detalhes técnicos

- **Contexto**: A edge function recebe um resumo compacto dos dados dos blocos (produção, operador, reservas, económico) serializado pelo frontend. Para não exceder limites de tokens, enviamos um resumo estruturado e não o objecto completo.
- **System prompt**: Analista petrolífero angolano, responde em Português, baseado exclusivamente nos dados fornecidos.
- **Streaming**: SSE line-by-line parsing no frontend, actualização progressiva da última mensagem assistant.
- **Sugestões rápidas**: Botões clicáveis com perguntas frequentes para facilitar a interacção.

