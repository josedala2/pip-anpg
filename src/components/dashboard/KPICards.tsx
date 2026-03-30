import { ExecutiveKPICard, type SemaphoreStatus } from "./ExecutiveKPICard";
import { oilBlocks } from "@/data/angolaBlocks";
import { homologacoesData } from "@/data/homologacoesData";
import { nationalCertifiedMetrics } from "@/data/nationalForecast";
import { Activity, BarChart3, Boxes, DollarSign, Landmark, Pickaxe, Search, Wrench, FileText, CheckCircle, Droplets, Mountain, Flame } from "lucide-react";

const verified = oilBlocks.filter(b => !b.pendingRealData);
const criticalFacilities = () => verified.filter(b => b.facilityData && b.facilityData.overallEfficiency < 70).length;
const contractsExpiring = () => {
  const now = Date.now();
  return verified.filter(b => {
    if (!b.contractInfo?.productionPeriodEnd) return false;
    const months = Math.round((new Date(b.contractInfo.productionPeriodEnd).getTime() - now) / (1000 * 60 * 60 * 24 * 30));
    return months > 0 && months <= 24;
  }).length;
};

// Receita Estado estimada com produção nacional certificada
const estimatedStateRevenue = () => {
  return Math.round((nationalCertifiedMetrics.productionBOPD * 365 * 75 * 0.6) / 1e6);
};

// Homologações KPIs
const totalHomologado = () => Math.round(homologacoesData.reduce((s, h) => s + (h.montanteAprovado || 0), 0) / 1e6);
const taxaAprovacao = () => {
  const total = homologacoesData.length;
  if (total === 0) return 0;
  const aprovados = homologacoesData.filter(h => h.decisao === "Aprovado").length;
  return Math.round((aprovados / total) * 100);
};

// Monthly sparklines for homologações (last 6 months by mesNum desc)
const homologSpark = (() => {
  const byMonth = new Map<string, number>();
  homologacoesData.forEach(h => {
    const key = `${h.ano}-${h.mesNum}`;
    byMonth.set(key, (byMonth.get(key) || 0) + (h.montanteAprovado || 0));
  });
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => Math.round(v / 1e6));
})();

const aprovacaoSpark = (() => {
  const byMonth = new Map<string, { total: number; approved: number }>();
  homologacoesData.forEach(h => {
    const key = `${h.ano}-${h.mesNum}`;
    const entry = byMonth.get(key) || { total: 0, approved: 0 };
    entry.total++;
    if (h.decisao === "Aprovado") entry.approved++;
    byMonth.set(key, entry);
  });
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => Math.round((v.approved / v.total) * 100));
})();

const getStatus = (label: string, value: number): SemaphoreStatus => {
  if (label === "Instalações Críticas") return value > 0 ? "critical" : "healthy";
  if (label === "Contratos a Expirar") return value > 3 ? "warning" : value > 0 ? "warning" : "healthy";
  if (label === "Taxa Aprovação") return value < 50 ? "critical" : value < 70 ? "warning" : "healthy";
  return "neutral";
};

const n = nationalCertifiedMetrics;

type KPIItem = { label: string; value: number; prefix?: string; suffix?: string; icon: any; status: SemaphoreStatus; sparkline?: number[]; drill: string };

