import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Bot, User, Loader2, Sparkles, Trash2, Plus, MessageSquare, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { oilBlocks } from "@/data/angolaBlocks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

type Message = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; created_at: string };

const QUICK_SUGGESTIONS = [
  "Qual bloco tem a maior produção diária?",
  "Resumo económico do Bloco 0",
  "Compara a produção dos blocos 14, 15 e 17",
  "Quais blocos estão em fase de exploração?",
  "Qual o risco operacional mais elevado?",
  "Quais operadores actuam em Angola?",
  "Dados de abandono do Bloco 0",
  "Top 5 blocos por reservas estimadas",
];

// Compact index: ~2 lines per block for portfolio-level queries
function buildPortfolioIndex(): string {
  return `## PORTFÓLIO ANGOLA — ${oilBlocks.length} Concessões\n\n` +
    `| Bloco | Operador | Fase | Produção (BOPD) | Reservas (MMBO) | Risco | Compliance |\n` +
    `|-------|---------|------|----------------|----------------|-------|------------|\n` +
    oilBlocks.map(b =>
      `| ${b.name} | ${b.operator} | ${b.phase} | ${b.dailyProduction.toLocaleString()} | ${b.estimatedReserves} | ${b.riskScore}/10 | ${b.complianceScore}% |`
    ).join("\n");
}

