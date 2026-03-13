import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "./AnimatedCounter";
import { getTotalProduction, getTotalReserves, getActiveBlocks, getTotalCapex, getAvgExecutionRate, oilBlocks, getBlocksByPhase } from "@/data/angolaBlocks";
import { Activity, BarChart3, Boxes, DollarSign, TrendingUp, AlertTriangle, Landmark, ArrowUpRight, ArrowDownRight, Pickaxe, Search } from "lucide-react";

// Derived KPIs
const blocksInProduction = () => getBlocksByPhase("Production").length;
const blocksInExploration = () => getBlocksByPhase("Exploration").length;
const blocksNoProduction = () => oilBlocks.filter(b => b.dailyProduction === 0).length;
const blocksCriticalRisk = () => oilBlocks.filter(b => b.riskScore >= 7).length;
const estimatedStateRevenue = () => {
  // Simplified: sum production * 365 * $75/bbl * ~60% state take
  const totalBOPD = getTotalProduction();
  return Math.round((totalBOPD * 365 * 75 * 0.6) / 1e6); // MMUSD
};
// Simulated variations (would be real in production)
const prodVariationMoM = -2.1;
const prodVariationYoY = -4.8;

const primaryKpis = [
  {
    label: "Produção Total",
    value: getTotalProduction(),
    suffix: " BOPD",
    icon: Activity,
    color: "text-primary",
  },
  {
    label: "Reservas Estimadas",
    value: getTotalReserves(),
    suffix: " Mb",
    icon: BarChart3,
    color: "text-success",
  },
  {
    label: "Blocos Activos",
    value: getActiveBlocks(),
    suffix: "",
    icon: Boxes,
    color: "text-warning",
  },
  {
    label: "CAPEX em Curso",
    value: getTotalCapex(),
    prefix: "$",
    suffix: "M",
    icon: DollarSign,
    color: "text-primary",
  },
  {
    label: "Taxa de Execução",
    value: getAvgExecutionRate(),
    suffix: "%",
    icon: TrendingUp,
    color: "text-success",
  },
];

const secondaryKpis = [
  {
    label: "Em Produção",
    value: blocksInProduction(),
    suffix: "",
    icon: Pickaxe,
    color: "text-success",
  },
  {
    label: "Em Exploração",
    value: blocksInExploration(),
    suffix: "",
    icon: Search,
    color: "text-[hsl(var(--exploration))]",
  },
  {
    label: "Sem Produção",
    value: blocksNoProduction(),
    suffix: "",
    icon: Boxes,
    color: "text-muted-foreground",
  },
  {
    label: "Risco Crítico",
    value: blocksCriticalRisk(),
    suffix: "",
    icon: AlertTriangle,
    color: "text-danger",
  },
  {
    label: "Receita Estado",
    value: estimatedStateRevenue(),
    prefix: "$",
    suffix: "M",
    icon: Landmark,
    color: "text-primary",
  },
];

const VariationBadge = ({ value, label }: { value: number; label: string }) => (
  <div className="flex items-center gap-1">
    {value >= 0 ? (
      <ArrowUpRight className="w-3 h-3 text-success" />
    ) : (
      <ArrowDownRight className="w-3 h-3 text-danger" />
    )}
    <span className={`text-[10px] font-semibold ${value >= 0 ? "text-success" : "text-danger"}`}>
      {value > 0 ? "+" : ""}{value}%
    </span>
    <span className="text-[9px] text-muted-foreground">{label}</span>
  </div>
);

export const KPICards = ({ compact = false }: { compact?: boolean }) => (
  <div className="space-y-3">
    {/* Primary KPIs */}
    <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 2xl:gap-5 3xl:gap-6"}>
      {primaryKpis.map((kpi, i) => (
        <Card key={kpi.label} className="glass-card glow-primary overflow-hidden animate-counter-up" style={{ animationDelay: `${i * 100}ms` }}>
          <CardContent className={compact ? "p-2.5" : "p-4 md:p-5 2xl:p-6 3xl:p-8"}>
            <div className="flex items-center gap-1.5 mb-1 2xl:mb-2 3xl:mb-3">
              <kpi.icon className={`w-3.5 h-3.5 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 ${kpi.color}`} />
              <span className={`text-muted-foreground uppercase tracking-wider font-semibold ${compact ? "text-[10px]" : "text-xs 2xl:text-sm 3xl:text-base"}`}>{kpi.label}</span>
            </div>
            <AnimatedCounter
              target={kpi.value}
              prefix={kpi.prefix || ""}
              suffix={kpi.suffix}
              className={`font-bold ${kpi.color} ${compact ? "text-lg" : "text-2xl md:text-3xl 2xl:text-4xl 3xl:text-5xl"}`}
            />
            {/* Show variation badges on production card */}
            {kpi.label === "Produção Total" && !compact && (
              <div className="flex gap-3 mt-1.5">
                <VariationBadge value={prodVariationMoM} label="m/m" />
                <VariationBadge value={prodVariationYoY} label="a/a" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Secondary KPIs row */}
    {!compact && (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        {secondaryKpis.map((kpi, i) => (
          <Card key={kpi.label} className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden animate-counter-up" style={{ animationDelay: `${(i + 5) * 80}ms` }}>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <kpi.icon className={`w-3 h-3 2xl:w-4 2xl:h-4 ${kpi.color}`} />
                <span className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px] 2xl:text-xs">{kpi.label}</span>
              </div>
              <AnimatedCounter
                target={kpi.value}
                prefix={kpi.prefix || ""}
                suffix={kpi.suffix}
                className={`font-bold ${kpi.color} text-xl md:text-2xl 2xl:text-3xl`}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>
);
