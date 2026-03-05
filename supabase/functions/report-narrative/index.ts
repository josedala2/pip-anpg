import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { blocks, reportTypes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um analista sénior de petróleo e gás da ANPG (Agência Nacional de Petróleo, Gás e Biocombustíveis de Angola).
Produza um sumário executivo narrativo em Português para um relatório que cobre os seguintes blocos petrolíferos e secções.

O sumário deve:
1. Ser escrito em tom profissional e institucional, adequado para apresentação a decisores
2. Ter 3-5 parágrafos concisos
3. Destacar os pontos mais relevantes: produção agregada, tendências de investimento, riscos principais, oportunidades estratégicas
4. Incluir recomendações accionáveis quando aplicável
5. Referenciar blocos específicos quando relevante para ilustrar pontos
6. Terminar com uma conclusão/perspectiva futura

Não use markdown headers nem bullet points — apenas parágrafos narrativos fluidos.`;

    const blockSummaries = blocks.map((b: any) => ({
      name: b.name,
      operator: b.operator,
      basin: b.basin,
      phase: b.phase,
      waterDepth: b.waterDepth,
      dailyProduction: b.dailyProduction,
      estimatedReserves: b.estimatedReserves,
      accumulatedInvestment: b.accumulatedInvestment,
      plannedInvestment: b.plannedInvestment,
      executionRate: b.executionRate,
      riskScore: b.riskScore,
      complianceScore: b.complianceScore,
      areaKm2: b.areaKm2,
      fieldsCount: b.fields?.length ?? 0,
      contractType: b.contractInfo?.contractType,
      decretoLei: b.contractInfo?.decretoLei,
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Gere um sumário executivo narrativo para um relatório que inclui as secções: ${reportTypes.join(", ")}.\n\nDados dos ${blocks.length} blocos seleccionados:\n${JSON.stringify(blockSummaries, null, 2)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes. Adicione créditos ao workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ narrative: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Report narrative error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
