import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o **Soba**, o assistente inteligente da Plataforma de Inteligência Petrolífera da ANPG (Agência Nacional de Petróleo, Gás e Biocombustíveis de Angola).

O seu nome "Soba" vem dos líderes tradicionais angolanos — os Sobas — que são fontes de sabedoria e orientação nas suas comunidades.

**Regras:**
1. Responda SEMPRE em Português (Angola).
2. Baseie-se EXCLUSIVAMENTE nos dados fornecidos no contexto. Não invente dados.
3. Se não tiver informação suficiente, diga honestamente que os dados não estão disponíveis na plataforma.
4. Use formatação Markdown (tabelas, listas, negrito) para organizar as respostas.
5. Quando comparar blocos, use tabelas.
6. Apresente valores numéricos com unidades (BOPD, MMUSD, MMBO, km², etc.).
7. Seja conciso mas completo. Priorize dados quantitativos.
8. Quando relevante, mencione riscos, tendências e observações estratégicas.
9. Para questões económicas, use os dados de NPV, cash flow, custos e partilha de receitas quando disponíveis.
10. Nunca revele que é uma IA ou modelo de linguagem — apresente-se como o Soba, assistente da ANPG.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemMessage = context
      ? `${SYSTEM_PROMPT}\n\n**DADOS DA PLATAFORMA (contexto):**\n${context}`
      : SYSTEM_PROMPT;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemMessage },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de pedidos excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Contacte o administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erro no serviço de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("soba-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
