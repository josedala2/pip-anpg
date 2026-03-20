import { useMemo } from "react";
import { oilBlocks } from "@/data/angolaBlocks";
import {
  getNationalEconomicKPIs,
  classificationColors,
  type EconomicClassification,
} from "@/lib/economicScoring";
import {
  runAllScenarios,
  PREDEFINED_SCENARIOS,
  type ScenarioOutput,
} from "@/lib/scenarioEngine";
import {
  calculateAllScores,
  type StrategicClassification,
} from "@/lib/strategicScoring";
import { evaluateForecastAlerts, type ForecastAlert } from "@/lib/alertsEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell, PieChart, Pie,
  AreaChart, Area, ReferenceLine,
} from "recharts";
import {
  Crown, DollarSign, TrendingUp, ShieldAlert, Activity,
  AlertTriangle, Target, Gauge, ArrowRight, Bell,
  Building2, BarChart3, Layers,
} from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { tooltipDescriptions } from "@/lib/tooltipDescriptions";

// ── Helpers ──

function fmtUSD(mmusd: number): string {
  const abs = Math.abs(mmusd);
  if (abs >= 1000) return `$${(mmusd / 1000).toFixed(1)}B`;
  return `$${Math.round(mmusd)}MM`;
}

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

const ECON_CLASS_COLORS: Record<EconomicClassification, string> = {
  "Activo Estratégico": "hsl(152, 50%, 38%)",
  "Activo Rentável": "hsl(199, 70%, 45%)",
  "Activo em Observação": "hsl(38, 75%, 48%)",
  "Activo de Alto Risco": "hsl(280, 50%, 55%)",
  "Activo Inviável": "hsl(0, 65%, 42%)",
};

const SEV_STYLES: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-danger/10", text: "text-danger" },
  high: { bg: "bg-warning/10", text: "text-warning" },
  medium: { bg: "bg-primary/10", text: "text-primary" },
  low: { bg: "bg-muted/20", text: "text-muted-foreground" },
};

