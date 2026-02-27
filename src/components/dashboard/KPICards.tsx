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

export const KPICards = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
    {kpis.map((kpi, i) => (
      <Card key={kpi.label} className="glass-card glow-primary overflow-hidden animate-counter-up" style={{ animationDelay: `${i * 100}ms` }}>
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{kpi.label}</span>
          </div>
          <AnimatedCounter
            target={kpi.value}
            prefix={kpi.prefix || ""}
            suffix={kpi.suffix}
            className={`text-2xl md:text-3xl font-bold ${kpi.color}`}
          />
        </CardContent>
      </Card>
    ))}
  </div>
);