const kpiGroups: { title: string; items: KPIItem[] }[] = [
  {
    title: "Produção",
    items: [
      { label: "Produção Nacional", value: n.productionBOPD, suffix: " BOPD", icon: Activity, status: "neutral", drill: "Produção média nacional certificada — Relatório Estado das Concessões 2026" },
      { label: "Quota ANPG", value: n.anpgQuotaBOPD, suffix: " BOPD", icon: Droplets, status: "neutral", drill: "Quota de produção atribuída à ANPG" },
      { label: "Produção Gás", value: n.gasProductionMMSCFD, suffix: " MMSCFD", icon: Flame, status: "neutral", drill: "Produção nacional de gás natural — Relatório Estado das Concessões 2026 (2.756 MMSCFD)" },
    ],
  },
  {
    title: "Reservas & Recursos",
    items: [
      { label: "Reservas Certificadas", value: n.reservesOilMb, suffix: ` Mb  ·  Gás: ${n.reservesGasTCF} TCF`, icon: BarChart3, status: "neutral", drill: "Reservas provadas de óleo e gás — dados certificados" },
      { label: "Recursos Prospectivos", value: n.prospectiveResourcesOilMb, suffix: ` Mb  ·  Gás: ${n.prospectiveResourcesGasTCF} TCF`, icon: Mountain, status: "neutral", drill: "Recursos prospectivos nacionais estimados de óleo e gás — Relatório 2026" },
    ],
  },
  {
    title: "Concessões",
    items: [
      { label: "Concessões Activas", value: n.activeConcessions, suffix: ` / ${n.totalAdjudicated}`, icon: Boxes, status: "neutral", drill: "Concessões activas de um total de 67 adjudicadas" },
      { label: "Blocos em Produção", value: n.inProduction, suffix: "", icon: Pickaxe, status: "healthy", drill: "Blocos com produção de hidrocarbonetos activa" },
      { label: "Em Exploração", value: n.inExploration, suffix: "", icon: Search, status: "neutral", drill: "Blocos em fase de exploração" },
      { label: "Em Aprovação", value: n.pendingApproval, suffix: "", icon: Boxes, status: "neutral", drill: "Blocos em fase de aprovação / licitação" },
    ],
  },
  {
    title: "Operacionais",
    items: [
      { label: "Instalações Críticas", value: criticalFacilities(), suffix: "", icon: Wrench, status: getStatus("Instalações Críticas", criticalFacilities()), drill: "Instalações com eficiência < 70% (blocos verificados)" },
      { label: "Contratos a Expirar", value: contractsExpiring(), suffix: "", icon: DollarSign, status: getStatus("Contratos a Expirar", contractsExpiring()), drill: "Contratos com vencimento em < 24 meses (blocos verificados)" },
    ],
  },
  {
    title: "Financeiros",
    items: [
      { label: "Receita Estado", value: estimatedStateRevenue(), prefix: "$", suffix: "M", icon: Landmark, status: "neutral", drill: "Estimativa anual de receita fiscal petrolífera (base: produção nacional)" },
      { label: "Total Homologado", value: totalHomologado(), prefix: "$", suffix: "M", icon: FileText, status: "neutral", drill: "Soma dos montantes aprovados em processos de homologação" },
      { label: "Taxa Aprovação", value: taxaAprovacao(), suffix: "%", icon: CheckCircle, sparkline: aprovacaoSpark, status: getStatus("Taxa Aprovação", taxaAprovacao()), drill: "Percentagem de processos de homologação aprovados" },
    ],
  },
];

export const KPICards = ({ compact = false }: { compact?: boolean }) => {
  let globalIndex = 0;

  if (compact) {
    const allKpis = kpiGroups.flatMap(g => g.items);
    return (
      <div className="grid grid-cols-2 gap-2">
        {allKpis.map((kpi, i) => (
          <ExecutiveKPICard key={kpi.label} label={kpi.label} value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} icon={kpi.icon} status={kpi.status} sparklineData={kpi.sparkline} drillDownInfo={kpi.drill} delay={i * 60} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {kpiGroups.map((group, gi) => (
        <div key={group.title}>
          {gi > 0 && <div className="border-t border-border/30 mb-3" />}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{group.title}</span>
            <div className="flex-1 h-px bg-border/20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 md:gap-3">
            {group.items.map((kpi) => {
              const idx = globalIndex++;
              return (
                <ExecutiveKPICard key={kpi.label} label={kpi.label} value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} icon={kpi.icon} status={kpi.status} sparklineData={kpi.sparkline} drillDownInfo={kpi.drill} delay={idx * 60} />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
