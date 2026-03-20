import { useMemo } from "react";
import { oilBlocks } from "@/data/angolaBlocks";
import { getBlockStateRevenue } from "@/lib/economicScoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
} from "recharts";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { tooltipDescriptions } from "@/lib/tooltipDescriptions";

const CHART_COLORS = [
  "hsl(200, 45%, 28%)", "hsl(152, 50%, 38%)", "hsl(38, 75%, 48%)",
  "hsl(280, 50%, 55%)", "hsl(199, 70%, 45%)", "hsl(0, 65%, 42%)",
  "hsl(160, 40%, 50%)", "hsl(30, 60%, 55%)",
];

export const FiscalImpactPanel = () => {
  const data = useMemo(() => {
    const blockFiscal = oilBlocks.map(b => {
      const fc = b.contractInfo?.fiscalConditions;
      const stateRevenue = getBlockStateRevenue(b);
      const ipp = fc?.ipp || 0;
      const irp = fc?.irp || 0;
      const royaltyEstimate = b.dailyProduction * 365 * 78 * (ipp / 100) / 1e6; // proxy
      const taxEstimate = b.dailyProduction * 365 * 78 * (irp / 200) / 1e6; // proxy (profit-based)
      const otherRevenue = stateRevenue - royaltyEstimate - taxEstimate;

      return {
        id: b.id,
        name: b.name,
        shortName: b.name.replace("Block ", "B").replace(" (Área A, B)", ""),
        operator: b.operator,
        ipp,
        irp,
        costRecovery: fc?.costRecoveryPostProd || fc?.costRecoveryPreProd || 0,
        stateRevenue,
        royaltyEstimate: Math.max(royaltyEstimate, 0),
        taxEstimate: Math.max(taxEstimate, 0),
        otherRevenue: Math.max(otherRevenue, 0),
        dailyProduction: b.dailyProduction,
      };
    });

    const totalStateRevenue = blockFiscal.reduce((s, b) => s + b.stateRevenue, 0);
    const totalRoyalties = blockFiscal.reduce((s, b) => s + b.royaltyEstimate, 0);
    const totalTaxes = blockFiscal.reduce((s, b) => s + b.taxEstimate, 0);
    const totalOther = blockFiscal.reduce((s, b) => s + b.otherRevenue, 0);

    // Revenue split pie
    const revenueSplit = [
      { name: "IPP (Royalties)", value: totalRoyalties },
      { name: "IRP (Impostos)", value: totalTaxes },
      { name: "Outros", value: totalOther },
    ].filter(r => r.value > 0);

    // Top concessions by fiscal contribution
    const topConcessions = [...blockFiscal]
      .sort((a, b) => b.stateRevenue - a.stateRevenue)
      .slice(0, 12)
      .map(b => ({
        name: b.shortName,
        revenue: b.stateRevenue,
        royalties: b.royaltyEstimate,
        taxes: b.taxEstimate,
      }));

    // Revenue share: State vs Operators (using economicVision data)
    const stateVsOperator = oilBlocks
      .filter(b => b.economicVision?.revenueShare?.length)
      .map(b => {
        const latest = b.economicVision!.revenueShare![b.economicVision!.revenueShare!.length - 1];
        return {
          name: b.name.replace("Block ", "B").replace(" (Área A, B)", ""),
          state: latest.impostosPercent,
          operator: latest.gePercent,
        };
      });

    return { blockFiscal, totalStateRevenue, totalRoyalties, totalTaxes, totalOther, revenueSplit, topConcessions, stateVsOperator };
  }, []);

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniKPI label="Receita Fiscal Total" value={`$${(data.totalStateRevenue / 1000).toFixed(1)}B/ano`} tooltip={tooltipDescriptions["Receita Fiscal Total"]} />
        <MiniKPI label="Royalties (IPP)" value={`$${data.totalRoyalties.toFixed(0)}MM/ano`} tooltip={tooltipDescriptions["Royalties (IPP)"]} />
        <MiniKPI label="Impostos (IRP)" value={`$${data.totalTaxes.toFixed(0)}MM/ano`} tooltip={tooltipDescriptions["Impostos (IRP)"]} />
        <MiniKPI label="Outras Receitas" value={`$${data.totalOther.toFixed(0)}MM/ano`} tooltip={tooltipDescriptions["Outras Receitas"]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue split pie */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">Repartição da Receita Fiscal <InfoTooltip text={tooltipDescriptions["Repartição da Receita Fiscal"]} /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.revenueSplit}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {data.revenueSplit.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number) => [`$${v.toFixed(0)}MM/ano`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top concessions by fiscal contribution */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">Contribuição Fiscal por Concessão <InfoTooltip text={tooltipDescriptions["Contribuição Fiscal por Concessão"]} /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topConcessions}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `$${v}`} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number) => [`$${v.toFixed(0)}MM/ano`, ""]}
                  />
                  <Bar dataKey="royalties" stackId="rev" fill="hsl(200, 45%, 28%)" barSize={18} name="Royalties" />
                  <Bar dataKey="taxes" stackId="rev" fill="hsl(152, 50%, 38%)" radius={[3, 3, 0, 0]} barSize={18} name="Impostos" />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* State vs Operator revenue share */}
      {data.stateVsOperator.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">Repartição Estado vs Operador (%) <InfoTooltip text={tooltipDescriptions["Repartição Estado vs Operador (%)"]} /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stateVsOperator}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number, name: string) => [`${v.toFixed(0)}%`, name === "state" ? "Estado" : "Operador"]}
                  />
                  <Bar dataKey="state" stackId="share" fill="hsl(200, 45%, 28%)" barSize={20} name="Estado" />
                  <Bar dataKey="operator" stackId="share" fill="hsl(38, 75%, 48%)" radius={[3, 3, 0, 0]} barSize={20} name="Operador" />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fiscal conditions table */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Condições Fiscais por Concessão</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] uppercase tracking-wider">
                  <TableHead>Concessão</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>IPP (%)</TableHead>
                  <TableHead>IRP (%)</TableHead>
                  <TableHead>Cost Recovery (%)</TableHead>
                  <TableHead>Receita Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.blockFiscal
                  .filter(b => b.dailyProduction > 0)
                  .sort((a, b) => b.stateRevenue - a.stateRevenue)
                  .map(b => (
                    <TableRow key={b.id} className="text-xs">
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="text-muted-foreground">{b.operator}</TableCell>
                      <TableCell className="tabular-nums">{b.ipp > 0 ? `${b.ipp}%` : "—"}</TableCell>
                      <TableCell className="tabular-nums">{b.irp > 0 ? `${b.irp}%` : "—"}</TableCell>
                      <TableCell className="tabular-nums">{b.costRecovery > 0 ? `${b.costRecovery}%` : "—"}</TableCell>
                      <TableCell className="tabular-nums font-semibold">${b.stateRevenue.toFixed(0)}MM</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function MiniKPI({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${alert ? "border-danger/30 bg-danger/5" : "border-border/40 bg-card"}`}>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${alert ? "text-danger" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
