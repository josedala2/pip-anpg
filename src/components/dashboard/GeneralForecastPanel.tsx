import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { oilBlocks } from "@/data/angolaBlocks";
import {
  runAllScenarios, PREDEFINED_SCENARIOS, type ScenarioOutput,
} from "@/lib/scenarioEngine";
import { getNationalEconomicKPIs, classificationColors, type EconomicClassification } from "@/lib/economicScoring";
import { calculateAllScores, classificationConfig, type StrategicClassification, type StrategicScore } from "@/lib/strategicScoring";
import { evaluateAlerts, evaluateForecastAlerts, type Alert } from "@/lib/alertsEngine";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Legend, Tooltip as RechartsTooltip, BarChart, Bar, Cell,
} from "recharts";
import {
  Activity, DollarSign, TrendingUp, TrendingDown, ShieldAlert,
  Target, Gauge, Layers, AlertTriangle, Lightbulb, BarChart3, Clock,
} from "lucide-react";

const fmtUSD = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${v.toFixed(0)}MM`;
const fmtK = (v: number) => `${(v / 1000).toFixed(0)}k`;

export const GeneralForecastPanel = () => {
  const scenarioOutputs = useMemo(() => runAllScenarios(), []);
  const economicKPIs = useMemo(() => getNationalEconomicKPIs(oilBlocks), []);
  const strategicScores = useMemo(() => calculateAllScores(oilBlocks), []);
  const operationalAlerts = useMemo(() => evaluateAlerts(), []);
  const forecastAlerts = useMemo(() => evaluateForecastAlerts(), []);
  const allAlerts = useMemo(() => [...operationalAlerts, ...forecastAlerts], [operationalAlerts, forecastAlerts]);

  const baseScenario = scenarioOutputs.find(s => s.scenario.id === "continuidade")!;
  const bestScenario = scenarioOutputs.reduce((a, b) => a.npv > b.npv ? a : b);
  const worstScenario = scenarioOutputs.reduce((a, b) => a.npv < b.npv ? a : b);

  const currentProduction = oilBlocks.reduce((s, b) => s + b.dailyProduction, 0);

  // ── Temporal heatmap data (years x metrics) ──
  const heatmapYears = [2026, 2028, 2030, 2032, 2035, 2038, 2040];
  const temporalData = useMemo(() => {
    return heatmapYears.map(year => {
      const idx = year - 2026;
      const base = baseScenario.projections[idx];
      const best = bestScenario.projections[idx];
      return {
        year,
        prodBase: base?.production || 0,
        prodBest: best?.production || 0,
        revBase: base?.stateRevenue || 0,
        revBest: best?.stateRevenue || 0,
        costBase: base ? (base.opex * 1e6) / (base.production * 365 || 1) : 0,
      };
    });
  }, [baseScenario, bestScenario]);

  // ── Multi-metric chart ──
  const multiMetricData = useMemo(() => {
    return baseScenario.projections.map((p, i) => ({
      year: p.year,
      "Produção (kBOPD)": Math.round(p.production / 1000),
      "Receita Estado (MMUSD)": p.stateRevenue,
      "OPEX (MMUSD)": p.opex,
      "Cash Flow (MMUSD)": p.netCashFlow,
    }));
  }, [baseScenario]);

  // ── Block synthesis table ──
  const blockSynthesis = useMemo(() => {
    return oilBlocks
      .filter(b => b.dailyProduction > 0)
      .map(b => {
        const ecoScore = economicKPIs.scores.find(s => s.blockId === b.id);
        const strScore = strategicScores.find(s => s.blockId === b.id);
        const blockAlerts = allAlerts.filter(a => a.blockId === b.id);
        const hasCritical = blockAlerts.some(a => a.severity === "critical");

        // Find best/worst scenario for this block
        const scenarioNames = PREDEFINED_SCENARIOS.map(s => s.name);

        return {
          id: b.id,
          name: b.name,
          operator: b.operator,
          production: b.dailyProduction,
          projection2035: Math.round(b.projections.base[9] || b.projections.base[b.projections.base.length - 1] || 0),
          economicClass: ecoScore?.classification || "Activo em Observação" as EconomicClassification,
          strategicClass: strScore?.classification || "Monitorar" as StrategicClassification,
          economicScore: ecoScore?.totalScore || 0,
          strategicScore: strScore?.totalScore || 0,
          alerts: blockAlerts.length,
          hasCritical,
          recommendation: strScore?.recommendation || ecoScore?.recommendation || "",
        };
      })
      .sort((a, b) => b.economicScore - a.economicScore);
  }, [economicKPIs, strategicScores, allAlerts]);

  // ── Top risks & opportunities ──
  const topRisks = useMemo(() => {
    return allAlerts
      .filter(a => a.severity === "critical" || a.severity === "high")
      .slice(0, 5);
  }, [allAlerts]);

  const topOpportunities = useMemo(() => {
    return economicKPIs.scores
      .filter(s => s.classification === "Activo Estratégico" || s.classification === "Activo Rentável")
      .sort((a, b) => b.npvTotal - a.npvTotal)
      .slice(0, 5)
      .map(s => ({
        blockName: s.blockName,
        npv: s.npvTotal,
        recommendation: s.recommendation,
      }));
  }, [economicKPIs]);

  // ── Priority recommendations ──
  const priorityRecommendations = useMemo(() => {
    return strategicScores
      .filter(s => s.urgency === "Imediata" || s.urgency === "Elevada")
      .sort((a, b) => {
        const urgencyOrder = { "Imediata": 0, "Elevada": 1, "Moderada": 2, "Baixa": 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      })
      .slice(0, 8);
  }, [strategicScores]);

  return (
    <div className="space-y-6">
      {/* ── Macro KPI Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MacroKPI icon={Activity} label="Produção Actual" value={fmtK(currentProduction)} sub="BOPD" />
        <MacroKPI icon={TrendingUp} label="Proj. 2030 (Base)" value={fmtK(baseScenario.projections[4]?.production || 0)} sub="BOPD" />
        <MacroKPI icon={TrendingDown} label="Proj. 2035 (Base)" value={fmtK(baseScenario.projections[9]?.production || 0)} sub="BOPD" />
        <MacroKPI icon={DollarSign} label="Receita Estado Acum." value={fmtUSD(baseScenario.totalStateRevenue)} sub="15 anos (base)" />
        <MacroKPI icon={Target} label="NPV Nacional (Base)" value={fmtUSD(baseScenario.npv)} sub="10% discount" />
        <MacroKPI icon={Gauge} label="NPV Melhor Cenário" value={fmtUSD(bestScenario.npv)} sub={bestScenario.scenario.name} color="text-success" />
        <MacroKPI icon={ShieldAlert} label="Alertas Activos" value={`${allAlerts.length}`} sub={`${allAlerts.filter(a => a.severity === "critical").length} críticos`} color={allAlerts.filter(a => a.severity === "critical").length > 0 ? "text-destructive" : undefined} />
        <MacroKPI icon={Layers} label="Blocos em Risco" value={`${blockSynthesis.filter(b => b.hasCritical).length}`} sub={`de ${blockSynthesis.length}`} color="text-warning" />
      </div>

      {/* ── Multi-Metric Consolidated Chart ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Previsão Consolidada — Produção, Receita, Custos (Cenário Base, 15 Anos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={multiMetricData}>
                <defs>
                  <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200, 45%, 28%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(200, 45%, 28%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 50%, 38%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152, 50%, 38%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="Produção (kBOPD)" stroke="hsl(200, 45%, 28%)" fill="url(#gProd)" strokeWidth={2} />
                <Area type="monotone" dataKey="Receita Estado (MMUSD)" stroke="hsl(152, 50%, 38%)" fill="url(#gRev)" strokeWidth={2} />
                <Area type="monotone" dataKey="OPEX (MMUSD)" stroke="hsl(38, 75%, 48%)" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                <Area type="monotone" dataKey="Cash Flow (MMUSD)" stroke="hsl(280, 50%, 55%)" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Temporal Heatmap ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Mapa Temporal — Evolução por Horizonte
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] uppercase tracking-wider">
                  <TableHead>Métrica</TableHead>
                  {heatmapYears.map(y => <TableHead key={y} className="text-center">{y}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                <HeatmapRow label="Produção Base (kBOPD)" data={temporalData.map(d => d.prodBase / 1000)} maxVal={currentProduction / 1000} />
                <HeatmapRow label="Produção Melhor (kBOPD)" data={temporalData.map(d => d.prodBest / 1000)} maxVal={currentProduction / 1000} />
                <HeatmapRow label="Receita Estado Base (MMUSD)" data={temporalData.map(d => d.revBase)} />
                <HeatmapRow label="Receita Melhor (MMUSD)" data={temporalData.map(d => d.revBest)} />
                <HeatmapRow label="Custo/bbl Base (USD)" data={temporalData.map(d => d.costBase)} inverted />
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Risks & Opportunities Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Risks */}
        <Card className="border-danger/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Top Riscos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topRisks.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem alertas críticos.</p>
            ) : (
              <ul className="space-y-2">
                {topRisks.map(a => (
                  <li key={a.id} className="flex items-start gap-2 text-xs">
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${a.severity === "critical" ? "border-destructive text-destructive" : "border-warning text-warning"}`}>
                      {a.severity === "critical" ? "CRÍTICO" : "ALTO"}
                    </Badge>
                    <div>
                      <span className="font-semibold">{a.blockName}</span>
                      <span className="text-muted-foreground"> — {a.title}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Top Opportunities */}
        <Card className="border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-success" />
              Top Oportunidades por NPV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topOpportunities.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <Badge variant="outline" className="text-[10px] shrink-0 border-success text-success">
                    {fmtUSD(o.npv)}
                  </Badge>
                  <div>
                    <span className="font-semibold">{o.blockName}</span>
                    <span className="text-muted-foreground"> — {o.recommendation}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* ── Block Synthesis Table ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Tabela Sintética — Todos os Blocos em Produção
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] uppercase tracking-wider">
                  <TableHead>Bloco</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead className="text-right">Prod. Actual</TableHead>
                  <TableHead className="text-right">Proj. 2035</TableHead>
                  <TableHead className="text-center">Class. Económica</TableHead>
                  <TableHead className="text-center">Class. Estratégica</TableHead>
                  <TableHead className="text-center">Score Eco.</TableHead>
                  <TableHead className="text-center">Score Estr.</TableHead>
                  <TableHead className="text-center">Alertas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockSynthesis.map(b => {
                  const ecoCfg = classificationColors[b.economicClass];
                  const strCfg = classificationConfig[b.strategicClass];
                  return (
                    <TableRow key={b.id} className="text-xs">
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="text-muted-foreground">{b.operator}</TableCell>
                      <TableCell className="text-right font-mono">{fmtK(b.production)}</TableCell>
                      <TableCell className="text-right font-mono">{b.projection2035 > 0 ? fmtK(b.projection2035) : "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-[9px] border-0 ${ecoCfg?.text || ""} ${ecoCfg?.bg || ""}`}>{b.economicClass}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-[9px] ${strCfg?.color || ""} ${strCfg?.bgColor || ""}`}>{b.strategicClass}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <ScoreDot score={b.economicScore} />
                      </TableCell>
                      <TableCell className="text-center">
                        <ScoreDot score={b.strategicScore} />
                      </TableCell>
                      <TableCell className="text-center">
                        {b.alerts > 0 ? (
                          <Badge variant="outline" className={`text-[10px] ${b.hasCritical ? "border-destructive text-destructive" : "border-warning text-warning"}`}>
                            {b.alerts}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Priority Recommendations ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Recomendações Prioritárias Consolidadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {priorityRecommendations.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem recomendações urgentes.</p>
          ) : (
            <div className="space-y-2">
              {priorityRecommendations.map((r, i) => (
                <div key={r.blockId} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold">{r.blockName}</span>
                      <Badge variant="outline" className={`text-[9px] ${r.urgency === "Imediata" ? "border-destructive text-destructive" : "border-warning text-warning"}`}>
                        {r.urgency}
                      </Badge>
                      <Badge variant="outline" className="text-[9px]">{r.classification}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{r.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ── Sub-components ──

function MacroKPI({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub: string; color?: string;
}) {
  return (
    <div className="rounded-lg border border-border/40 p-3 bg-card/50">
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground truncate">{label}</span>
      </div>
      <div className={`text-lg font-bold font-mono ${color || "text-foreground"}`}>{value}</div>
      <div className="text-[9px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function ScoreDot({ score }: { score: number }) {
  const color = score >= 70 ? "bg-success" : score >= 50 ? "bg-warning" : score >= 30 ? "bg-[hsl(var(--chart-4))]" : "bg-danger";
  return (
    <div className="flex items-center justify-center gap-1">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs font-mono font-bold">{score}</span>
    </div>
  );
}

function HeatmapRow({ label, data, maxVal, inverted }: {
  label: string; data: number[]; maxVal?: number; inverted?: boolean;
}) {
  const max = maxVal || Math.max(...data, 1);
  return (
    <TableRow className="text-xs">
      <TableCell className="font-medium text-[11px] whitespace-nowrap">{label}</TableCell>
      {data.map((v, i) => {
        const ratio = Math.min(v / max, 1);
        const intensity = inverted ? (1 - ratio) : ratio;
        const hue = intensity > 0.6 ? 152 : intensity > 0.3 ? 38 : 0;
        const sat = 50;
        const light = 95 - intensity * 40;
        return (
          <TableCell
            key={i}
            className="text-center font-mono tabular-nums"
            style={{ backgroundColor: `hsl(${hue}, ${sat}%, ${light}%)`, color: intensity > 0.7 ? "hsl(152, 50%, 20%)" : undefined }}
          >
            {v >= 100 ? v.toFixed(0) : v.toFixed(1)}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
