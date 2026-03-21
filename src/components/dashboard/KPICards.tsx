import { ExecutiveKPICard, type SemaphoreStatus } from "./ExecutiveKPICard";
import { getTotalProduction, getTotalReserves, getActiveBlocks, getTotalCapex, getAvgExecutionRate, oilBlocks, getBlocksByPhase } from "@/data/angolaBlocks";
import { homologacoesData } from "@/data/homologacoesData";
import { Activity, BarChart3, Boxes, DollarSign, Landmark, Pickaxe, Search, Wrench, FileText, CheckCircle } from "lucide-react";

const blocksInProduction = () => getBlocksByPhase("Production").length;
const blocksInExploration = () => getBlocksByPhase("Exploration").length;
const blocksInBidding = () => getBlocksByPhase("Bidding").length;
const blocksNoProduction = () => oilBlocks.filter(b => b.phase !== "Bidding" && b.dailyProduction === 0).length;
const blocksCriticalRisk = () => oilBlocks.filter(b => b.riskScore >= 7).length;
const criticalFacilities = () => oilBlocks.filter(b => b.facilityData && b.facilityData.overallEfficiency < 70).length;
const estimatedStateRevenue = () => {
  const totalBOPD = getTotalProduction();
  return Math.round((totalBOPD * 365 * 75 * 0.6) / 1e6);
};
const contractsExpiring = () => {
  const now = Date.now();
  return oilBlocks.filter(b => {
    if (!b.contractInfo?.productionPeriodEnd) return false;
    const months = Math.round((new Date(b.contractInfo.productionPeriodEnd).getTime() - now) / (1000 * 60 * 60 * 24 * 30));
    return months > 0 && months <= 24;
  }).length;
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

const kpis = [
  { label: "Produção Nacional", value: getTotalProduction(), suffix: " BOPD", icon: Activity, status: "neutral" as SemaphoreStatus, drill: "Produção agregada de todos os blocos activos" },
  { label: "Reservas Estimadas", value: getTotalReserves(), suffix: " Mb", icon: BarChart3, status: "neutral" as SemaphoreStatus, drill: "Soma de reservas P1+P2 de todas as concessões" },
  { label: "Concessões Activas", value: getActiveBlocks(), suffix: ` / ${oilBlocks.length}`, icon: Boxes, status: "neutral" as SemaphoreStatus, drill: "Concessões activas vs total adjudicado" },
  { label: "Blocos em Produção", value: blocksInProduction(), suffix: "", icon: Pickaxe, status: "healthy" as SemaphoreStatus, drill: "Blocos com produção de hidrocarbonetos activa" },
  { label: "Em Exploração", value: blocksInExploration(), suffix: "", icon: Search, status: "neutral" as SemaphoreStatus, drill: "Blocos em fase de exploração pura" },
  { label: "Em Aprovação", value: blocksInBidding(), suffix: "", icon: Boxes, status: "neutral" as SemaphoreStatus, drill: "Blocos em fase de aprovação / licitação" },
  { label: "Instalações Críticas", value: criticalFacilities(), suffix: "", icon: Wrench, status: getStatus("Instalações Críticas", criticalFacilities()), drill: "Instalações com eficiência < 70%" },
  { label: "Receita Estado", value: estimatedStateRevenue(), prefix: "$", suffix: "M", icon: Landmark, status: "neutral" as SemaphoreStatus, drill: "Estimativa anual de receita fiscal petrolífera" },
  { label: "Contratos a Expirar", value: contractsExpiring(), suffix: "", icon: DollarSign, status: getStatus("Contratos a Expirar", contractsExpiring()), drill: "Contratos com vencimento em < 24 meses" },
  { label: "Total Homologado", value: totalHomologado(), prefix: "$", suffix: "M", icon: FileText, sparkline: homologSpark, status: "neutral" as SemaphoreStatus, drill: "Soma dos montantes aprovados em processos de homologação" },
  { label: "Taxa Aprovação", value: taxaAprovacao(), suffix: "%", icon: CheckCircle, sparkline: aprovacaoSpark, status: getStatus("Taxa Aprovação", taxaAprovacao()), drill: "Percentagem de processos de homologação aprovados" },
];

export const KPICards = ({ compact = false }: { compact?: boolean }) => (
  <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 md:grid-cols-6 gap-2.5 md:gap-3"}>
    {kpis.map((kpi, i) => (
      <ExecutiveKPICard
        key={kpi.label}
        label={kpi.label}
        value={kpi.value}
        prefix={kpi.prefix}
        suffix={kpi.suffix}
        icon={kpi.icon}
        status={kpi.status}
        sparklineData={kpi.sparkline}
        drillDownInfo={kpi.drill}
        delay={i * 60}
      />
    ))}
  </div>
);
