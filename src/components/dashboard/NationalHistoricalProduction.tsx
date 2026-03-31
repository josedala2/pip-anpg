import { useMemo } from "react";
import { nationalHistoricalFull } from "@/data/nationalForecast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

export const NationalHistoricalProduction = () => {
  const peakYear = 2008;
  const peakValue = 1897768;

  const data = useMemo(() =>
    nationalHistoricalFull.map(d => ({
      year: d.year.toString(),
      production: d.production,
      isPeak: d.year === peakYear,
    })), []);

  const formatY = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return v.toString();
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Histórico da Produção Petrolífera Nacional (1975–2025)</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
            Pico 2008: 1,898 MBOPD
          </span>
          <span className="text-[9px] text-muted-foreground font-medium">Fonte: Relatórios anuais ANPG</span>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatY}
              width={45}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
              }}
              formatter={(v: number) => [`${formatY(v)} BOPD`, "Produção"]}
              labelFormatter={(label) => `Ano ${label}`}
            />
            <ReferenceLine
              y={peakValue}
              stroke="hsl(var(--primary))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <Bar dataKey="production" radius={[2, 2, 0, 0]} maxBarSize={14}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isPeak ? "hsl(var(--primary))" : "hsl(142 40% 35%)"}
                  fillOpacity={entry.isPeak ? 1 : 0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
