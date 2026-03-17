

## Personalizar o tratamento do Soba com nome do utilizador e tom colegial

### O que muda

1. **SobaChat.tsx** — Buscar o `full_name` e `cargo` do perfil do utilizador logado na tabela `profiles`, e passar essa informação para a edge function junto com o contexto.

2. **SobaChat.tsx (UI)** — A saudação inicial "Olá! Sou o Soba 🇦🇴" passa a incluir o primeiro nome do utilizador: "Olá, João! Sou o Soba 🇦🇴".

3. **Edge function `soba-chat/index.ts`** — Aceitar um campo `userName` e `userRole` no body do request e injectar no system prompt uma secção de personalização:
   - Tratar o utilizador pelo primeiro nome como colega ("Caro/a João", "Colega")
   - Adaptar o nível de detalhe ao cargo (ex: Conselho → mais executivo, Técnico → mais detalhado)
   - Acrescentar ao SYSTEM_PROMPT regras como: "Trate o utilizador como colega, referindo-se pelo nome. O utilizador chama-se {nome} e ocupa o cargo de {cargo}."

### Detalhes técnicos

| Ficheiro | Alteração |
|---|---|
| `src/components/dashboard/SobaChat.tsx` | Fetch profile (`full_name`, `cargo`) on mount; pass `userName`/`userRole` in fetch body; personalizar greeting |
| `supabase/functions/soba-chat/index.ts` | Extrair `userName`/`userRole` do body; injectar no system prompt regras de tratamento colegial personalizado |

### Lógica do system prompt adicional

```text
## PERSONALIZAÇÃO
- O utilizador chama-se **{full_name}** e ocupa o cargo de **{cargo}**.
- Trate-o(a) como colega sénior. Use o primeiro nome de forma natural.
- Adapte a profundidade: decisores (Conselho, Admin) preferem sínteses executivas; técnicos preferem detalhe operacional.
```