// Detailed data for a single block
function buildBlockDetail(b: typeof oilBlocks[0]): string {
  const parts = [
    `## ${b.name}`,
    `Operador: ${b.operator} | Parceiros: ${b.partners.join(", ")}`,
    `Bacia: ${b.basin} | Fase: ${b.phase} | Profundidade: ${b.waterDepth}`,
    `Produção diária: ${b.dailyProduction.toLocaleString()} BOPD`,
    `Reservas estimadas: ${b.estimatedReserves} MMBO`,
    `Investimento acumulado: ${b.accumulatedInvestment} MMUSD | Planeado: ${b.plannedInvestment} MMUSD`,
    `Taxa execução: ${b.executionRate}% | Risco: ${b.riskScore}/10 | Compliance: ${b.complianceScore}%`,
    `Data contrato: ${b.contractDate}`,
  ];
  if (b.areaKm2) parts.push(`Área: ${b.areaKm2} km²`);
  if (b.waterDepthRange) parts.push(`Intervalo de profundidade: ${b.waterDepthRange}`);
  if (b.concession?.length) {
    parts.push(`Consórcio: ${b.concession.map(c => `${c.name} ${c.share}%${c.isOperator ? " (Op)" : ""}`).join(", ")}`);
  }
  if (b.fields?.length) {
    parts.push(`Campos: ${b.fields.map(f => `${f.name} (${f.status})${f.peakProduction ? ` pico ${f.peakProduction} BOPD` : ""}${f.discoveryYear ? ` desc. ${f.discoveryYear}` : ""}`).join(", ")}`);
  }

  // Economic data — cost history
  if (b.economicData?.costHistory?.length) {
    parts.push(`Custos: ${b.economicData.costHistory.map(c => `${c.period}: CAPEX ${c.capex} / OPEX ${c.opex} MMUSD`).join("; ")}`);
  }
  if (b.economicData?.opexPerBarrel) {
    parts.push(`Opex/barril: ${b.economicData.opexPerBarrel} USD/BO (${b.economicData.opexPerBarrelYear})`);
  }
  if (b.economicData?.sonangolDebt) {
    parts.push(`Dívida Sonangol: ${b.economicData.sonangolDebt} MMUSD`);
  }
  if (b.economicData?.stateRevenueShare?.length) {
    parts.push(`Receita Estado: ${b.economicData.stateRevenueShare.map(r => `${r.period}: ${r.percentage}%`).join("; ")}`);
  }
  if (b.economicData?.observations?.length) {
    parts.push(`Observações económicas: ${b.economicData.observations.join("; ")}`);
  }

  // Investment plan
  if (b.economicData?.investmentPlan?.length) {
    parts.push(`### Plano de Investimentos (MMUSD)`);
    parts.push(`| Ano | Exploração | Desenvolvimento | Operação | Admin | Cash Call | Total |`);
    parts.push(`|-----|-----------|----------------|----------|-------|----------|-------|`);
    b.economicData.investmentPlan.forEach(ip => {
      parts.push(`| ${ip.year} | ${ip.exploracao} | ${ip.desenvolvimento} | ${ip.operacao} | ${ip.adminServicos ?? "-"} | ${ip.cashCallSonangol ?? "-"} | ${ip.total} |`);
    });
  }

  // Production share GE
  if (b.economicData?.productionShareGE?.length) {
    parts.push(`Partilha produção GE: ${b.economicData.productionShareGE.map(p => `${p.year}: ${p.mmbo} MMBO`).join("; ")}`);
  }

  // Abandonment
  if (b.economicData?.abandonment) {
    const ab = b.economicData.abandonment;
    parts.push(`Abandono: Total ${ab.total} | Necessário ${ab.fundingRequired} | Depositado ${ab.fundingDeposited} MMUSD`);
  }

  // Economic Vision — NPV
  if (b.economicVision?.npvFullcycle?.length) {
    parts.push(`NPV Full-Cycle: ${b.economicVision.npvFullcycle.map(n => `${n.label}: ${n.valueMM} MMUSD (${n.percentage}%)`).join("; ")}`);
  }
  if (b.economicVision?.npvPointForward?.length) {
    parts.push(`NPV Point-Forward: ${b.economicVision.npvPointForward.map(n => `${n.label}: ${n.valueMM} MMUSD (${n.percentage}%)`).join("; ")}`);
  }
  if (b.economicVision?.npvByPeriod?.length) {
    parts.push(`NPV por período: ${b.economicVision.npvByPeriod.map(n => `${n.period}: GE ${n.ge}${n.conc != null ? ` / Conc ${n.conc}` : ""} / Imp ${n.impostos} MMUSD`).join("; ")}`);
  }

  // Cash flow time series
  if (b.economicVision?.cashFlowTimeSeries?.length) {
    const hasConc = b.economicVision.cashFlowTimeSeries.some(cf => cf.conc != null);
    parts.push(`### Fluxo de Caixa Anual (MMUSD)`);
    parts.push(hasConc ? `| Ano | GE | Conc. | Impostos |` : `| Ano | GE | Impostos |`);
    parts.push(hasConc ? `|-----|-----|-------|----------|` : `|-----|-----|----------|`);
    b.economicVision.cashFlowTimeSeries.forEach(cf => {
      parts.push(hasConc ? `| ${cf.year} | ${cf.ge} | ${cf.conc ?? 0} | ${cf.impostos} |` : `| ${cf.year} | ${cf.ge} | ${cf.impostos} |`);
    });
  }

  // Cash flow notes
  if (b.economicVision?.cashFlowNotes?.length) {
    parts.push(`Notas fluxo de caixa: ${b.economicVision.cashFlowNotes.join("; ")}`);
  }

  // Revenue share
  if (b.economicVision?.revenueShare?.length) {
    parts.push(`### Partilha de Receitas`);
    b.economicVision.revenueShare.forEach(r => {
      parts.push(`${r.period}: GE ${r.gePercent}% (${r.geMMBO} MMBO${r.geMMUSD ? ` / ${r.geMMUSD} MMUSD` : ""}) | Imp ${r.impostosPercent}% (${r.impostosMMBO} MMBO${r.impostosMMUSD ? ` / ${r.impostosMMUSD} MMUSD` : ""})`);
    });
  }

  // Abandonment detail (economic vision)
  if (b.economicVision?.abandonmentDetail) {
    const a = b.economicVision.abandonmentDetail;
    parts.push(`Abandono detalhado: Total ${a.total} | Pontual ${a.pontual} | Fundeamento ${a.fundeamento} | Fundeado ${a.fundeado} | Dívida Sonangol ${a.dividaSonangol} MMUSD`);
  }

  // Technical cost
  if (b.economicVision?.technicalCost) {
    const tc = b.economicVision.technicalCost;
    parts.push(`Custo técnico: CAPEX/bbl ${tc.capexPerBarrel} | OPEX/bbl ${tc.opexPerBarrel} USD | OPEX 2025: ${tc.opex2025} MMUSD`);
  }

  // Strategic observations
  if (b.economicVision?.strategicObservations?.length) {
    parts.push(`Observações estratégicas: ${b.economicVision.strategicObservations.join("; ")}`);
  }

  // Exploration summary
  if (b.explorationSummary) {
    const es = b.explorationSummary;
    const esParts: string[] = [];
    if (es.totalSeismic2DKm) esParts.push(`Sísmica 2D: ${es.totalSeismic2DKm} km`);
    if (es.totalSeismic3DKm2) esParts.push(`Sísmica 3D: ${es.totalSeismic3DKm2} km²`);
    if (es.totalSeismic4DKm2) esParts.push(`Sísmica 4D: ${es.totalSeismic4DKm2} km²`);
    if (es.totalWellsPesquisa) esParts.push(`Poços pesquisa: ${es.totalWellsPesquisa}`);
    if (es.totalWellsAvaliacao) esParts.push(`Poços avaliação: ${es.totalWellsAvaliacao}`);
    if (es.commercialDiscoveries) esParts.push(`Descobertas comerciais: ${es.commercialDiscoveries}`);
    if (es.dryWells) esParts.push(`Poços secos: ${es.dryWells}`);
    if (es.geologicalSuccessRate) esParts.push(`Taxa sucesso geológico: ${es.geologicalSuccessRate}%`);
    if (es.stooipMMBO) esParts.push(`STOOIP: ${es.stooipMMBO} MMBO`);
    if (es.explorationCostsUSD) esParts.push(`Custos exploração: ${es.explorationCostsUSD} MMUSD`);
    if (es.complexity?.length) esParts.push(`Complexidade: ${es.complexity.join(", ")}`);
    if (es.geologicalTargets) esParts.push(`Alvos geológicos: ${es.geologicalTargets}`);
    if (esParts.length) parts.push(`Exploração: ${esParts.join(" | ")}`);
  }

  // Prospects
  if (b.prospects?.length) {
    parts.push(`### Prospectos Exploratórios`);
    parts.push(`| Área | Nome | Reservatório | Recursos (MMBO) | BCF | POS (%) |`);
    parts.push(`|------|------|-------------|----------------|-----|---------|`);
    b.prospects.forEach(p => {
      parts.push(`| ${p.discoveryArea} | ${p.name} | ${p.reservoir} | ${p.resourcesMMBO} | ${p.resourcesBCF ?? "-"} | ${p.pos} |`);
    });
  }

  // HSE data
  if (b.hseData?.length) {
    parts.push(`### Indicadores HSE`);
    parts.push(`| Ano | FAT | LTI | RWC | MTC | FAC | NMI | HHR(M) | TRIR | LTIR |`);
    parts.push(`|-----|-----|-----|-----|-----|-----|-----|--------|------|------|`);
    b.hseData.forEach(h => {
      parts.push(`| ${h.year} | ${h.fat} | ${h.lti} | ${h.rwc} | ${h.mtc} | ${h.fac} | ${h.nmi} | ${h.hhr} | ${h.trir} | ${h.ltir} |`);
    });
  }

  // Environmental data
  if (b.environmentalData?.length) {
    parts.push(`### Dados Ambientais`);
    b.environmentalData.forEach(e => {
      const envParts: string[] = [`Ano ${e.year}`];
      if (e.oilSpillCount !== undefined) envParts.push(`Derrames: ${e.oilSpillCount} (${e.oilSpillVolumeBbl ?? 0} bbl)`);
      if (e.co2EmissionsTonCO2eq !== undefined) envParts.push(`CO2: ${e.co2EmissionsTonCO2eq} tCO2eq`);
      if (e.gasFlaredMMSCFD !== undefined) envParts.push(`Gás queimado: ${e.gasFlaredMMSCFD} MMSCFD${e.gasFlaredTarget ? ` (meta: ${e.gasFlaredTarget})` : ""}`);
      if (e.oilInWaterPPM !== undefined) envParts.push(`Óleo na água: ${e.oilInWaterPPM} PPM`);
      parts.push(envParts.join(" | "));
    });
  }

  // Facilities
  if (b.facilityData) {
    const fd = b.facilityData;
    const facParts: string[] = [];
    if (fd.capacityBOPD) facParts.push(`Capacidade: ${fd.capacityBOPD.toLocaleString()} BOPD`);
    if (fd.overallEfficiency) facParts.push(`Eficiência: ${fd.overallEfficiency}%`);
    if (fd.activeWells) facParts.push(`Poços activos: ${fd.activeWells.op} produtores / ${fd.activeWells.wi} injectores água / ${fd.activeWells.gi} injectores gás`);
    if (fd.productionStartYear) facParts.push(`Início produção: ${fd.productionStartYear}`);
    if (fd.endOfLifeYear) facParts.push(`Fim de vida: ${fd.endOfLifeYear}`);
    if (fd.cumulativeProductionBO) facParts.push(`Produção acumulada: ${fd.cumulativeProductionBO.toLocaleString()} BO`);
    if (facParts.length) parts.push(`Instalações: ${facParts.join(" | ")}`);

    if (fd.platformSpecs?.length) {
      parts.push(`Plataformas: ${fd.platformSpecs.map(p => `${p.name} (${p.type}, ${p.status}${p.capacity ? `, cap. ${p.capacity}` : ""})`).join("; ")}`);
    }
    if (fd.areas?.length) {
      parts.push(`Áreas operacionais: ${fd.areas.map(a => `${a.name}: efic. ${a.efficiency}%${a.issues?.length ? ` — issues: ${a.issues.join(", ")}` : ""}`).join("; ")}`);
    }
  }

  // Maintenance plan
  if (b.facilityData?.maintenancePlan?.length) {
    parts.push(`### Plano de Manutenção`);
    parts.push(`| Período | Escopo | Status |`);
    parts.push(`|---------|--------|--------|`);
    b.facilityData.maintenancePlan.forEach(m => {
      parts.push(`| ${m.period} | ${m.scope} | ${m.status} |`);
    });
  }

  // Production history — last 6 months + average
  if (b.productionHistory?.length) {
    const hist = b.productionHistory;
    const last6 = hist.slice(-6);
    const avg = Math.round(hist.reduce((s, h) => s + h.value, 0) / hist.length);
    parts.push(`### Histórico de Produção (últimos 6 meses)`);
    parts.push(`Média anual: ${avg.toLocaleString()} BOPD`);
    parts.push(last6.map(h => `${h.month}: ${h.value.toLocaleString()} BOPD`).join(" | "));
  }

  // CAPEX history
  if (b.capexHistory?.length) {
    parts.push(`### Histórico CAPEX (MMUSD)`);
    parts.push(`| Ano | Planeado | Real |`);
    parts.push(`|-----|---------|------|`);
    b.capexHistory.forEach(c => {
      parts.push(`| ${c.year} | ${c.planned} | ${c.actual} |`);
    });
  }

  // Projections
  if (b.projections) {
    const p = b.projections;
    parts.push(`### Projecções de Produção (BOPD, 10 anos)`);
    parts.push(`Conservador: ${p.conservative.map(v => v.toLocaleString()).join(", ")}`);
    parts.push(`Base: ${p.base.map(v => v.toLocaleString()).join(", ")}`);
    parts.push(`Expansão: ${p.expansion.map(v => v.toLocaleString()).join(", ")}`);
  }

  // Seismic data
  if (b.seismicData?.length) {
    parts.push(`### Dados Sísmicos`);
    parts.push(`| Ano | 2D (km) | 3D (km²) | 4D (km²) |`);
    parts.push(`|-----|---------|----------|----------|`);
    b.seismicData.forEach(s => {
      parts.push(`| ${s.year} | ${s.seismic2D} | ${s.seismic3D} | ${s.seismic4D} |`);
    });
  }

  // Wells data
  if (b.wellsData?.length) {
    parts.push(`### Dados de Poços`);
    parts.push(`| Ano | Pesquisa | Avaliação | Desc. Comercial | Desc. Não-Comercial | Seco |`);
    parts.push(`|-----|---------|----------|----------------|--------------------|----|`);
    b.wellsData.forEach(w => {
      parts.push(`| ${w.year} | ${w.pesquisa} | ${w.avaliacao} | ${w.descobertaComercial ?? "-"} | ${w.descobertaNaoComercial ?? "-"} | ${w.seco ?? "-"} |`);
    });
  }

  // Geological objectives
  if (b.geologicalObjectives?.length) {
    parts.push(`Objectivos geológicos: ${b.geologicalObjectives.join("; ")}`);
  }

  // Legislation documents
  if (b.legislationDocs?.length) {
    parts.push(`### Legislação`);
    b.legislationDocs.forEach(d => {
      parts.push(`- ${d.title} (${d.type}${d.reference ? `, ref: ${d.reference}` : ""}${d.date ? `, ${d.date}` : ""}${d.description ? ` — ${d.description}` : ""})`);
    });
  }

  // Contract info (expanded)
  if (b.contractInfo) {
    const ci = b.contractInfo;
    const ciParts: string[] = [];
    if (ci.decretoLei) ciParts.push(`Decreto: ${ci.decretoLei}`);
    if (ci.contractType) ciParts.push(`Tipo: ${ci.contractType}`);
    if (ci.signingDate) ciParts.push(`Assinatura: ${ci.signingDate}`);
    if (ci.effectiveDate) ciParts.push(`Efectivo: ${ci.effectiveDate}`);
    if (ci.location) ciParts.push(`Localização: ${ci.location}`);
    if (ci.signatureBonus) ciParts.push(`Bónus assinatura: ${ci.signatureBonus} MMUSD`);
    if (ci.socialBonus) ciParts.push(`Bónus social: ${ci.socialBonus} MMUSD`);
    if (ci.socialProjects) ciParts.push(`Projectos sociais: ${ci.socialProjects} MMUSD${ci.socialProjectsPeriod ? ` (${ci.socialProjectsPeriod})` : ""}`);
    if (ci.regulatoryContribution) ciParts.push(`Contribuição regulatória: ${ci.regulatoryContribution} MMUSD${ci.regulatoryContributionPeriod ? ` (${ci.regulatoryContributionPeriod})` : ""}`);
    if (ci.productionBonus) ciParts.push(`Bónus produção: ${ci.productionBonus} MMUSD`);
    if (ci.productionPeriodStart) ciParts.push(`Período produção: ${ci.productionPeriodStart}–${ci.productionPeriodEnd ?? "?"}`);
    if (ci.fiscalConditions) {
      const fc = ci.fiscalConditions;
      if (fc.irp) ciParts.push(`IRP: ${fc.irp}%`);
      if (fc.ipp) ciParts.push(`IPP: ${fc.ipp}%`);
      if (fc.itp) ciParts.push(`ITP: ${fc.itp}%`);
      if (fc.costRecoveryPreProd) ciParts.push(`Cost Recovery pré-prod: ${fc.costRecoveryPreProd}%`);
      if (fc.costRecoveryPostProd) ciParts.push(`Cost Recovery pós-prod: ${fc.costRecoveryPostProd}%`);
      if (fc.productionPremium) ciParts.push(`Prémio produção: ${fc.productionPremium} USD/bbl`);
    }
    if (ci.researchPeriod) {
      const rp = ci.researchPeriod;
      if (rp.initialPhaseYears) ciParts.push(`Fase inicial: ${rp.initialPhaseYears} anos, ${rp.initialPhaseWells ?? "?"} poços`);
      if (rp.subsequentPhaseYears) ciParts.push(`Fase subsequente: ${rp.subsequentPhaseYears} anos, ${rp.subsequentPhaseWells ?? "?"} poços`);
    }
    if (ciParts.length) parts.push(`Contrato: ${ciParts.join(" | ")}`);
    if (ci.initialConsortium?.length) {
      parts.push(`Consórcio inicial: ${ci.initialConsortium.map(c => `${c.name} ${c.share}%${c.isOperator ? " (Op)" : ""}`).join(", ")}`);
    }
    if (ci.historicalNotes?.length) parts.push(`Notas históricas: ${ci.historicalNotes.join("; ")}`);
  }

  // Revitalization scenarios
  if (b.revitalizationScenarios?.length) {
    parts.push(`### Cenários de Revitalização`);
    b.revitalizationScenarios.forEach(s => {
      parts.push(`**${s.title}**: ${s.description}`);
      if (s.proposals?.length) parts.push(`Propostas: ${s.proposals.join("; ")}`);
      if (s.incentives?.length) parts.push(`Incentivos: ${s.incentives.join("; ")}`);
      if (s.commitments?.length) parts.push(`Compromissos: ${s.commitments.join("; ")}`);
    });
  }

  return parts.join("\n");
}

