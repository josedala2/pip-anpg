import { useMemo } from "react";
import { oilBlocks } from "@/data/angolaBlocks";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle } from "lucide-react";

// Build trend data from real productionHistory of blocks that have it
function buildRealTrendData() {
  // Aggregate productionHistory from all blocks that have real data
  const monthMap = new Map<string, number>();

  oilBlocks.forEach((block) => {
    if (block.pendingRealData || !block.productionHistory || block.productionHistory.length === 0) return;
    block.productionHistory.forEach((entry) => {
      monthMap.set(entry.month, (monthMap.get(entry.month) || 0) + entry.production);
    });
  });

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, production]) => ({ month, production }));
}

export const TrendProjection = () => {
  const data = useMemo(buildRealTrendData, []);

  const formatValue = (v: number) => `${(v / 1000).toFixed(0)}k`;

  if (data.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Tendência de Produção Nacional</h3>
        </div>
        <div className="flex items-center justify-center h-[220px] text-muted-foreground">
          <div className="text-center space-y-2">
            <AlertTriangle className="w-6 h-6 text-warning mx-auto" />
            <p className="text-xs">Dados de histórico de produção pendentes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Tendência de Produção Nacional</h3>
        </div>
        <span className="text-[9px] text-muted-foreground font-medium">Dados reais · {data.length} meses</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={1} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={formatValue} width={40} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
              formatter={(v: number) => [v ? `${(v / 1000).toFixed(1)}k BOPD` : "-"]}
            />
            <Area type="monotone" dataKey="production" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gradActual)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
