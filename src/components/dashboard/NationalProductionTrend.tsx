import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { nationalHistoricalProduction } from "@/data/nationalForecast";
import { gasUtilization } from "@/data/gasUtilization";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { TrendingDown, Info } from "lucide-react";

// Merge oil production with gas production (total = sum of all utilization components)
const gasByYear = new Map(
  gasUtilization.map(g => [
    g.year,
    (g.injected ?? 0) + (g.fuel ?? 0) + g.flared + g.exportedALNG + (g.gasLift ?? 0) + (g.deviations ?? 0),
  ])
);

const data = nationalHistoricalProduction.map(d => ({
  ...d,
  productionBOPD: d.production * 1000,
  gasMMSCFD: gasByYear.get(d.year) ?? null,
}));

const peakYear = data.reduce((a, b) => a.productionBOPD > b.productionBOPD ? a : b);
const latest = data[data.length - 2]; // 2025 (last actual)
const decline = ((peakYear.productionBOPD - latest.productionBOPD) / peakYear.productionBOPD * 100).toFixed(1);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg space-y-1">
      <p className="text-xs font-bold">{label}</p>
      <p className="text-sm font-semibold text-primary">
        Óleo: {(d.productionBOPD / 1000).toFixed(0)} kBOPD
      </p>
      {d.gasMMSCFD && (
        <p className="text-sm font-semibold text-warning">
          Gás: {d.gasMMSCFD.toLocaleString()} MMSCFD
        </p>
      )}
      <p className="text-[10px] text-muted-foreground">{d.label}</p>
    </div>
  );
};

export const NationalProductionTrend = () => (
  <Card className="border-border/40">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-warning" />
          <CardTitle className="text-sm font-semibold">Tendência de Produção Nacional (2020–2026)</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
            <span className="text-[10px] text-muted-foreground">Pico</span>
            <span className="text-xs font-bold">{peakYear.year}: {(peakYear.productionBOPD / 1000).toFixed(0)}k</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-warning/10 border border-warning/20">
            <span className="text-[10px] text-warning">Declínio</span>
            <span className="text-xs font-bold text-warning">-{decline}%</span>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            yAxisId="oil"
            domain={[900000, 1350000]}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            label={{ value: "BOPD", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }}
          />
          <YAxis
            yAxisId="gas"
            orientation="right"
            domain={[2500, 5500]}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
            tick={{ fontSize: 10, fill: "hsl(var(--warning))" }}
            label={{ value: "MMSCFD", angle: 90, position: "insideRight", style: { fontSize: 10, fill: "hsl(var(--warning))" } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value: string) => <span className="text-xs">{value}</span>}
          />
          <ReferenceLine
            yAxisId="oil"
            y={peakYear.productionBOPD}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
          />
          <Area
            yAxisId="oil"
            type="monotone"
            dataKey="productionBOPD"
            name="Óleo (BOPD)"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fill="url(#prodGradient)"
            dot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="gas"
            type="monotone"
            dataKey="gasMMSCFD"
            name="Gás (MMSCFD)"
            stroke="hsl(var(--warning))"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3, fill: "hsl(var(--warning))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
        <Info className="w-3 h-3" />
        <span>Fonte: Relatórios anuais ANPG. 2026 = previsão com projectos FID aprovados. Gás = soma dos componentes de utilização.</span>
      </div>
    </CardContent>
  </Card>
);
