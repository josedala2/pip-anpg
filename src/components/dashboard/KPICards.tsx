import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "./AnimatedCounter";
import { getTotalProduction, getTotalReserves, getActiveBlocks, getTotalCapex, getAvgExecutionRate } from "@/data/angolaBlocks";
import { Activity, BarChart3, Boxes, DollarSign, TrendingUp } from "lucide-react";

const kpis = [
  {
    label: "Total Production",
    value: getTotalProduction(),
    suffix: " BOPD",
    icon: Activity,
    color: "text-primary",
  },
  {
    label: "Estimated Reserves",
    value: getTotalReserves(),
    suffix: " Mb",
    icon: BarChart3,
    color: "text-success",
  },
  {
    label: "Active Blocks",
    value: getActiveBlocks(),
    suffix: "",
    icon: Boxes,
    color: "text-warning",
  },
  {
    label: "CAPEX In Progress",
    value: getTotalCapex(),
    prefix: "$",
    suffix: "M",
    icon: DollarSign,
    color: "text-primary",
  },
  {
    label: "Execution Rate",
    value: getAvgExecutionRate(),
    suffix: "%",
    icon: TrendingUp,
    color: "text-success",
  },
];

export const KPICards = ({ compact = false }: { compact?: boolean }) => (
  <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 2xl:gap-5 3xl:gap-6"}>
    {kpis.map((kpi, i) => (
      <Card key={kpi.label} className="glass-card glow-primary overflow-hidden animate-counter-up" style={{ animationDelay: `${i * 100}ms` }}>
        <CardContent className={compact ? "p-2.5" : "p-4 md:p-5 2xl:p-6 3xl:p-8"}>
          <div className="flex items-center gap-1.5 mb-1 2xl:mb-2 3xl:mb-3">
            <kpi.icon className={`w-3.5 h-3.5 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 ${kpi.color}`} />
            <span className={`text-muted-foreground uppercase tracking-wider font-medium ${compact ? "text-[9px]" : "text-xs 2xl:text-sm 3xl:text-base"}`}>{kpi.label}</span>
          </div>
          <AnimatedCounter
            target={kpi.value}
            prefix={kpi.prefix || ""}
            suffix={kpi.suffix}
            className={`font-bold ${kpi.color} ${compact ? "text-lg" : "text-2xl md:text-3xl 2xl:text-4xl 3xl:text-5xl"}`}
          />
        </CardContent>
      </Card>
    ))}
  </div>
);
