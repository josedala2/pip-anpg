import { useMemo } from "react";
import { oilBlocks } from "@/data/angolaBlocks";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend, Cell,
} from "recharts";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { tooltipDescriptions } from "@/lib/tooltipDescriptions";

const CHART_COLORS = [
  "hsl(200, 45%, 28%)", "hsl(152, 50%, 38%)", "hsl(38, 75%, 48%)",
  "hsl(280, 50%, 55%)", "hsl(199, 70%, 45%)", "hsl(0, 65%, 42%)",
];

interface CostRow {
  name: string;
  operator: string;
  capexTotal: number;
  opexTotal: number;
  opexPerBarrel: number;
  technicalCostPerBarrel: number;
  abandonmentTotal: number;
  abandonmentFunded: number;
  isEstimatedOpex: boolean;
  isEstimatedTechnical: boolean;
}

export const CostStructurePanel = () => {
  const data = useMemo(() => {
    const rows: CostRow[] = [];
    const operatorCosts: Record<string, { capex: number; opex: number; operator: string }> = {};

    oilBlocks.filter(b => !b.pendingRealData).forEach(b => {
      const ed = b.economicData;
      const ev = b.economicVision;

      const capexTotal = ed?.costHistory?.reduce((s, c) => s + c.capex, 0) || b.accumulatedInvestment;
      const opexTotal = ed?.costHistory?.reduce((s, c) => s + c.opex, 0) || 0;
      const hasRealOpex = !!ed?.opexPerBarrel;
      const opexPerBarrel = ed?.opexPerBarrel || 20;
      const tc = ev?.technicalCost;
      const hasRealTechnical = !!tc;
      const technicalCostPerBarrel = tc ? tc.capexPerBarrel + tc.opexPerBarrel : opexPerBarrel + 5;
      const abandonmentTotal = ed?.abandonment?.total || 0;
      const abandonmentFunded = ed?.abandonment?.fundingDeposited || 0;

      rows.push({
        name: b.name,
        operator: b.operator,
        capexTotal,
        opexTotal,
        opexPerBarrel,
        technicalCostPerBarrel,
        abandonmentTotal,
        abandonmentFunded,
        isEstimatedOpex: !hasRealOpex,
        isEstimatedTechnical: !hasRealTechnical,
      });

      if (!operatorCosts[b.operator]) operatorCosts[b.operator] = { capex: 0, opex: 0, operator: b.operator };
      operatorCosts[b.operator].capex += capexTotal;
      operatorCosts[b.operator].opex += opexTotal;
    });

    // OPEX/bbl comparison for chart
    const opexComparison = rows
      .filter(r => r.opexPerBarrel > 0)
      .sort((a, b) => b.opexPerBarrel - a.opexPerBarrel)
      .map(r => ({
        name: r.name.replace("Block ", "B").replace(" (Área A, B)", ""),
        opex: r.opexPerBarrel,
        technical: r.technicalCostPerBarrel,
        isEstimatedOpex: r.isEstimatedOpex,
        isEstimatedTechnical: r.isEstimatedTechnical,
      }));

    // Cost by operator
    const costByOperator = Object.values(operatorCosts)
      .sort((a, b) => (b.capex + b.opex) - (a.capex + a.opex));

    // Abandonment data
    const abandonmentData = rows
      .filter(r => r.abandonmentTotal > 0)
      .sort((a, b) => b.abandonmentTotal - a.abandonmentTotal)
      .map(r => ({
        name: r.name.replace("Block ", "B").replace(" (Área A, B)", ""),
        total: r.abandonmentTotal,
        funded: r.abandonmentFunded,
        gap: r.abandonmentTotal - r.abandonmentFunded,
      }));

    const totalCapex = rows.reduce((s, r) => s + r.capexTotal, 0);
    const totalOpex = rows.reduce((s, r) => s + r.opexTotal, 0);
    const totalAbandonment = rows.reduce((s, r) => s + r.abandonmentTotal, 0);
    const totalAbandonmentFunded = rows.reduce((s, r) => s + r.abandonmentFunded, 0);

    return { rows, opexComparison, costByOperator, abandonmentData, totalCapex, totalOpex, totalAbandonment, totalAbandonmentFunded };
  }, []);

  return (
    <div className="space-y-4">
      {/* Data coverage notice */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/5 border border-warning/20">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{data.rows.filter(r => oilBlocks.filter(b => !b.pendingRealData).find(b => b.name === r.name)?.economicData?.opexPerBarrel).length} de {data.rows.length} concessões</span> possuem dados de custos verificados.
        </p>
      </div>
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniKPI label="CAPEX Total Acumulado" value={`$${(data.totalCapex / 1000).toFixed(1)}B`} tooltip={tooltipDescriptions["CAPEX Total Acumulado"]} />
        <MiniKPI label="OPEX Total Acumulado" value={`$${(data.totalOpex / 1000).toFixed(1)}B`} tooltip={tooltipDescriptions["OPEX Total Acumulado"]} />
        <MiniKPI label="Custos de Abandono" value={`$${(data.totalAbandonment / 1000).toFixed(1)}B`} tooltip={tooltipDescriptions["Custos de Abandono (total)"]} />
        <MiniKPI
          label="Fundo de Abandono"
          value={`${((data.totalAbandonmentFunded / Math.max(data.totalAbandonment, 1)) * 100).toFixed(0)}%`}
          alert={data.totalAbandonmentFunded < data.totalAbandonment * 0.3}
          tooltip={tooltipDescriptions["Fundo de Abandono"]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* OPEX/bbl comparison */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">Custo por Barril por Concessão <InfoTooltip text={tooltipDescriptions["Custo por Barril por Concessão"]} /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.opexComparison} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" width={55} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const entry = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-[11px]">
                          <p className="font-semibold mb-1">{label}</p>
                          {payload.map((p: any) => (
                            <div key={p.dataKey} className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.fill }} />
                              <span className="text-muted-foreground">{p.dataKey === "opex" ? "OPEX" : "Custo Técnico"}:</span>
                              <span className="font-semibold">${p.value.toFixed(1)}/bbl</span>
                              {((p.dataKey === "opex" && entry?.isEstimatedOpex) || (p.dataKey === "technical" && entry?.isEstimatedTechnical)) && (
                                <span className="ml-1 px-1 py-0 rounded text-[8px] font-bold uppercase bg-warning/15 text-warning border border-warning/20">Est.</span>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="opex" fill="hsl(200, 45%, 28%)" radius={[0, 2, 2, 0]} barSize={10} name="OPEX">
                    {data.opexComparison.map((entry, i) => (
                      <Cell key={i} fill="hsl(200, 45%, 28%)" fillOpacity={entry.isEstimatedOpex ? 0.4 : 1} />
                    ))}
                  </Bar>
                  <Bar dataKey="technical" fill="hsl(38, 75%, 48%)" radius={[0, 2, 2, 0]} barSize={10} name="Custo Técnico">
                    {data.opexComparison.map((entry, i) => (
                      <Cell key={i} fill="hsl(38, 75%, 48%)" fillOpacity={entry.isEstimatedTechnical ? 0.4 : 1} />
                    ))}
                  </Bar>
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-1.5 mt-2 justify-end">
              <span className="inline-block w-3 h-2 rounded-sm bg-muted-foreground/25 border border-border/40" />
              <span className="text-[9px] text-muted-foreground">Transparência = valor estimado ($20/bbl padrão)</span>
            </div>
          </CardContent>
        </Card>

        {/* Cost by operator */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">CAPEX vs OPEX por Operador <InfoTooltip text={tooltipDescriptions["CAPEX vs OPEX por Operador"]} /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.costByOperator} layout="vertical" margin={{ left: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `$${(v / 1000).toFixed(0)}B`} />
                  <YAxis type="category" dataKey="operator" tick={{ fontSize: 9 }} className="fill-muted-foreground" width={65} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number, name: string) => [`$${v.toLocaleString()}MM`, name === "capex" ? "CAPEX" : "OPEX"]}
                  />
                  <Bar dataKey="capex" stackId="cost" fill="hsl(200, 45%, 28%)" barSize={14} name="CAPEX" />
                  <Bar dataKey="opex" stackId="cost" fill="hsl(152, 50%, 38%)" radius={[0, 3, 3, 0]} barSize={14} name="OPEX" />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abandonment funding gap */}
      {data.abandonmentData.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">Custos de Abandono — Gap de Financiamento <InfoTooltip text={tooltipDescriptions["Custos de Abandono — Gap de Financiamento"]} /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.abandonmentData} margin={{ left: 60 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `$${v}MM`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" width={55} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number, name: string) => [`$${v.toLocaleString()}MM`, name === "funded" ? "Depositado" : "Gap"]}
                  />
                  <Bar dataKey="funded" stackId="ab" fill="hsl(152, 50%, 38%)" barSize={14} name="Depositado" />
                  <Bar dataKey="gap" stackId="ab" fill="hsl(0, 65%, 42%)" radius={[0, 3, 3, 0]} barSize={14} name="Gap" />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function MiniKPI({ label, value, alert, tooltip }: { label: string; value: string; alert?: boolean; tooltip?: string }) {
  return (
    <div className={`rounded-lg border p-3 ${alert ? "border-danger/30 bg-danger/5" : "border-border/40 bg-card"}`}>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className={`text-lg font-bold mt-0.5 ${alert ? "text-danger" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
