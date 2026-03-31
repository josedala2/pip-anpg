import { useMemo } from "react";
import { ChartWrapper } from "./ChartWrapper";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import type { AnnualProductionEntry } from "@/data/angolaBlocks";

interface Props {
  data: AnnualProductionEntry[];
  blockName: string;
}

export const HistoricalProductionProfile = ({ data, blockName }: Props) => {
  const peakEntry = useMemo(() => data.reduce((max, d) => d.production > max.production ? d : max, data[0]), [data]);
  const lastHistorical = useMemo(() => [...data].reverse().find(d => d.type === "historical")?.year ?? 2025, [data]);

  const tooltipStyle: React.CSSProperties = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
    color: "hsl(var(--foreground))",
  };

  return (
    <ChartWrapper title={`Histórico — Perfil de Produção · ${blockName}`} height={420} fullscreenHeight={650}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 10, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            interval={1}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            label={{
              value: "Produção BOPD",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
              offset: 10,
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(val: number, _name: string, entry: any) => [
              `${val.toLocaleString()} BOPD`,
              entry.payload.type === "historical" ? "Histórico" : "Previsão",
            ]}
            labelFormatter={(year) => `Ano: ${year}`}
          />
          <ReferenceLine
            x={lastHistorical}
            stroke="hsl(var(--foreground))"
            strokeDasharray="8 4"
            strokeWidth={1.5}
            label={{
              value: "HISTÓRICO | PREVISÃO",
              position: "top",
              fill: "hsl(var(--foreground))",
              fontSize: 10,
              fontWeight: 600,
            }}
          />
          <Bar dataKey="production" radius={[1, 1, 0, 0]} maxBarSize={12}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.type === "historical"
                  ? "hsl(var(--success))"
                  : "hsl(var(--success) / 0.35)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};