// Detect which blocks the user is asking about
function detectMentionedBlocks(query: string): typeof oilBlocks {
  const q = query.toLowerCase();
  
  // Check for portfolio-wide queries
  const portfolioKeywords = ["todos", "portfólio", "portfolio", "angola", "ranking", "top", "maior", "menor", "total", "quantos", "quantas", "concessões", "concessoes"];
  if (portfolioKeywords.some(k => q.includes(k))) {
    return oilBlocks; // Return all for portfolio queries but we'll use index only
  }
  
  const matched: typeof oilBlocks = [];
  for (const b of oilBlocks) {
    const blockNum = b.id.replace("block-", "").replace("kn-", "").replace("fs-", "");
    const nameLC = b.name.toLowerCase();
    // Match "bloco 0", "block 0", "bloco 14", the full name, or operator
    if (
      q.includes(`bloco ${blockNum}`) ||
      q.includes(`block ${blockNum}`) ||
      q.includes(`bloco${blockNum}`) ||
      q.includes(nameLC) ||
      q.includes(b.operator.toLowerCase())
    ) {
      matched.push(b);
    }
  }
  return matched;
}

// Build smart context based on query
function buildSmartContext(query: string): string {
  const portfolioIndex = buildPortfolioIndex();
  const mentioned = detectMentionedBlocks(query);
  
  // If no specific blocks detected or it's a portfolio query, send index only
  if (mentioned.length === 0 || mentioned.length > 10) {
    return portfolioIndex;
  }
  
  // Send index + detailed data for mentioned blocks
  const details = mentioned.map(b => buildBlockDetail(b)).join("\n\n---\n\n");
  return `${portfolioIndex}\n\n---\n\n## DADOS DETALHADOS DOS BLOCOS CONSULTADOS\n\n${details}`;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/soba-chat`;

export function SobaChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string; cargo: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch user profile for personalisation
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, cargo")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setUserProfile(data);
      });
  }, [user]);

  const firstName = userProfile?.full_name?.split(" ")[0] || "";

  // Context is now built per-query in sendMessage

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
      }
    }, 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Load conversations list on mount
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoadingHistory(true);
      const { data } = await supabase
        .from("soba_conversations")
        .select("id, title, created_at")
        .order("updated_at", { ascending: false })
        .limit(20);
      if (data && data.length > 0) {
        setConversations(data);
        // Load most recent conversation
        await loadConversation(data[0].id);
      }
      setLoadingHistory(false);
    };
    load();
  }, [user]);

  const loadConversation = async (convId: string) => {
    setActiveConversationId(convId);
    const { data } = await supabase
      .from("soba_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
    }
  };

  const createConversation = async (title: string): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("soba_conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();
    if (error || !data) {
      console.error("Failed to create conversation:", error);
      return null;
    }
    const conv: Conversation = { id: data.id, title, created_at: new Date().toISOString() };
    setConversations(prev => [conv, ...prev]);
    setActiveConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    await supabase.from("soba_messages").insert({
      conversation_id: convId,
      role,
      content,
    });
  };

  const startNewConversation = () => {
    setMessages([]);
    setActiveConversationId(null);
  };

  const deleteConversation = async (convId: string) => {
    await supabase.from("soba_conversations").delete().eq("id", convId);
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConversationId === convId) {
      setMessages([]);
      setActiveConversationId(null);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Ensure we have a conversation
    let convId = activeConversationId;
    if (!convId) {
      const title = text.trim().slice(0, 60);
      convId = await createConversation(title);
      if (!convId) {
        toast.error("Erro ao criar conversa");
        setIsLoading(false);
        return;
      }
    }

    // Save user message
    await saveMessage(convId, "user", text.trim());

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          context: buildSmartContext(text.trim()),
          userName: userProfile?.full_name || "",
          userRole: userProfile?.cargo || "",
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        const errMsg = errData?.error || `Erro ${resp.status}`;
        toast.error(errMsg);
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No stream body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // flush remaining
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }

      // Save assistant response
      if (assistantSoFar && convId) {
        await saveMessage(convId, "assistant", assistantSoFar);
      }
    } catch (e) {
      console.error("Soba chat error:", e);
      toast.error("Falha na comunicação com o Soba. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] max-w-6xl mx-auto p-4 md:p-6 gap-4">
      {/* Sidebar — conversation history */}
      <div className="hidden md:flex flex-col w-56 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="mb-2 w-full justify-start gap-2"
          onClick={startNewConversation}
        >
          <Plus className="w-4 h-4" /> Nova conversa
        </Button>
        {/* Search toggle */}
        <div className="mb-2">
          {showSearch ? (
            <div className="flex items-center gap-1 border border-border/60 rounded-md bg-card px-2 py-1">
              <Search className="w-3 h-3 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar..."
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
              />
              <button onClick={() => { setSearchQuery(""); setShowSearch(false); }} className="p-0.5 rounded hover:bg-secondary">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary/50 transition-colors"
            >
              <Search className="w-3 h-3" /> Pesquisar conversas
            </button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 pr-2">
            {loadingHistory ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sem conversas</p>
            ) : (() => {
              const filtered = searchQuery.trim()
                ? conversations.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                : conversations;
              return filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum resultado</p>
              ) : (
                filtered.map((conv) => (
                <div key={conv.id} className="group flex items-center">
                  <button
                    onClick={() => loadConversation(conv.id)}
                    className={`flex-1 text-left px-2.5 py-2 rounded-md text-xs truncate transition-colors ${
                      activeConversationId === conv.id
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />
                    {conv.title}
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    title="Eliminar conversa"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
              );
            })()}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Soba — Assistente Inteligente</h2>
            <p className="text-xs text-muted-foreground">
              Pergunte sobre produção, economia, contratos, exploração de qualquer concessão
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground md:hidden"
              onClick={startNewConversation}
            >
              <Plus className="w-4 h-4 mr-1" /> Nova
            </Button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 pr-2 mb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                {firstName ? `Olá, ${firstName}! Sou o Soba 🇦🇴` : "Olá! Sou o Soba 🇦🇴"}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                O seu assistente da Plataforma de Inteligência e Análise Petrolífera. Posso ajudar com informações sobre todos os blocos petrolíferos de Angola.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left px-3 py-2.5 rounded-lg border border-border/60 bg-card hover:bg-accent/50 text-xs text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border/60"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_table]:border [&_table]:border-border/40 [&_table]:rounded-md [&_table]:overflow-hidden [&_th]:bg-muted/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_th]:border [&_th]:border-border/30 [&_td]:px-3 [&_td]:py-1.5 [&_td]:border [&_td]:border-border/20 [&_tr:nth-child(even)]:bg-muted/20 [&_tr:hover]:bg-muted/30">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-secondary flex items-center justify-center mt-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 items-end border border-border/60 rounded-xl bg-card p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte ao Soba sobre os blocos petrolíferos..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none px-2 py-1.5 max-h-24 overflow-y-auto"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="h-8 w-8 rounded-lg shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
