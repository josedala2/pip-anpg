import { useMemo } from "react";
import { nationalForecast } from "@/data/nationalForecast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

export const NationalForecast2050 = () => {
  const data = useMemo(() =>
    nationalForecast.map(d => ({
      year: d.year.toString(),
      base: d.baseProduction,
      fid: d.discoveredWithFID,
      noFid: d.discoveredWithoutFID,
      exploration: d.newConcessions,
      total: d.total,
    })), []);

  const peakEntry = useMemo(() =>
    data.reduce((max, d) => d.total > max.total ? d : max, data[0]), [data]);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            Tendência de Produção Nacional 2025–2050
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
            Pico {peakEntry.year}: {peakEntry.total.toLocaleString("pt-AO")} kBOPD
          </span>
          <span className="text-[9px] text-muted-foreground font-medium">
            Fonte: EHA — Previsões de Produção, ANPG
          </span>
        </div>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
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
              domain={[0, 1800]}
              width={40}
              label={{
                value: "Mil bopd",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 9, fill: "hsl(var(--muted-foreground))" },
                offset: -5,
              }}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
              }}
              formatter={(v: number, name: string) => {
                const labels: Record<string, string> = {
                  base: "Produção de Base",
                  fid: "Descobertas c/ FID",
                  noFid: "Descobertas s/ FID",
                  exploration: "Exploração & Novas Concessões",
                };
                return [`${v.toLocaleString("pt-AO")} kBOPD`, labels[name] || name];
              }}
              labelFormatter={(label) => `Ano ${label}`}
            />
            <Legend
              wrapperStyle={{ fontSize: 10 }}
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  base: "Produção de Base",
                  fid: "Descobertas c/ Data FID",
                  noFid: "Descobertas s/ Data FID",
                  exploration: "Exploração & Novas Concessões",
                };
                return labels[value] || value;
              }}
            />

            {/* Reference line at ~1020 */}
            <ReferenceLine
              y={1037}
              stroke="hsl(var(--destructive))"
              strokeDasharray="6 3"
              strokeOpacity={0.6}
              label={{
                value: "1 037",
                position: "right",
                style: { fontSize: 8, fill: "hsl(var(--destructive))" },
              }}
            />

            <Bar dataKey="base" stackId="prod" fill="hsl(var(--muted-foreground) / 0.5)" radius={[0, 0, 0, 0]} maxBarSize={16} />
            <Bar dataKey="fid" stackId="prod" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} maxBarSize={16} />
            <Bar dataKey="noFid" stackId="prod" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} maxBarSize={16} />
            <Bar dataKey="exploration" stackId="prod" fill="hsl(var(--chart-4))" radius={[2, 2, 0, 0]} maxBarSize={16}>
              {data.map((_, index) => (
                <Cell key={index} />
              ))}
            </Bar>

            {/* Annotation for 2025 */}
            <ReferenceLine
              x="2025"
              stroke="transparent"
              label={{
                value: "1 037",
                position: "top",
                style: { fontSize: 9, fontWeight: 700, fill: "hsl(var(--foreground))" },
                offset: 5,
              }}
            />
            {/* Annotation for peak year */}
            <ReferenceLine
              x={peakEntry.year}
              stroke="transparent"
              label={{
                value: peakEntry.total.toLocaleString("pt-AO"),
                position: "top",
                style: { fontSize: 9, fontWeight: 700, fill: "hsl(var(--primary))" },
                offset: 5,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};