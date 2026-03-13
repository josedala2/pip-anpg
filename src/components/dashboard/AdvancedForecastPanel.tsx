import { useMemo, useState } from "react";
import { oilBlocks } from "@/data/angolaBlocks";
import {
  runAllScenarios,
  runAllScenariosForBlock,
  PREDEFINED_SCENARIOS,
  type ScenarioOutput,
} from "@/lib/scenarioEngine";
import {
  calculateAllScores,
  type StrategicScore,
  type StrategicClassification,
} from "@/lib/strategicScoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  ScatterChart, Scatter, ZAxis, Cell, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  TrendingUp, TrendingDown, Target, Activity, Gauge,
  AlertTriangle, ShieldCheck, Calendar, Layers, Info,
} from "lucide-react";

// ── Helpers ──

const SCENARIO_COLORS: Record<string, string> = {
  continuidade: "hsl(200, 45%, 28%)",
  optimizacao: "hsl(152, 50%, 38%)",
  revitalizacao: "hsl(38, 75%, 48%)",
  declinio: "hsl(280, 50%, 55%)",
  abandono: "hsl(0, 65%, 42%)",
};

const CLASS_COLORS: Record<StrategicClassification, string> = {
  Revitalizar: "hsl(38, 75%, 48%)",
  "Manter & Optimizar": "hsl(152, 50%, 38%)",
  Renegociar: "hsl(280, 50%, 55%)",
  Monitorar: "hsl(199, 70%, 45%)",
  "Preparar Abandono": "hsl(0, 65%, 42%)",
  Relicitar: "hsl(200, 45%, 28%)",
};

function fmtUSD(mmusd: number): string {
  const abs = Math.abs(mmusd);
  if (abs >= 1000) return `$${(mmusd / 1000).toFixed(1)}B`;
  return `$${Math.round(mmusd)}MM`;
}

type Horizon = "5" | "10" | "15";

