import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartWrapper } from "./ChartWrapper";
import { gasUtilization, gasSupplyForecast, gasProductionCurrent, gasObservations, gasRecommendations } from "@/data/gasUtilization";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { Flame, Droplets, AlertTriangle, Zap } from "lucide-react";

export const GasUtilizationPanel = () => {
  const chartData = gasUtilization.map(g => ({
    year: g.year,
    "Injectado": g.injected ?? 0,
    "Combustível": g.fuel ?? 0,
    "Queimado": g.flared,
    "ALNG": g.exportedALNG,
    "Gas Lift": g.gasLift ?? 0,
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

      {/* Main Chart */}
      <ChartWrapper title="Utilização do Gás Natural — Angola 2017-2025" subtitle="Distribuição por utilização (MMSCFD)">
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

      <div className="grid md:grid-cols-2 gap-4">
        {/* Gas Supply Forecast */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Previsão de Fornecimento de Gás à ALNG</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gasSupplyForecast.map(f => (
              <div key={f.period} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-xs font-semibold">{f.period}</span>
                <div className="text-right">
                  <div className="text-sm font-bold">{f.averageSupply.toLocaleString()} MMSCFD</div>
                  <div className="text-[10px] text-muted-foreground">média anual</div>
                </div>
              </div>
            ))}
            <div className="mt-2 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-danger">
                <AlertTriangle className="w-3.5 h-3.5" />
                Défice estrutural de 1,5 TCF a partir de 2035
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Coloca em risco a operação plena da ALNG. Urgentes novas fontes de fornecimento.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Observations & Recommendations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Observações e Recomendações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observações</h4>
              <ul className="space-y-1.5">
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
              <ul className="space-y-1.5">
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
