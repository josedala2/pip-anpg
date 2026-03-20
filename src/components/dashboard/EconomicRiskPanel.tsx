import { useMemo } from "react";
import { oilBlocks } from "@/data/angolaBlocks";
import {
  calculateAllEconomicScores,
  classificationColors,
  type EconomicScoreResult,
  type EconomicClassification,
} from "@/lib/economicScoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip, Cell, ReferenceLine,
} from "recharts";
import { AlertTriangle, TrendingDown, DollarSign, ShieldOff } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { tooltipDescriptions } from "@/lib/tooltipDescriptions";

const BRENT_PRICE = 78;

export const EconomicRiskPanel = () => {
  const data = useMemo(() => {
    const scores = calculateAllEconomicScores(oilBlocks);
    const producing = scores.filter(s => s.dailyProduction > 0);

    // High OPEX blocks
    const highOpex = producing
      .filter(s => s.opexPerBarrel > 20)
      .sort((a, b) => b.opexPerBarrel - a.opexPerBarrel);

    // Near break-even
    const nearBreakeven = producing
      .filter(s => s.economicMargin < 30)
      .sort((a, b) => a.economicMargin - b.economicMargin);

    // Negative/low margin
    const negativeMargin = producing
      .filter(s => s.economicMargin < 10)
      .sort((a, b) => a.economicMargin - b.economicMargin);

    // High abandonment cost
    const highAbandonment = oilBlocks
      .filter(b => b.economicData?.abandonment && b.economicData.abandonment.total > 500)
      .map(b => ({
        name: b.name,
        total: b.economicData!.abandonment!.total,
        funded: b.economicData!.abandonment!.fundingDeposited,
        gap: b.economicData!.abandonment!.total - b.economicData!.abandonment!.fundingDeposited,
        gapPercent: ((b.economicData!.abandonment!.total - b.economicData!.abandonment!.fundingDeposited) / b.economicData!.abandonment!.total * 100),
      }))
      .sort((a, b) => b.gap - a.gap);

    // Scatter: breakeven vs production (bubble = risk)
    const scatterData = producing.map(s => ({
      name: s.blockName.replace("Block ", "B").replace(" (Área A, B)", ""),
      breakeven: s.breakeven,
      production: s.dailyProduction / 1000,
      score: s.totalScore,
      classification: s.classification,
      margin: s.economicMargin,
    }));

    // Critical count
    const criticalCount = producing.filter(s => s.classification === "Activo de Alto Risco" || s.classification === "Activo Inviável").length;
    const atRiskProduction = producing
      .filter(s => s.economicMargin < 20)
      .reduce((s, r) => s + r.dailyProduction, 0);

    return { scores, producing, highOpex, nearBreakeven, negativeMargin, highAbandonment, scatterData, criticalCount, atRiskProduction };
  }, []);

  return (
    <div className="space-y-4">
      {/* Alert KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <RiskKPI
          icon={AlertTriangle}
          label="Activos Críticos"
          value={`${data.criticalCount}`}
          sub="Alto Risco + Inviável"
          severity={data.criticalCount > 0 ? "danger" : "success"}
          tooltip={tooltipDescriptions["Activos Críticos"]}
        />
        <RiskKPI
          icon={TrendingDown}
          label="Próximos do Break-even"
          value={`${data.nearBreakeven.length}`}
          sub="Margem < 30%"
          severity={data.nearBreakeven.length > 3 ? "warning" : "success"}
          tooltip={tooltipDescriptions["Próximos do Break-even"]}
        />
        <RiskKPI
          icon={DollarSign}
          label="Produção em Risco"
          value={`${(data.atRiskProduction / 1000).toFixed(0)}k BOPD`}
          sub="Margem < 20%"
          severity={data.atRiskProduction > 50000 ? "danger" : "warning"}
          tooltip={tooltipDescriptions["Produção em Risco (BOPD)"]}
        />
        <RiskKPI
          icon={ShieldOff}
          label="OPEX Elevado"
          value={`${data.highOpex.length}`}
          sub="Acima $20/bbl"
          severity={data.highOpex.length > 5 ? "warning" : "success"}
          tooltip={tooltipDescriptions["OPEX Elevado"]}
        />
      </div>

      {/* Risk scatter plot */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Mapa de Risco Económico — Break-even vs Produção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis
                  type="number"
                  dataKey="production"
                  name="Produção"
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                  label={{ value: "Produção (kBOPD)", position: "bottom", fontSize: 10, className: "fill-muted-foreground" }}
                />
                <YAxis
                  type="number"
                  dataKey="breakeven"
                  name="Break-even"
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                  label={{ value: "Break-even ($/bbl)", angle: -90, position: "insideLeft", fontSize: 10, className: "fill-muted-foreground" }}
                />
                <ReferenceLine y={BRENT_PRICE} stroke="hsl(0, 65%, 42%)" strokeDasharray="5 5" label={{ value: `Brent $${BRENT_PRICE}`, fontSize: 10, fill: "hsl(0, 65%, 42%)" }} />
                <ReferenceLine y={BRENT_PRICE * 0.8} stroke="hsl(38, 75%, 48%)" strokeDasharray="3 3" label={{ value: "80% Brent", fontSize: 9, fill: "hsl(38, 75%, 48%)" }} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  formatter={(v: number, name: string) => {
                    if (name === "Produção") return [`${v.toFixed(1)}k BOPD`, name];
                    if (name === "Break-even") return [`$${v.toFixed(1)}/bbl`, name];
                    return [v, name];
                  }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""}
                />
                <Scatter data={data.scatterData} fill="hsl(200, 45%, 28%)">
                  {data.scatterData.map((entry, i) => {
                    const color = entry.score >= 80 ? "hsl(152, 50%, 38%)"
                      : entry.score >= 60 ? "hsl(199, 70%, 45%)"
                      : entry.score >= 40 ? "hsl(38, 75%, 48%)"
                      : entry.score >= 20 ? "hsl(280, 50%, 55%)"
                      : "hsl(0, 65%, 42%)";
                    return <Cell key={i} fill={color} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            {[
              { label: "Estratégico", color: "bg-success" },
              { label: "Rentável", color: "bg-[hsl(var(--chart-5))]" },
              { label: "Observação", color: "bg-warning" },
              { label: "Alto Risco", color: "bg-[hsl(var(--chart-4))]" },
              { label: "Inviável", color: "bg-danger" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                <span className="text-[10px] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical assets list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Near break-even */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Concessões Próximas do Break-even
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.nearBreakeven.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma concessão em risco imediato.</p>
            ) : (
              data.nearBreakeven.slice(0, 8).map(s => (
                <RiskAssetRow key={s.blockId} score={s} />
              ))
            )}
          </CardContent>
        </Card>

        {/* High abandonment gap */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldOff className="w-4 h-4 text-danger" />
              Risco de Abandono Sub-financiado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.highAbandonment.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados de abandono disponíveis.</p>
            ) : (
              data.highAbandonment.map(a => (
                <div key={a.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
                  <div>
                    <div className="text-xs font-semibold">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Total: ${a.total.toLocaleString()}MM · Depositado: ${a.funded.toLocaleString()}MM
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-danger">${a.gap.toLocaleString()}MM</div>
                    <div className="text-[10px] text-muted-foreground">Gap: {a.gapPercent.toFixed(0)}%</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function RiskKPI({ icon: Icon, label, value, sub, severity }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  severity: "success" | "warning" | "danger";
}) {
  const colors = {
    success: "border-success/20 bg-success/5",
    warning: "border-warning/20 bg-warning/5",
    danger: "border-danger/20 bg-danger/5",
  };
  const textColors = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  };

  return (
    <div className={`rounded-lg border p-3 ${colors[severity]}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${textColors[severity]}`} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function RiskAssetRow({ score: s }: { score: EconomicScoreResult }) {
  const cfg = classificationColors[s.classification];
  const marginColor = s.economicMargin < 10 ? "text-danger" : s.economicMargin < 20 ? "text-warning" : "text-muted-foreground";

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold truncate">{s.blockName}</span>
          <Badge variant="outline" className={`text-[9px] ${cfg.text} ${cfg.bg} border-0 shrink-0`}>
            {s.classification}
          </Badge>
        </div>
        <div className="text-[10px] text-muted-foreground">{s.operator} · {(s.dailyProduction / 1000).toFixed(1)}k BOPD</div>
      </div>
      <div className="text-right shrink-0 ml-3">
        <div className={`text-xs font-bold tabular-nums ${marginColor}`}>{s.economicMargin.toFixed(0)}% margem</div>
        <div className="text-[10px] text-muted-foreground">BE: ${s.breakeven.toFixed(1)}/bbl</div>
      </div>
    </div>
  );
}