export const AdvancedForecastPanel = () => {
  const [horizon, setHorizon] = useState<Horizon>("10");
  const [focusScenario, setFocusScenario] = useState("optimizacao");

  // ── National scenarios ──
  const nationalOutputs = useMemo(() => runAllScenarios(), []);

  // ── Strategic scores ──
  const strategicScores = useMemo(() => calculateAllScores(oilBlocks), []);

  // ── Per-block best scenario analysis ──
  const blockAnalysis = useMemo(() => {
    const producing = oilBlocks.filter(b => b.dailyProduction > 0);
    return producing.map(block => {
      const scenarios = runAllScenariosForBlock(block);
      const strategic = strategicScores.find(s => s.blockId === block.id);
      const bestScenario = scenarios.reduce((best, s) => s.npv > best.npv ? s : best, scenarios[0]);
      const worstScenario = scenarios.reduce((worst, s) => s.npv < worst.npv ? s : worst, scenarios[0]);
      const focusOutput = scenarios.find(s => s.scenario.id === focusScenario) || scenarios[0];

      return {
        block,
        scenarios,
        strategic,
        bestScenario,
        worstScenario,
        focusOutput,
        npvRange: bestScenario.npv - worstScenario.npv,
        prodYear5: focusOutput.projections[4]?.production || 0,
        prodYear10: focusOutput.projections[9]?.production || 0,
      };
    }).sort((a, b) => b.focusOutput.npv - a.focusOutput.npv);
  }, [focusScenario, strategicScores]);

  const horizonYears = parseInt(horizon);

  // ── Multi-horizon comparison data ──
  const horizonData = useMemo(() => {
    const years = nationalOutputs[0].projections.slice(0, horizonYears).map(p => p.year);
    return years.map((year, i) => {
      const row: Record<string, number> = { year };
      nationalOutputs.forEach(o => {
        row[`${o.scenario.id}_prod`] = (o.projections[i]?.production || 0) / 1000;
        row[`${o.scenario.id}_revenue`] = o.projections[i]?.revenue || 0;
        row[`${o.scenario.id}_state`] = o.projections[i]?.stateRevenue || 0;
      });
      return row;
    });
  }, [nationalOutputs, horizonYears]);

  // ── Summary KPIs for focus scenario ──
  const focusNational = nationalOutputs.find(o => o.scenario.id === focusScenario)!;
  const baseNational = nationalOutputs.find(o => o.scenario.id === "continuidade")!;
  const prodDelta = focusNational.projections[horizonYears - 1].production - focusNational.projections[0].production;
  const prodDeltaPct = (prodDelta / focusNational.projections[0].production) * 100;

  // ── Classification distribution for radar ──
  const classDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    strategicScores.forEach(s => {
      counts[s.classification] = (counts[s.classification] || 0) + 1;
    });
    return Object.entries(counts).map(([cls, count]) => ({
      classification: cls,
      count,
      fullMark: oilBlocks.length,
    }));
  }, [strategicScores]);

  // ── NPV vs Strategic Score scatter ──
  const scatterData = useMemo(() => {
    return blockAnalysis.map(ba => ({
      name: ba.block.name,
      npv: ba.focusOutput.npv,
      strategicScore: ba.strategic?.totalScore || 0,
      production: ba.block.dailyProduction / 1000,
      classification: ba.strategic?.classification || "Monitorar",
    }));
  }, [blockAnalysis]);

  // ── Production decline risk bands ──
  const riskBands = useMemo(() => {
    const total = blockAnalysis.reduce((s, ba) => s + ba.block.dailyProduction, 0);
    const declining = blockAnalysis.filter(ba => ba.prodYear10 < ba.block.dailyProduction * 0.5);
    const stable = blockAnalysis.filter(ba => ba.prodYear10 >= ba.block.dailyProduction * 0.5 && ba.prodYear10 < ba.block.dailyProduction * 0.8);
    const growing = blockAnalysis.filter(ba => ba.prodYear10 >= ba.block.dailyProduction * 0.8);

    return {
      declining: { count: declining.length, prod: declining.reduce((s, ba) => s + ba.block.dailyProduction, 0) },
      stable: { count: stable.length, prod: stable.reduce((s, ba) => s + ba.block.dailyProduction, 0) },
      growing: { count: growing.length, prod: growing.reduce((s, ba) => s + ba.block.dailyProduction, 0) },
      total,
    };
  }, [blockAnalysis]);

  return (
    <div className="space-y-5">
      {/* ── Header Controls ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Previsão Estratégica Avançada
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <Select value={horizon} onValueChange={(v) => setHorizon(v as Horizon)}>
              <SelectTrigger className="w-32 h-8 text-xs border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="5">5 Anos (2030)</SelectItem>
                <SelectItem value="10">10 Anos (2035)</SelectItem>
                <SelectItem value="15">15 Anos (2040)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-muted-foreground" />
            <Select value={focusScenario} onValueChange={setFocusScenario}>
              <SelectTrigger className="w-48 h-8 text-xs border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {PREDEFINED_SCENARIOS.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── National Outlook KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <OutlookKPI
          icon={Activity}
          label="Produção Final"
          value={`${(focusNational.projections[horizonYears - 1].production / 1000).toFixed(0)}k`}
          sub={`BOPD em ${2026 + horizonYears - 1}`}
          trend={prodDeltaPct}
        />
        <OutlookKPI
          icon={TrendingUp}
          label="NPV Nacional"
          value={fmtUSD(focusNational.npv)}
          sub={`Cenário: ${focusNational.scenario.name}`}
          trend={focusNational.npv >= baseNational.npv ? ((focusNational.npv - baseNational.npv) / Math.abs(baseNational.npv)) * 100 : ((focusNational.npv - baseNational.npv) / Math.abs(baseNational.npv)) * 100}
        />
        <OutlookKPI
          icon={Gauge}
          label="Receita Estado Total"
          value={fmtUSD(focusNational.totalStateRevenue)}
          sub={`Acumulado ${horizonYears} anos`}
          trend={0}
        />
        <OutlookKPI
          icon={Target}
          label="Custo Médio/bbl"
          value={`$${focusNational.avgCostPerBarrel.toFixed(1)}`}
          sub="Média ponderada"
          trend={focusNational.avgCostPerBarrel < baseNational.avgCostPerBarrel ? -((baseNational.avgCostPerBarrel - focusNational.avgCostPerBarrel) / baseNational.avgCostPerBarrel) * 100 : ((focusNational.avgCostPerBarrel - baseNational.avgCostPerBarrel) / baseNational.avgCostPerBarrel) * 100}
        />
        <OutlookKPI
          icon={ShieldCheck}
          label="Blocos Estáveis"
          value={`${riskBands.growing.count + riskBands.stable.count}`}
          sub={`de ${blockAnalysis.length} em produção`}
          trend={0}
        />
        <OutlookKPI
          icon={AlertTriangle}
          label="Produção em Declínio"
          value={`${(riskBands.declining.prod / 1000).toFixed(0)}k`}
          sub={`${riskBands.declining.count} blocos > 50% declínio`}
          trend={-((riskBands.declining.prod / riskBands.total) * 100)}
        />
      </div>

      {/* ── Production Outlook Chart ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Outlook de Produção Nacional — Todos os Cenários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={horizonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `${v}k`} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  formatter={(v: number) => [`${v.toFixed(0)}k BOPD`, ""]}
                />
                {nationalOutputs.map(o => (
                  <Area
                    key={o.scenario.id}
                    type="monotone"
                    dataKey={`${o.scenario.id}_prod`}
                    stroke={SCENARIO_COLORS[o.scenario.id]}
                    fill={SCENARIO_COLORS[o.scenario.id]}
                    fillOpacity={o.scenario.id === focusScenario ? 0.15 : 0.03}
                    strokeWidth={o.scenario.id === focusScenario ? 2.5 : 1}
                    strokeDasharray={o.scenario.id === focusScenario ? undefined : "4 2"}
                    name={o.scenario.name}
                    dot={false}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Charts Row: State Revenue + NPV vs Strategic Score ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* State Revenue Outlook */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Receita do Estado — Projecção Comparativa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={horizonData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `$${v}`} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number) => [`$${v.toLocaleString()}MM`, ""]}
                  />
                  {nationalOutputs.filter(o => [focusScenario, "continuidade"].includes(o.scenario.id)).map(o => (
                    <Bar
                      key={o.scenario.id}
                      dataKey={`${o.scenario.id}_state`}
                      fill={SCENARIO_COLORS[o.scenario.id]}
                      fillOpacity={o.scenario.id === focusScenario ? 0.8 : 0.3}
                      name={o.scenario.name}
                      barSize={8}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* NPV vs Strategic Score Scatter */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              NPV vs Score Estratégico
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Cruzamento do valor económico (NPV) com o score estratégico (0-100). Tamanho = produção actual. Cor = classificação estratégica.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis type="number" dataKey="strategicScore" name="Score" tick={{ fontSize: 10 }} className="fill-muted-foreground" domain={[0, 100]} label={{ value: "Score Estratégico", position: "bottom", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="number" dataKey="npv" name="NPV" tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}B` : `$${v}MM`} label={{ value: "NPV", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <ZAxis type="number" dataKey="production" range={[40, 400]} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number, name: string) => {
                      if (name === "NPV") return [v >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${v}MM`, "NPV"];
                      if (name === "Score") return [v, "Score"];
                      return [`${v.toFixed(0)}k BOPD`, "Produção"];
                    }}
                    labelFormatter={() => ""}
                  />
                  <ReferenceLine x={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <Scatter data={scatterData} name="Concessões">
                    {scatterData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={CLASS_COLORS[entry.classification as StrategicClassification] || "hsl(var(--muted-foreground))"}
                        fillOpacity={0.7}
                        stroke={CLASS_COLORS[entry.classification as StrategicClassification] || "hsl(var(--muted-foreground))"}
                        strokeWidth={1}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Production Risk Bands ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Bandas de Risco de Produção — Horizonte {horizonYears} Anos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RiskBand
              label="Crescimento / Estável"
              description={`Retenção ≥ 80% da produção actual até ${2026 + horizonYears - 1}`}
              count={riskBands.growing.count}
              production={riskBands.growing.prod}
              total={riskBands.total}
              color="text-success"
              bgColor="bg-success/10"
              borderColor="border-success/30"
            />
            <RiskBand
              label="Declínio Moderado"
              description="Retenção entre 50-80% da produção"
              count={riskBands.stable.count}
              production={riskBands.stable.prod}
              total={riskBands.total}
              color="text-warning"
              bgColor="bg-warning/10"
              borderColor="border-warning/30"
            />
            <RiskBand
              label="Declínio Severo"
              description="Perda > 50% da produção actual"
              count={riskBands.declining.count}
              production={riskBands.declining.prod}
              total={riskBands.total}
              color="text-danger"
              bgColor="bg-danger/10"
              borderColor="border-danger/30"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Block-level Forecast Table ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Previsão por Concessão — Cenário {PREDEFINED_SCENARIOS.find(s => s.id === focusScenario)?.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border/40">
                  <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Concessão</th>
                  <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Operador</th>
                  <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Prod. Actual</th>
                  <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Prod. {2026 + horizonYears - 1}</th>
                  <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Δ%</th>
                  <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">NPV</th>
                  <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Receita Estado</th>
                  <th className="text-center py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Score</th>
                  <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Classificação</th>
                  <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Melhor Cenário</th>
                </tr>
              </thead>
              <tbody>
                {blockAnalysis.map(ba => {
                  const endProd = ba.focusOutput.projections[horizonYears - 1]?.production || 0;
                  const startProd = ba.block.dailyProduction;
                  const delta = startProd > 0 ? ((endProd - startProd) / startProd) * 100 : 0;
                  const totalState = ba.focusOutput.projections.slice(0, horizonYears).reduce((s, p) => s + p.stateRevenue, 0);
                  const cls = ba.strategic?.classification || "Monitorar";

                  return (
                    <tr key={ba.block.id} className="border-b border-border/20 hover:bg-muted/20">
                      <td className="py-2 px-3 font-semibold">{ba.block.name}</td>
                      <td className="py-2 px-2 text-muted-foreground">{ba.block.operator}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{(startProd / 1000).toFixed(1)}k</td>
                      <td className="py-2 px-2 text-right tabular-nums">{(endProd / 1000).toFixed(1)}k</td>
                      <td className={`py-2 px-2 text-right tabular-nums font-semibold ${delta >= 0 ? "text-success" : delta > -30 ? "text-warning" : "text-danger"}`}>
                        {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
                      </td>
                      <td className={`py-2 px-2 text-right tabular-nums font-bold ${ba.focusOutput.npv >= 0 ? "text-success" : "text-danger"}`}>
                        {fmtUSD(ba.focusOutput.npv)}
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums">{fmtUSD(totalState)}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`text-xs font-bold tabular-nums ${(ba.strategic?.totalScore || 0) >= 60 ? "text-success" : (ba.strategic?.totalScore || 0) >= 40 ? "text-warning" : "text-danger"}`}>
                          {ba.strategic?.totalScore || 0}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="text-[10px]" style={{ color: CLASS_COLORS[cls as StrategicClassification], borderColor: CLASS_COLORS[cls as StrategicClassification] + "40" }}>
                          {cls}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-[10px] text-muted-foreground">{ba.bestScenario.scenario.icon} {ba.bestScenario.scenario.name}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Strategic Classification Radar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Distribuição por Classificação Estratégica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={classDistribution}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="classification" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="Blocos" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scenario Comparison Summary */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Resumo Comparativo — Horizonte {horizonYears} Anos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nationalOutputs.map(o => {
                const endProd = o.projections[horizonYears - 1]?.production || 0;
                const startProd = o.projections[0]?.production || 1;
                const retention = (endProd / startProd) * 100;
                const totalState = o.projections.slice(0, horizonYears).reduce((s, p) => s + p.stateRevenue, 0);

                return (
                  <div
                    key={o.scenario.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                      o.scenario.id === focusScenario
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/30 bg-card"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: SCENARIO_COLORS[o.scenario.id] }}
                    />
                    <span className="text-xs font-semibold w-36">{o.scenario.icon} {o.scenario.name}</span>
                    <div className="flex-1 grid grid-cols-4 gap-2 text-[10px]">
                      <div>
                        <span className="text-muted-foreground">NPV:</span>{" "}
                        <span className={`font-bold ${o.npv >= 0 ? "text-success" : "text-danger"}`}>{fmtUSD(o.npv)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">IRR:</span>{" "}
                        <span className="font-bold text-foreground">{o.irr.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Retenção:</span>{" "}
                        <span className={`font-bold ${retention >= 70 ? "text-success" : retention >= 40 ? "text-warning" : "text-danger"}`}>
                          {retention.toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Estado:</span>{" "}
                        <span className="font-bold text-foreground">{fmtUSD(totalState)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ── Sub-components ──

function OutlookKPI({ icon: Icon, label, value, sub, trend }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  trend: number;
}) {
  return (
    <div className="rounded-lg border border-border/40 p-3 bg-card">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-primary opacity-70" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[10px] text-muted-foreground">{sub}</span>
        {trend !== 0 && (
          <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${trend > 0 ? "text-success" : "text-danger"}`}>
            {trend > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

function RiskBand({ label, description, count, production, total, color, bgColor, borderColor }: {
  label: string;
  description: string;
  count: number;
  production: number;
  total: number;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  const pct = total > 0 ? (production / total) * 100 : 0;
  return (
    <div className={`rounded-lg border p-4 ${bgColor} ${borderColor}`}>
      <div className={`text-xs font-bold ${color}`}>{label}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5 mb-3">{description}</div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-foreground">{count}</div>
          <div className="text-[10px] text-muted-foreground">concessões</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-foreground">{(production / 1000).toFixed(0)}k</div>
          <div className="text-[10px] text-muted-foreground">BOPD ({pct.toFixed(0)}%)</div>
        </div>
      </div>
      {/* Mini progress bar */}
      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color.replace("text-", "bg-")}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
