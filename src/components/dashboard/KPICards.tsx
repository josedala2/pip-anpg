import { ExecutiveKPICard, type SemaphoreStatus } from "./ExecutiveKPICard";
import { getTotalProduction, getTotalReserves, getActiveBlocks, getTotalCapex, getAvgExecutionRate, oilBlocks, getBlocksByPhase } from "@/data/angolaBlocks";
import { Activity, BarChart3, Boxes, DollarSign, TrendingUp, AlertTriangle, Landmark, Pickaxe, Search, Wrench } from "lucide-react";

const blocksInProduction = () => getBlocksByPhase("Production").length;
const blocksInExploration = () => getBlocksByPhase("Exploration").length;
const blocksNoProduction = () => oilBlocks.filter(b => b.dailyProduction === 0).length;
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

// Simulated sparkline data (6 months)
const prodSpark = [1120, 1105, 1098, 1085, 1070, 1065];
const reservesSpark = [9200, 9180, 9150, 9120, 9100, 9080];

const getStatus = (label: string, value: number): SemaphoreStatus => {
  if (label === "Risco Crítico" || label === "Instalações Críticas") return value > 0 ? "critical" : "healthy";
  if (label === "Sem Produção") return value > 5 ? "warning" : "healthy";
  if (label === "Contratos a Expirar") return value > 3 ? "warning" : value > 0 ? "warning" : "healthy";
  return "neutral";
};

const kpis = [
  { label: "Produção Nacional", value: getTotalProduction(), suffix: " BOPD", icon: Activity, variation: -2.1, variationLabel: "m/m", sparkline: prodSpark, status: "neutral" as SemaphoreStatus, drill: "Produção agregada de todos os blocos activos" },
  { label: "Reservas Estimadas", value: getTotalReserves(), suffix: " Mb", icon: BarChart3, sparkline: reservesSpark, status: "neutral" as SemaphoreStatus, drill: "Soma de reservas P1+P2 de todas as concessões" },
  { label: "Variação Produção", value: -4.8, suffix: "%", icon: TrendingUp, status: "warning" as SemaphoreStatus, drill: "Variação anual da produção nacional" },
  { label: "Concessões Activas", value: getActiveBlocks(), suffix: "", icon: Boxes, status: "neutral" as SemaphoreStatus, drill: "Total de blocos com actividade operacional" },
  { label: "Blocos em Produção", value: blocksInProduction(), suffix: "", icon: Pickaxe, status: "healthy" as SemaphoreStatus, drill: "Blocos com produção de hidrocarbonetos activa" },
  { label: "Sem Produção", value: blocksNoProduction(), suffix: "", icon: Boxes, status: getStatus("Sem Produção", blocksNoProduction()), drill: "Blocos sem produção activa" },
  { label: "Risco Crítico", value: blocksCriticalRisk(), suffix: "", icon: AlertTriangle, status: getStatus("Risco Crítico", blocksCriticalRisk()), drill: "Blocos com score de risco ≥ 7" },
  { label: "Instalações Críticas", value: criticalFacilities(), suffix: "", icon: Wrench, status: getStatus("Instalações Críticas", criticalFacilities()), drill: "Instalações com eficiência < 70%" },
  { label: "Receita Estado", value: estimatedStateRevenue(), prefix: "$", suffix: "M", icon: Landmark, status: "neutral" as SemaphoreStatus, drill: "Estimativa anual de receita fiscal petrolífera" },
  { label: "Contratos a Expirar", value: contractsExpiring(), suffix: "", icon: DollarSign, status: getStatus("Contratos a Expirar", contractsExpiring()), drill: "Contratos com vencimento em < 24 meses" },
];

export const KPICards = ({ compact = false }: { compact?: boolean }) => (
  <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 md:grid-cols-5 gap-2.5 md:gap-3"}>
    {kpis.map((kpi, i) => (
      <ExecutiveKPICard
        key={kpi.label}
        label={kpi.label}
        value={kpi.value}
        prefix={kpi.prefix}
        suffix={kpi.suffix}
        icon={kpi.icon}
        variation={kpi.variation}
        variationLabel={kpi.variationLabel}
        status={kpi.status}
        sparklineData={kpi.sparkline}
        drillDownInfo={kpi.drill}
        delay={i * 60}
      />
    ))}
  </div>
);
