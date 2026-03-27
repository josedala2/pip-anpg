import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { oilBlocks } from "@/data/angolaBlocks";
import {
  runAllScenarios, runScenarioForBlock, runScenario, PREDEFINED_SCENARIOS,
  type ScenarioOutput, type ScenarioDefinition,
} from "@/lib/scenarioEngine";
import { getNationalEconomicKPIs } from "@/lib/economicScoring";
import { calculateAllScores } from "@/lib/strategicScoring";
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  CartesianGrid, Legend, AreaChart, Area, BarChart, Bar, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";
import {
  DollarSign, BarChart3, TrendingUp, TrendingDown, Activity,
  Target, ShieldAlert, Gauge, ArrowUpDown, Info, Zap, AlertTriangle,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

type Scenario = "conservative" | "base" | "expansion";

const scenarios: { id: Scenario; label: string; color: string }[] = [
  { id: "conservative", label: "Conservador", color: "hsl(var(--danger))" },
  { id: "base", label: "Base", color: "hsl(var(--primary))" },
  { id: "expansion", label: "Expansão", color: "hsl(var(--success))" },
];

const verifiedBlocks = oilBlocks.filter(b => !b.pendingRealData);
const BLOCK_COLORS = verifiedBlocks.map((_, i) => `hsl(${i * 25}, 70%, 55%)`);

const fmtUSD = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${v.toFixed(0)}MM`;

export const StrategicForecast = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario>("base");
  const [oilPrice, setOilPrice] = useState<number[]>([78]);
  const navigate = useNavigate();

  const years = Array.from({ length: 10 }, (_, i) => 2025 + i);

  // ── Run scenario engine ──
  const scenarioOutputs = useMemo(() => runAllScenarios(), []);
  const baseOutput = useMemo(() => scenarioOutputs.find(s => s.scenario.id === "continuidade")!, [scenarioOutputs]);
  const economicKPIs = useMemo(() => getNationalEconomicKPIs(verifiedBlocks), []);
  const strategicScores = useMemo(() => calculateAllScores(verifiedBlocks), []);

  // ── Aggregate projections ──
  const projectionData = useMemo(() =>
    years.map((year, i) => {
      const row: Record<string, number | string> = { year: year.toString() };
      for (const s of scenarios) {
        row[s.id] = verifiedBlocks.reduce((sum, b) => sum + (b.projections[s.id][i] || 0), 0);
      }
      return row;
    }), []
  );

  const activeBlocks = useMemo(() =>
    verifiedBlocks.filter(b => b.projections[activeScenario].some(v => v > 0)),
    [activeScenario]
  );

  const stackedData = useMemo(() =>
    years.map((year, i) => {
      const row: Record<string, number | string> = { year: year.toString() };
      for (const b of activeBlocks) {
        row[b.id] = b.projections[activeScenario][i] || 0;
      }
      return row;
    }), [activeScenario, activeBlocks]
  );

  // ── Block breakdown ──
  const blockBreakdown = useMemo(() => {
    const price = oilPrice[0];
    return activeBlocks
      .map(b => {
        const current = b.dailyProduction;
        const projected = b.projections[activeScenario][4] || 0;
        const change = current > 0 ? ((projected - current) / current) * 100 : 0;
        const revenue = (projected * 365 * price) / 1e6;
        return { id: b.id, name: b.name, operator: b.operator, current, projected, change, revenue };
      })
      .sort((a, b) => b.projected - a.projected);
  }, [activeScenario, oilPrice, activeBlocks]);

  // ── Sensitivity analysis: tornado chart ──
  const sensitivityTornado = useMemo(() => {
    const baseNPV = baseOutput.npv;
    const variables = [
      { label: "Preço Brent (+20%)", factor: () => {
        const s = { ...PREDEFINED_SCENARIOS[0], variables: { ...PREDEFINED_SCENARIOS[0].variables, brentPrice: 78 * 1.2 } };
        return runScenarioForNational(s).npv - baseNPV;
      }},
      { label: "Preço Brent (-20%)", factor: () => {
        const s = { ...PREDEFINED_SCENARIOS[0], variables: { ...PREDEFINED_SCENARIOS[0].variables, brentPrice: 78 * 0.8 } };
        return runScenarioForNational(s).npv - baseNPV;
      }},
      { label: "OPEX (+20%)", factor: () => {
        const s = { ...PREDEFINED_SCENARIOS[0], variables: { ...PREDEFINED_SCENARIOS[0].variables, opexMultiplier: 1.2 } };
        return runScenarioForNational(s).npv - baseNPV;
      }},
      { label: "OPEX (-20%)", factor: () => {
        const s = { ...PREDEFINED_SCENARIOS[0], variables: { ...PREDEFINED_SCENARIOS[0].variables, opexMultiplier: 0.8 } };
        return runScenarioForNational(s).npv - baseNPV;
      }},
      { label: "Declínio 3%/ano", factor: () => {
        const s = { ...PREDEFINED_SCENARIOS[0], variables: { ...PREDEFINED_SCENARIOS[0].variables, declineRate: 3 } };
        return runScenarioForNational(s).npv - baseNPV;
      }},
      { label: "Declínio 8%/ano", factor: () => {
        const s = { ...PREDEFINED_SCENARIOS[0], variables: { ...PREDEFINED_SCENARIOS[0].variables, declineRate: 8 } };
        return runScenarioForNational(s).npv - baseNPV;
      }},
      { label: "Royalty +5pp", factor: () => {
        const s = { ...PREDEFINED_SCENARIOS[0], variables: { ...PREDEFINED_SCENARIOS[0].variables, royaltyRate: 25 } };
        return runScenarioForNational(s).npv - baseNPV;
      }},
      { label: "Royalty -5pp", factor: () => {
        const s = { ...PREDEFINED_SCENARIOS[0], variables: { ...PREDEFINED_SCENARIOS[0].variables, royaltyRate: 15 } };
        return runScenarioForNational(s).npv - baseNPV;
      }},
    ];

    return variables
      .map(v => ({ label: v.label, delta: v.factor() }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }, [baseOutput]);

  // ── Scenario comparison data ──
  const scenarioComparison = useMemo(() => {
    return scenarioOutputs.map(s => ({
      name: s.scenario.name,
      icon: s.scenario.icon,
      color: s.scenario.color,
      npv: s.npv,
      stateRevenue: s.totalStateRevenue,
      irr: s.irr,
      breakeven: s.breakeven,
      deltaNPV: s.npv - baseOutput.npv,
      deltaRevenue: s.totalStateRevenue - baseOutput.totalStateRevenue,
      production2030: s.projections[4]?.production || 0,
      production2035: s.projections[9]?.production || 0,
      production2040: s.projections[14]?.production || 0,
    }));
  }, [scenarioOutputs, baseOutput]);

  // ── Executive insights ──
  const insights = useMemo(() => {
    const best = scenarioOutputs.reduce((a, b) => a.npv > b.npv ? a : b);
    const worst = scenarioOutputs.reduce((a, b) => a.npv < b.npv ? a : b);
    const optimisation = scenarioOutputs.find(s => s.scenario.id === "optimizacao");
    const items: string[] = [];
    if (optimisation) {
      const delta = optimisation.npv - baseOutput.npv;
      items.push(`O cenário "${optimisation.scenario.name}" gera ${delta > 0 ? "+" : ""}${fmtUSD(Math.abs(delta))} vs Continuidade.`);
    }
    items.push(`Melhor cenário: "${best.scenario.name}" com NPV de ${fmtUSD(best.npv)} e receita estado de ${fmtUSD(best.totalStateRevenue)}.`);
    items.push(`Pior cenário: "${worst.scenario.name}" com NPV de ${fmtUSD(worst.npv)} — perda potencial de ${fmtUSD(Math.abs(worst.npv - best.npv))}.`);
    
    const brentImpact = sensitivityTornado.find(t => t.label.includes("Brent (+20%)"));
    if (brentImpact) items.push(`Aumento de 20% no Brent melhora NPV em ${fmtUSD(Math.abs(brentImpact.delta))}.`);
    
    return items;
  }, [scenarioOutputs, baseOutput, sensitivityTornado]);

  // ── Radar data for scenario comparison ──
  const radarData = useMemo(() => {
    const metrics = ["NPV", "Receita Estado", "Produção 2035", "IRR", "Custo/bbl"];
    const maxVals = {
      NPV: Math.max(...scenarioOutputs.map(s => s.npv)),
      "Receita Estado": Math.max(...scenarioOutputs.map(s => s.totalStateRevenue)),
      "Produção 2035": Math.max(...scenarioOutputs.map(s => s.projections[9]?.production || 0)),
      IRR: Math.max(...scenarioOutputs.map(s => s.irr)),
      "Custo/bbl": Math.max(...scenarioOutputs.map(s => s.avgCostPerBarrel)),
    };
    return metrics.map(m => {
      const row: Record<string, string | number> = { metric: m };
      scenarioOutputs.forEach(s => {
        let val = 0;
        const max = maxVals[m as keyof typeof maxVals] || 1;
        if (m === "NPV") val = (s.npv / max) * 100;
        else if (m === "Receita Estado") val = (s.totalStateRevenue / max) * 100;
        else if (m === "Produção 2035") val = ((s.projections[9]?.production || 0) / max) * 100;
        else if (m === "IRR") val = (s.irr / max) * 100;
        else if (m === "Custo/bbl") val = (1 - s.avgCostPerBarrel / max) * 100; // inverted
        row[s.scenario.name] = Math.max(0, Math.round(val));
      });
      return row;
    });
  }, [scenarioOutputs]);

  const totals = useMemo(() => ({
    current: blockBreakdown.reduce((s, b) => s + b.current, 0),
    projected: blockBreakdown.reduce((s, b) => s + b.projected, 0),
    revenue: blockBreakdown.reduce((s, b) => s + b.revenue, 0),
  }), [blockBreakdown]);

  const currentTotal = verifiedBlocks.reduce((s, b) => s + b.dailyProduction, 0);
  const projected2029 = (projectionData[4] as Record<string, number>)?.[activeScenario] || 0;
  const fiscalMultiplier = oilPrice[0];

  // ── Price sensitivity ──
  const sensitivityData = useMemo(() => {
    const proj = (projectionData[4] as Record<string, number>)?.[activeScenario] || 0;
    const prices = Array.from({ length: 17 }, (_, i) => 40 + i * 5);
    return prices.map(price => ({
      price,
      priceLabel: `$${price}`,
      revenue: (proj * 365 * price) / 1e9,
    }));
  }, [activeScenario, projectionData]);

  return (
    <div className="space-y-6 2xl:space-y-8">

      {/* ── Executive Insights Card ── */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Resumo Executivo — Análise de Cenários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {insights.map((text, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {text}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* ── Scenario Selector + Price Slider ── */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex gap-2">
          {scenarios.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeScenario === s.id
                  ? "glass-card border border-primary/50 text-foreground glow-primary"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">Brent</span>
          <Slider value={oilPrice} onValueChange={setOilPrice} min={40} max={120} step={5} className="flex-1" />
          <span className="text-sm font-mono font-bold text-primary min-w-[4rem] text-right">${oilPrice[0]}/bbl</span>
        </div>
      </div>

      {/* ── Scenario Comparison Table with Deltas ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-primary" />
            Comparação entre Cenários
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Variações (Δ) calculadas em relação ao cenário de Continuidade (base).
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] uppercase tracking-wider">
                  <TableHead>Cenário</TableHead>
                  <TableHead className="text-right">NPV</TableHead>
                  <TableHead className="text-right">Δ NPV</TableHead>
                  <TableHead className="text-right">Receita Estado</TableHead>
                  <TableHead className="text-right">Δ Receita</TableHead>
                  <TableHead className="text-right">IRR</TableHead>
                  <TableHead className="text-right">Prod. 2030</TableHead>
                  <TableHead className="text-right">Prod. 2035</TableHead>
                  <TableHead className="text-right">Prod. 2040</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarioComparison.map(s => (
                  <TableRow key={s.name} className="text-xs">
                    <TableCell className="font-medium">
                      <span className="mr-1.5">{s.icon}</span>{s.name}
                    </TableCell>
                    <TableCell className="text-right font-mono">{fmtUSD(s.npv)}</TableCell>
                    <TableCell className={`text-right font-mono font-semibold ${s.deltaNPV > 0 ? "text-success" : s.deltaNPV < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {s.deltaNPV === 0 ? "—" : `${s.deltaNPV > 0 ? "+" : ""}${fmtUSD(s.deltaNPV)}`}
                    </TableCell>
                    <TableCell className="text-right font-mono">{fmtUSD(s.stateRevenue)}</TableCell>
                    <TableCell className={`text-right font-mono font-semibold ${s.deltaRevenue > 0 ? "text-success" : s.deltaRevenue < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {s.deltaRevenue === 0 ? "—" : `${s.deltaRevenue > 0 ? "+" : ""}${fmtUSD(s.deltaRevenue)}`}
                    </TableCell>
                    <TableCell className="text-right font-mono">{s.irr.toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-mono">{(s.production2030 / 1000).toFixed(0)}k</TableCell>
                    <TableCell className="text-right font-mono">{(s.production2035 / 1000).toFixed(0)}k</TableCell>
                    <TableCell className="text-right font-mono">{(s.production2040 / 1000).toFixed(0)}k</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Charts Row: Radar + Sensitivity Tornado ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Comparison */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Perfil Comparativo dos Cenários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  {scenarioOutputs.slice(0, 4).map(s => (
                    <Radar
                      key={s.scenario.id}
                      name={s.scenario.name}
                      dataKey={s.scenario.name}
                      stroke={s.scenario.color}
                      fill={s.scenario.color}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sensitivity Tornado */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Análise de Sensibilidade — Impacto no NPV Nacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sensitivityTornado} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => fmtUSD(v)} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={95} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number) => [fmtUSD(v), "Δ NPV"]}
                  />
                  <Bar dataKey="delta" barSize={14} radius={[0, 4, 4, 0]}>
                    {sensitivityTornado.map((entry, i) => (
                      <Cell key={i} fill={entry.delta >= 0 ? "hsl(var(--success))" : "hsl(var(--danger))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Scenario NPV & Revenue Stacked Bars ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            NPV vs Receita Estado por Cenário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioComparison} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmtUSD(v)} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  formatter={(v: number) => [fmtUSD(v)]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="npv" name="NPV" fill="hsl(200, 45%, 28%)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="stateRevenue" name="Receita Estado" fill="hsl(152, 50%, 38%)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── 10-Year Production Projection ── */}
      <ChartWrapper title="Projecção de Produção a 10 Anos (BOPD)" icon={<TrendingUp className="w-4 h-4 text-primary" />}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={60} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} stroke="hsl(var(--border))" />
            <RechartsTooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [value.toLocaleString() + " BOPD"]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {scenarios.map(s => (
              <Line key={s.id} type="monotone" dataKey={s.id} stroke={s.color}
                strokeWidth={activeScenario === s.id ? 3 : 1}
                opacity={activeScenario === s.id ? 1 : 0.3}
                dot={activeScenario === s.id} name={s.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* ── Block Contribution Stacked ── */}
      <ChartWrapper title={`Contribuição por Bloco — ${scenarios.find(s => s.id === activeScenario)?.label}`} icon={<BarChart3 className="w-4 h-4 text-primary" />}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stackedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={60} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} stroke="hsl(var(--border))" />
            <RechartsTooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }}
              formatter={(value: number, name: string) => {
                const block = verifiedBlocks.find(b => b.id === name);
                return [value.toLocaleString() + " BOPD", block?.name || name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} formatter={(v: string) => verifiedBlocks.find(b => b.id === v)?.name || v} />
            {activeBlocks.map((b) => (
              <Area key={b.id} type="monotone" dataKey={b.id} stackId="1"
                fill={BLOCK_COLORS[verifiedBlocks.indexOf(b)]} stroke={BLOCK_COLORS[verifiedBlocks.indexOf(b)]} fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* ── Price Sensitivity ── */}
      <ChartWrapper title={`Sensibilidade da Receita ao Preço do Barril — 2029 (${scenarios.find(s => s.id === activeScenario)?.label})`} icon={<DollarSign className="w-4 h-4 text-primary" />}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sensitivityData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="priceLabel" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={60} tickFormatter={v => `$${v.toFixed(1)}B`} stroke="hsl(var(--border))" />
            <RechartsTooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [`$${value.toFixed(2)}B`, "Receita Anual"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGradient)" dot={(props: any) => {
              const isActive = props.payload.price === oilPrice[0];
              if (!isActive) return <circle key={props.key} cx={props.cx} cy={props.cy} r={3} fill="hsl(var(--primary))" fillOpacity={0.4} stroke="none" />;
              return <circle key={props.key} cx={props.cx} cy={props.cy} r={6} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} />;
            }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIBox icon={Activity} label="Produção Actual" value={`${(currentTotal / 1000).toFixed(0)}k`} sub="BOPD" />
        <KPIBox icon={TrendingUp} label={`Projecção 2029 (${scenarios.find(s => s.id === activeScenario)?.label})`} value={`${(projected2029 / 1000).toFixed(0)}k`} sub="BOPD" color="text-primary" />
        <KPIBox icon={DollarSign} label="Receita Est. Anual (2029)" value={`$${((projected2029 * 365 * fiscalMultiplier) / 1e9).toFixed(1)}B`} sub={`a $${fiscalMultiplier}/bbl`} color="text-success" />
        <KPIBox icon={Gauge} label="Variação vs Actual" value={`${currentTotal > 0 ? ((projected2029 - currentTotal) / currentTotal * 100).toFixed(1) : 0}%`} sub="produção" color={projected2029 >= currentTotal ? "text-success" : "text-destructive"} />
      </div>

      {/* ── Block Breakdown Table ── */}
      <Card className="glass-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Breakdown por Bloco — 2029 ({scenarios.find(s => s.id === activeScenario)?.label})</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Bloco</TableHead>
                  <TableHead className="text-xs">Operador</TableHead>
                  <TableHead className="text-xs text-right">Actual (BOPD)</TableHead>
                  <TableHead className="text-xs text-right">2029 (BOPD)</TableHead>
                  <TableHead className="text-xs text-right">Variação</TableHead>
                  <TableHead className="text-xs text-right">Receita (MMUSD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockBreakdown.map(row => (
                  <TableRow key={row.id} className="cursor-pointer hover:bg-primary/5 text-xs" onClick={() => navigate(`/block/${row.id}`)}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: BLOCK_COLORS[verifiedBlocks.findIndex(b => b.id === row.id)] }} />
                      {row.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.operator}</TableCell>
                    <TableCell className="text-right font-mono">{row.current.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{row.projected.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono font-semibold ${row.change >= 0 ? "text-success" : "text-destructive"}`}>
                      {row.change >= 0 ? "+" : ""}{row.change.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono">${row.revenue.toFixed(0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="text-xs font-bold" colSpan={2}>Total</TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold">{totals.current.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold">{totals.projected.toLocaleString()}</TableCell>
                  <TableCell className={`text-xs text-right font-mono font-bold ${totals.current > 0 && ((totals.projected - totals.current) / totals.current) >= 0 ? "text-success" : "text-destructive"}`}>
                    {totals.current > 0 ? `${((totals.projected - totals.current) / totals.current * 100) >= 0 ? "+" : ""}${((totals.projected - totals.current) / totals.current * 100).toFixed(1)}%` : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold">${totals.revenue.toFixed(0)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Helper: run scenario with national baseline ──
function runScenarioForNational(scenario: ScenarioDefinition): ScenarioOutput {
  return runScenario({ ...scenario });
}

// ── Sub-component ──
function KPIBox({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub: string; color?: string;
}) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <div className={`text-2xl font-bold font-mono ${color || "text-foreground"}`}>{value}</div>
        <div className="text-[10px] text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}
