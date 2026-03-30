import type { OilBlock } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartWrapper } from "@/components/dashboard/ChartWrapper";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell, LabelList,
} from "recharts";
import {
  Flame, Zap, Activity, Gauge, Building2, Lightbulb,
  Droplets, ArrowRight, Fuel, Info,
} from "lucide-react";

const COLORS = {
  injection: "hsl(var(--primary))",
  fuel: "hsl(var(--chart-4))",
  flared: "hsl(var(--warning))",
  exportALNG: "hsl(var(--chart-2))",
  unaccounted: "hsl(var(--muted-foreground))",
  opportunities: "hsl(var(--success))",
  b014: "hsl(var(--primary))",
};

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

interface Props {
  block: OilBlock;
}

export const BlockGasPanel = ({ block }: Props) => {
  const gas = block.gasBalance;
  if (!gas) return null;

  const utilizationData = [
    { name: "Injecção", value: gas.utilizationIndex.injection },
    { name: "Exportação", value: gas.utilizationIndex.export },
    { name: "Combustível", value: gas.utilizationIndex.fuel },
    { name: "Queima", value: gas.utilizationIndex.flaring },
  ];

  const utilizationDetails = [
    { label: "Injecção", value: gas.utilizationIndex.injection, icon: <Droplets className="w-4 h-4" />, color: "hsl(var(--primary))" },
    { label: "Exportação (ALNG)", value: gas.utilizationIndex.export, icon: <ArrowRight className="w-4 h-4" />, color: "hsl(var(--chart-2))" },
    { label: "Combustível", value: gas.utilizationIndex.fuel, icon: <Fuel className="w-4 h-4" />, color: "hsl(var(--chart-4))" },
    { label: "Queima (Flaring)", value: gas.utilizationIndex.flaring, icon: <Flame className="w-4 h-4" />, color: "hsl(var(--warning))" },
  ];

  const pieColors = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-4))", "hsl(var(--warning))"];

  return (
    <div className="space-y-4">
      <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2">
        <Flame className="w-4 h-4 text-warning" />
        Gás Natural — Balanço e Fornecimento
      </h3>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Zap className="w-5 h-5 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Reservas de Gás</span>
            <span className="text-lg font-bold">{gas.reservesBSCF.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">BSCF</span>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Activity className="w-5 h-5 text-success mb-1" />
            <span className="text-xs text-muted-foreground">Produção Média</span>
            <span className="text-lg font-bold">{gas.productionAvgMMSCFD.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">MMSCFD</span>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Gauge className="w-5 h-5 text-warning mb-1" />
            <span className="text-xs text-muted-foreground">GOR</span>
            <span className="text-lg font-bold">{gas.gorSCFperSTB.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">SCF/STB</span>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Building2 className="w-5 h-5 text-chart-2 mb-1" />
            <span className="text-xs text-muted-foreground">Capacidade Infra.</span>
            <span className="text-lg font-bold">{gas.infrastructureCapacityMMSCFD.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">MMSCFD</span>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Index + Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartWrapper title="Índice de Utilização do Gás" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={utilizationData}
                cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                paddingAngle={3} dataKey="value" animationDuration={800}
              >
                {pieColors.map((c, i) => <Cell key={i} fill={c} />)}
                <LabelList dataKey="name" position="outside" style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val}%`, "Utilização"]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Detalhe de Utilização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {utilizationDetails.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-sm font-bold font-mono w-10 text-right">{item.value}%</span>
                </div>
              </div>
            ))}

            {gas.opportunitiesTCF && (
              <div className="mt-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-success">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Oportunidades identificadas: ~{gas.opportunitiesTCF} TCF
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mass Balance History Chart */}
      {gas.gasBalanceHistory && gas.gasBalanceHistory.length > 0 && (
        <ChartWrapper title="Balanço de Massa do Gás (MMSCFD)" icon={<Flame className="w-4 h-4 text-warning" />} height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gas.gasBalanceHistory} barGap={0} barCategoryGap="10%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v} MMSCFD`} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="injected" name="Injectado" stackId="a" fill={COLORS.injection} />
              <Bar dataKey="fuel" name="Combustível" stackId="a" fill={COLORS.fuel} />
              <Bar dataKey="flared" name="Queimado" stackId="a" fill={COLORS.flared} />
              <Bar dataKey="exportALNG" name="Exportado ALNG" stackId="a" fill={COLORS.exportALNG} />
              <Bar dataKey="unaccounted" name="Por categorizar" stackId="a" fill={COLORS.unaccounted} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

      {/* Gas Supply Forecast Chart */}
      {gas.gasSupplyForecast && gas.gasSupplyForecast.length > 0 && (
        <ChartWrapper title="Fornecimento de Gás — B0/14 Exportado + Oportunidades (MMSCFD)" icon={<Activity className="w-4 h-4 text-success" />} height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gas.gasSupplyForecast} barGap={0} barCategoryGap="10%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v} MMSCFD`} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="b014Exported" name="B0/14 Exportado" stackId="a" fill={COLORS.b014} />
              <Bar dataKey="opportunities" name="Oportunidades" stackId="a" fill={COLORS.opportunities} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

      {/* Pressupostos & Recommendation */}
      {(gas.gasBreakevenRange || gas.gasRecommendation || gas.gasDRONote) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gas.gasBreakevenRange && (
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Pressupostos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Breakeven Range</span>
                  <Badge variant="outline" className="font-mono text-sm">{gas.gasBreakevenRange}</Badge>
                </div>
                {gas.gasDRONote && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{gas.gasDRONote}</p>
                )}
              </CardContent>
            </Card>
          )}
          {gas.gasRecommendation && (
            <Card className="glass-card border-success/20 bg-success/5">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-success" />
                  Recomendação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed">{gas.gasRecommendation}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
