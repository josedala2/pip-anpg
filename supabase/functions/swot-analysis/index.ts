import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { block } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um analista sénior de petróleo e gás com especialização em blocos petrolíferos de Angola. 
Analise os dados do bloco fornecido e produza uma análise SWOT preditiva detalhada em Português.

Responda EXCLUSIVAMENTE com um JSON válido no seguinte formato (sem markdown, sem code blocks):
{
  "strengths": [{"title": "...", "description": "...", "impact": "high|medium|low"}],
  "weaknesses": [{"title": "...", "description": "...", "impact": "high|medium|low"}],
  "opportunities": [{"title": "...", "description": "...", "impact": "high|medium|low"}],
  "threats": [{"title": "...", "description": "...", "impact": "high|medium|low"}],
  "summary": "Resumo executivo da análise SWOT em 2-3 frases.",
  "recommendation": "Recomendação estratégica principal em 1-2 frases."
}

Para cada categoria, forneça 3-5 itens. Considere:
- Dados de produção, reservas, investimento, compliance e risco
- Composição do consórcio e capacidade do operador
- Dados sísmicos e exploratórios (poços, prospectos)
- Contexto geopolítico e regulatório de Angola
- Tendências do mercado global de O&G
- Profundidade da água e complexidade técnica
- Projecções de produção futuras`;

    const blockSummary = JSON.stringify({
      name: block.name,
      operator: block.operator,
      partners: block.partners,
      basin: block.basin,
      phase: block.phase,
      waterDepth: block.waterDepth,
      dailyProduction: block.dailyProduction,
      estimatedReserves: block.estimatedReserves,
      accumulatedInvestment: block.accumulatedInvestment,
      plannedInvestment: block.plannedInvestment,
      executionRate: block.executionRate,
      riskScore: block.riskScore,
      complianceScore: block.complianceScore,
      consortium: block.concession,
      areaKm2: block.areaKm2,
      waterDepthRange: block.waterDepthRange,
      fields: block.fields,
      geologicalObjectives: block.geologicalObjectives,
      prospectsCount: block.prospects?.length ?? 0,
      totalProspectResources: block.prospects?.reduce((s: number, p: any) => s + (p.resourcesMMBO || 0), 0) ?? 0,
      avgPOS: block.prospects?.length
        ? Math.round(block.prospects.reduce((s: number, p: any) => s + p.pos, 0) / block.prospects.length)
        : 0,
      seismicSurveys: block.seismicData?.length ?? 0,
      wellsDrilled: block.wellsData?.reduce((s: number, w: any) => s + w.pesquisa + w.avaliacao, 0) ?? 0,
      projections: block.projections,
    });

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
          { role: "user", content: `Analise o seguinte bloco petrolífero angolano:\n${blockSummary}` },
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
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), {
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

    // Parse the JSON from the AI response
    let swot;
    try {
      // Try to extract JSON from possible markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      swot = JSON.parse(jsonMatch[1].trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Erro ao processar resposta da IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(swot), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("SWOT analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
