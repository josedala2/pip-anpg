import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartWrapper } from "./ChartWrapper";
import { gasUtilization, gasSupplyForecastYearly, gasProductionCurrent, gasObservations, gasRecommendations } from "@/data/gasUtilization";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, ReferenceLine } from "recharts";
import { Flame, Droplets, AlertTriangle, Zap } from "lucide-react";

const ForecastTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
  return (
    <div className="rounded-lg border bg-background p-2.5 shadow-xl text-xs">
      <div className="font-semibold mb-1.5">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: p.fill || p.color }} />
            {p.name}
          </span>
          <span className="font-mono font-medium">{p.value?.toLocaleString()}</span>
        </div>
      ))}
      <div className="border-t mt-1.5 pt-1.5 flex justify-between font-semibold">
        <span>Total</span>
        <span className="font-mono">{total.toLocaleString()}</span>
      </div>
    </div>
  );
};

export const GasUtilizationPanel = () => {
  const chartData = gasUtilization.map(g => ({
    year: g.year,
    "Injectado": g.injected ?? 0,
    "Combustível": g.fuel ?? 0,
    "Queimado": g.flared,
    "ALNG": g.exportedALNG,
    "Gas Lift": g.gasLift ?? 0,
  }));

  const forecastData = gasSupplyForecastYearly.map(g => ({
    year: g.year,
    "ALNG (Blocos actuais)": g.alng,
    "Oport. Desenvolvimento": g.development,
    "Exploração & Avaliação": g.exploration,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground font-medium">Produção 2025</span>
            </div>
            <div className="text-2xl font-bold">{gasProductionCurrent.production2025.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">MMSCFD</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-chart-2" />
              <span className="text-[10px] text-muted-foreground font-medium">Fornecimento ALNG</span>
            </div>
            <div className="text-2xl font-bold">{gasProductionCurrent.supplyALNG2025.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">MMSCFD (2025)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <span className="text-[10px] text-muted-foreground font-medium">Défice Estrutural</span>
            </div>
            <div className="text-2xl font-bold text-danger">{gasProductionCurrent.deficitStructural} TCF</div>
            <div className="text-[10px] text-muted-foreground">A partir de 2035</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-warning" />
              <span className="text-[10px] text-muted-foreground font-medium">Gás Queimado 2025</span>
            </div>
            <div className="text-2xl font-bold text-warning">{gasUtilization[gasUtilization.length - 1].flared}</div>
            <div className="text-[10px] text-muted-foreground">MMSCFD</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart - Historical */}
      <ChartWrapper title="Utilização do Gás Natural — Angola 2017-2025 (MMSCFD)">
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "MMSCFD", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Injectado" stackId="a" fill="hsl(var(--primary))" />
            <Bar dataKey="ALNG" stackId="a" fill="hsl(var(--chart-2))" />
            <Bar dataKey="Gas Lift" stackId="a" fill="hsl(var(--chart-3))" />
            <Bar dataKey="Combustível" stackId="a" fill="hsl(var(--chart-4))" />
            <Bar dataKey="Queimado" stackId="a" fill="hsl(var(--warning))" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Forecast Chart */}
      <ChartWrapper title="Previsão de Fornecimento de Gás à ALNG — 2025-2050 (MMSCFD)">
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              domain={[0, 4500]}
              label={{ value: "MMSCFD", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }}
            />
            <Tooltip content={<ForecastTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              y={3900}
              stroke="hsl(var(--danger))"
              strokeDasharray="8 4"
              strokeWidth={2}
              label={{ value: "Capacidade Máx. ALNG (3.900)", position: "top", style: { fontSize: 10, fill: "hsl(var(--danger))", fontWeight: 600 } }}
            />
            <ReferenceLine
              y={1100}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: "Nível actual (~1.100)", position: "insideBottomRight", style: { fontSize: 9, fill: "hsl(var(--muted-foreground))" } }}
            />
            <Bar dataKey="ALNG (Blocos actuais)" stackId="forecast" fill="hsl(30 90% 55%)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Oport. Desenvolvimento" stackId="forecast" fill="hsl(270 60% 55%)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Exploração & Avaliação" stackId="forecast" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Summary + Assumptions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pressupostos</h4>
            <ul className="space-y-1">
              <li className="text-[11px] leading-relaxed flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>5,1 TCF de reservas comerciais nos blocos actuais (ALNG)</span>
              </li>
              <li className="text-[11px] leading-relaxed flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Capacidade máxima ALNG: 3.900 MMSCFD</span>
              </li>
              <li className="text-[11px] leading-relaxed flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Défice estrutural de 1,5 TCF a partir de 2035</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Fontes de Fornecimento</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: "hsl(30 90% 55%)" }} />
                <span><strong>ALNG:</strong> Blocos 0, 14, 15, 17, 18, 31, 32, Q&M</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: "hsl(270 60% 55%)" }} />
                <span><strong>Desenvolvimento:</strong> Kambala, Vanza, Longui, 80I, 121C, Minzu</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: "hsl(var(--muted-foreground))" }} />
                <span><strong>Exploração:</strong> B1/14, B20/11, B24, NGC Fase 2-4</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observations & Recommendations */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observações</h4>
              <ul className="space-y-1">
                {gasObservations.map((obs, i) => (
                  <li key={i} className="text-[11px] leading-relaxed flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recomendações</h4>
              <ul className="space-y-1">
                {gasRecommendations.map((rec, i) => (
                  <li key={i} className="text-[11px] leading-relaxed flex gap-2">
                    <span className="text-success mt-0.5">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