export const ExecutiveBoardPanel = () => {
  // ── Data aggregation from all modules ──
  const kpis = useMemo(() => getNationalEconomicKPIs(oilBlocks), []);
  const scenarioOutputs = useMemo(() => runAllScenarios(), []);
  const strategicScores = useMemo(() => calculateAllScores(oilBlocks), []);
  const forecastAlerts = useMemo(() => evaluateForecastAlerts(), []);

  const totalProduction = oilBlocks.reduce((s, b) => s + b.dailyProduction, 0);
  const producingBlocks = oilBlocks.filter(b => b.dailyProduction > 0).length;

  // Best & worst scenarios
  const bestScenario = scenarioOutputs.reduce((a, b) => a.npv > b.npv ? a : b);
  const worstScenario = scenarioOutputs.reduce((a, b) => a.npv < b.npv ? a : b);
  const baseScenario = scenarioOutputs.find(s => s.scenario.id === "continuidade")!;

  // Strategic classification distribution
  const stratDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    strategicScores.forEach(s => {
      map[s.classification] = (map[s.classification] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [strategicScores]);

  // Economic classification distribution
  const econDistribution = useMemo(() => {
    return Object.entries(kpis.classificationCounts)
      .filter(([_, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [kpis]);

  // Top risk concessions
  const topRisks = useMemo(() => {
    return [...kpis.scores]
      .filter(s => s.classification === "Activo de Alto Risco" || s.classification === "Activo Inviável")
      .sort((a, b) => a.totalScore - b.totalScore)
      .slice(0, 5);
  }, [kpis]);

  // Top performing
  const topPerformers = useMemo(() => {
    return [...kpis.scores]
      .filter(s => s.classification === "Activo Estratégico" || s.classification === "Activo Rentável")
      .sort((a, b) => b.npvTotal - a.npvTotal)
      .slice(0, 5);
  }, [kpis]);

  // Scenario comparison data for mini bar chart
  const scenarioCompare = useMemo(() => {
    return scenarioOutputs.map(o => ({
      name: o.scenario.name,
      npv: o.npv,
      stateRevenue: o.totalStateRevenue,
      color: o.scenario.color,
    }));
  }, [scenarioOutputs]);

  // Production projection from base scenario (5yr summary)
  const productionForecast = useMemo(() => {
    return baseScenario.projections
      .filter((_, i) => i % 3 === 0 || i === baseScenario.projections.length - 1)
      .map(p => ({
        year: p.year,
        production: Math.round(p.production / 1000),
        revenue: p.revenue,
      }));
  }, [baseScenario]);

  // Radar: national health across 6 dimensions
  const healthRadar = useMemo(() => {
    const avgStrategic = strategicScores.reduce((s, x) => s + x.totalScore, 0) / (strategicScores.length || 1);
    const avgEconomic = kpis.scores.reduce((s, x) => s + x.totalScore, 0) / (kpis.scores.length || 1);
    const viabilityRatio = totalProduction > 0 ? (kpis.viableProduction / totalProduction) * 100 : 0;
    const scenarioHealth = baseScenario.npv > 0 ? Math.min(100, (baseScenario.npv / (bestScenario.npv || 1)) * 100) : 20;
    const fiscalStrength = Math.min(100, (kpis.totalStateRevenue / 5000) * 100);
    const riskScore = 100 - (forecastAlerts.filter(a => a.severity === "critical").length * 20);

    return [
      { dimension: "Score Estratégico", value: Math.round(avgStrategic) },
      { dimension: "Score Económico", value: Math.round(avgEconomic) },
      { dimension: "Viabilidade Produção", value: Math.round(viabilityRatio) },
      { dimension: "Cenário Base", value: Math.round(Math.max(0, scenarioHealth)) },
      { dimension: "Receita Fiscal", value: Math.round(Math.max(0, fiscalStrength)) },
      { dimension: "Risco Controlado", value: Math.round(Math.max(0, riskScore)) },
    ];
  }, [strategicScores, kpis, baseScenario, bestScenario, forecastAlerts, totalProduction]);

  const criticalAlerts = forecastAlerts.filter(a => a.severity === "critical");
  const highAlerts = forecastAlerts.filter(a => a.severity === "high");

  return (
    <div className="space-y-5">
      {/* ── Header Banner ── */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <Crown className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-base font-bold text-foreground">Painel Executivo Integrado</h2>
          <p className="text-xs text-muted-foreground">Visão consolidada para o Conselho de Administração — {producingBlocks} concessões activas</p>
        </div>
        {criticalAlerts.length > 0 && (
          <Badge variant="destructive" className="ml-auto text-[10px] animate-pulse">
            {criticalAlerts.length} alerta{criticalAlerts.length > 1 ? "s" : ""} crítico{criticalAlerts.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* ── Row 1: Headline KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <KPITile icon={<Activity className="w-4 h-4" />} label="Produção Nacional" value={`${(totalProduction / 1000).toFixed(0)}k`} unit="BOPD" />
        <KPITile icon={<DollarSign className="w-4 h-4" />} label="Receita Estado" value={fmtUSD(kpis.totalStateRevenue)} positive />
        <KPITile icon={<TrendingUp className="w-4 h-4" />} label="NPV Nacional" value={fmtUSD(kpis.totalNPV)} positive={kpis.totalNPV >= 0} />
        <KPITile icon={<Gauge className="w-4 h-4" />} label="OPEX Médio" value={`$${kpis.avgOpexPerBarrel.toFixed(1)}`} unit="/bbl" />
        <KPITile icon={<Target className="w-4 h-4" />} label="Break-even" value={`$${kpis.avgBreakeven.toFixed(0)}`} unit="/bbl" />
        <KPITile icon={<ShieldAlert className="w-4 h-4" />} label="Em Risco" value={`${(kpis.atRiskProduction / 1000).toFixed(0)}k`} unit="BOPD" negative />
        <KPITile icon={<TrendingUp className="w-4 h-4" />} label="Melhor NPV" value={fmtUSD(bestScenario.npv)} subtitle={bestScenario.scenario.name} positive />
        <KPITile icon={<Bell className="w-4 h-4" />} label="Alertas Forecast" value={`${forecastAlerts.length}`} negative={criticalAlerts.length > 0} />
      </div>

      {/* ── Row 2: Health Radar + Classification Distributions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* National Health Radar */}
        <Card className="border-border/40">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" />
              Saúde Nacional — 6 Dimensões
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={healthRadar} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Economic Classification */}
        <Card className="border-border/40">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Classificação Económica
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={econDistribution}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${value}`}
                    labelLine={false}
                  >
                    {econDistribution.map((entry) => (
                      <Cell key={entry.name} fill={ECON_CLASS_COLORS[entry.name as EconomicClassification] || "hsl(var(--muted))"} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Classification */}
        <Card className="border-border/40">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Classificação Estratégica
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stratDistribution}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${value}`}
                    labelLine={false}
                  >
                    {stratDistribution.map((entry) => (
                      <Cell key={entry.name} fill={CLASS_COLORS[entry.name as StrategicClassification] || "hsl(var(--muted))"} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Scenarios + Production Forecast ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scenario NPV vs State Revenue */}
        <Card className="border-border/40">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Cenários — NPV vs Receita Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioCompare} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                    tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}B` : `$${v}MM`}
                  />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" width={100} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number) => [fmtUSD(v), ""]}
                  />
                  <Bar dataKey="npv" name="NPV" fill="hsl(var(--primary))" fillOpacity={0.85} barSize={10} radius={[0, 3, 3, 0]} />
                  <Bar dataKey="stateRevenue" name="Receita Estado" fill="hsl(152, 50%, 38%)" fillOpacity={0.85} barSize={10} radius={[0, 3, 3, 0]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Production Trajectory */}
        <Card className="border-border/40">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Trajectória de Produção (Cenário Base)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={baseScenario.projections.map(p => ({
                  year: p.year,
                  production: Math.round(p.production / 1000),
                  revenue: p.revenue,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis yAxisId="prod" tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `${v}k`} />
                  <YAxis yAxisId="rev" orientation="right" tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `$${v}`} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  />
                  <Area yAxisId="prod" type="monotone" dataKey="production" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} name="Produção (kBOPD)" />
                  <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="hsl(152, 50%, 38%)" fill="hsl(152, 50%, 38%)" fillOpacity={0.08} strokeWidth={2} name="Receita (MMUSD)" />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Top Performers + Top Risks + Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Performers */}
        <Card className="border-border/40">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-success" />
              Top 5 Concessões por Valor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {topPerformers.map((s, i) => (
                <div key={s.blockId} className="flex items-center gap-2 p-2 rounded-lg bg-success/5 border border-success/10">
                  <span className="text-xs font-bold text-success w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{s.blockName}</div>
                    <div className="text-[10px] text-muted-foreground">{s.operator} · {(s.dailyProduction / 1000).toFixed(0)}k BOPD</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-success">{fmtUSD(s.npvTotal)}</div>
                    <div className="text-[10px] text-muted-foreground">Score {s.totalScore}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Risks */}
        <Card className="border-border/40">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-danger" />
              Concessões em Risco
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {topRisks.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma concessão em risco elevado</p>
              ) : topRisks.map((s, i) => (
                <div key={s.blockId} className="flex items-center gap-2 p-2 rounded-lg bg-danger/5 border border-danger/10">
                  <span className="text-xs font-bold text-danger w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{s.blockName}</div>
                    <div className="text-[10px] text-muted-foreground">{s.operator}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-[9px] border-danger/30 text-danger">{s.classification}</Badge>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Score {s.totalScore}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forecast Alerts Summary */}
        <Card className="border-border/40">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Alertas Preditivos ({forecastAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {forecastAlerts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Sem alertas de previsão activos</p>
              ) : forecastAlerts.slice(0, 8).map((alert, i) => {
                const sev = SEV_STYLES[alert.severity] || SEV_STYLES.low;
                return (
                  <div key={i} className={`p-2 rounded-lg border ${sev.bg} border-border/20`}>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className={`text-[9px] ${sev.text} shrink-0`}>
                        {alert.severity === "critical" ? "CRÍTICO" : alert.severity === "high" ? "ALTO" : alert.severity}
                      </Badge>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-foreground">{alert.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{alert.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {forecastAlerts.length > 8 && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  +{forecastAlerts.length - 8} alertas adicionais
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 5: Strategic Recommendations ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            Síntese Executiva — Recomendações Prioritárias
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {strategicScores
              .filter(s => s.urgency === "Imediata" || s.urgency === "Elevada")
              .slice(0, 6)
              .map(s => (
                <div key={s.blockId} className="p-3 rounded-lg border border-border/30 bg-muted/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{s.blockName}</span>
                    <Badge
                      variant="outline"
                      className="text-[9px]"
                      style={{ borderColor: CLASS_COLORS[s.classification], color: CLASS_COLORS[s.classification] }}
                    >
                      {s.classification}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[9px] ${s.urgency === "Imediata" ? "border-danger/50 text-danger" : "border-warning/50 text-warning"}`}>
                      {s.urgency}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{s.operator}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{s.recommendation}</p>
                  <div className="flex items-center gap-1 text-[10px] text-primary">
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-semibold">{s.expectedImpact}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── KPI Tile ──

function KPITile({
  icon,
  label,
  value,
  unit,
  subtitle,
  positive,
  negative,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  subtitle?: string;
  positive?: boolean;
  negative?: boolean;
}) {
  const color = negative ? "text-danger" : positive ? "text-success" : "text-foreground";
  return (
    <Card className="border-border/40">
      <CardContent className="p-3 space-y-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">{icon}<span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span></div>
        <div className={`text-lg font-bold tabular-nums ${color}`}>
          {value}{unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>}
        </div>
        {subtitle && <div className="text-[10px] text-muted-foreground truncate">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}
