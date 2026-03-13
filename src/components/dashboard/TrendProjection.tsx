import { useMemo } from "react";
import { oilBlocks } from "@/data/angolaBlocks";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

// Generate historical + projected production data
function generateTrendData() {
  // Aggregate historical monthly production from all blocks
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const totalCurrent = oilBlocks.reduce((s, b) => s + b.dailyProduction, 0);

  // Historical (simulated 12 months trailing)
  const historical = months.map((m, i) => {
    const factor = 1 + (11 - i) * 0.008 + Math.sin(i * 0.5) * 0.015;
    return {
      month: m,
      type: "Histórico",
      actual: Math.round(totalCurrent * factor),
      base: null as number | null,
      optimistic: null as number | null,
      conservative: null as number | null,
    };
  });

  // Projected (next 12 months)
  const projMonths = ["Jan'27", "Fev'27", "Mar'27", "Abr'27", "Mai'27", "Jun'27", "Jul'27", "Ago'27", "Set'27", "Out'27", "Nov'27", "Dez'27"];
  const projected = projMonths.map((m, i) => ({
    month: m,
    type: "Projecção",
    actual: null as number | null,
    base: Math.round(totalCurrent * (1 - i * 0.006)),
    optimistic: Math.round(totalCurrent * (1 + i * 0.003)),
    conservative: Math.round(totalCurrent * (1 - i * 0.015)),
  }));

  return [...historical, ...projected];
}

export const TrendProjection = () => {
  const data = useMemo(generateTrendData, []);

  const formatValue = (v: number) => `${(v / 1000).toFixed(0)}k`;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Tendência & Projecção de Produção Nacional</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-primary rounded-full" />
            <span className="text-[9px] text-muted-foreground font-medium">Histórico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-success rounded-full" />
            <span className="text-[9px] text-muted-foreground font-medium">Optimista</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-warning rounded-full" />
            <span className="text-[9px] text-muted-foreground font-medium">Base</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-danger rounded-full" />
            <span className="text-[9px] text-muted-foreground font-medium">Conservador</span>
          </div>
        </div>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(200, 45%, 28%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(200, 45%, 28%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradOptimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(152, 50%, 38%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(152, 50%, 38%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(38, 75%, 48%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(38, 75%, 48%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradConservative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 65%, 42%)" stopOpacity={0.1} />
                <stop offset="100%" stopColor="hsl(0, 65%, 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 84%)" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(215, 12%, 50%)" }} tickLine={false} axisLine={false} interval={2} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(215, 12%, 50%)" }} tickLine={false} axisLine={false} tickFormatter={formatValue} width={40} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(214, 18%, 84%)", background: "hsl(210, 20%, 99%)" }}
              formatter={(v: number) => [v ? `${(v / 1000).toFixed(1)}k BOPD` : "-"]}
            />
            <Area type="monotone" dataKey="actual" stroke="hsl(200, 45%, 28%)" strokeWidth={2} fill="url(#gradActual)" dot={false} connectNulls={false} />
            <Area type="monotone" dataKey="optimistic" stroke="hsl(152, 50%, 38%)" strokeWidth={1.5} fill="url(#gradOptimistic)" dot={false} strokeDasharray="4 2" connectNulls={false} />
            <Area type="monotone" dataKey="base" stroke="hsl(38, 75%, 48%)" strokeWidth={1.5} fill="url(#gradBase)" dot={false} connectNulls={false} />
            <Area type="monotone" dataKey="conservative" stroke="hsl(0, 65%, 42%)" strokeWidth={1.5} fill="url(#gradConservative)" dot={false} strokeDasharray="4 2" connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
