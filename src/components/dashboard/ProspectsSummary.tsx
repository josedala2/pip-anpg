import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend } from "recharts";
import { Layers, Database } from "lucide-react";
import type { OilBlock } from "@/data/angolaBlocks";

interface ProspectsSummaryProps {
  blocks: OilBlock[];
  scopeLabel: string;
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const COLORS = [
  "hsl(199, 89%, 48%)", "hsl(152, 69%, 40%)", "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)", "hsl(170, 60%, 45%)",
  "hsl(220, 70%, 55%)", "hsl(340, 65%, 50%)", "hsl(45, 80%, 55%)",
  "hsl(310, 50%, 50%)",
];

interface GroupRow {
  name: string;
  count: number;
  totalMMBO: number;
  totalBCF: number;
  avgPOS: number;
  blocks: string[];
}

const buildGroups = (blocks: OilBlock[], groupBy: "reservoir" | "basin"): GroupRow[] => {
  const map: Record<string, { count: number; mmbo: number; bcf: number; posSum: number; blocks: Set<string> }> = {};

  blocks.forEach(b => {
    if (!b.prospects) return;
    b.prospects.forEach(p => {
      const key = groupBy === "reservoir" ? p.reservoir : b.basin;
      if (!map[key]) map[key] = { count: 0, mmbo: 0, bcf: 0, posSum: 0, blocks: new Set() };
      map[key].count++;
      map[key].mmbo += p.resourcesMMBO;
      map[key].bcf += p.resourcesBCF || 0;
      map[key].posSum += p.pos;
      map[key].blocks.add(b.name);
    });
  });

  return Object.entries(map)
    .map(([name, v]) => ({
      name,
      count: v.count,
      totalMMBO: v.mmbo,
      totalBCF: v.bcf,
      avgPOS: Math.round(v.posSum / v.count),
      blocks: [...v.blocks].sort(),
    }))
    .sort((a, b) => b.totalMMBO - a.totalMMBO);
};

const posColor = (pos: number) => {
  if (pos >= 50) return "text-success";
  if (pos >= 25) return "text-warning";
  return "text-danger";
};

export const ProspectsSummary = ({ blocks, scopeLabel }: ProspectsSummaryProps) => {
  const [groupBy, setGroupBy] = useState<"reservoir" | "basin">("reservoir");

  const blocksWithProspects = useMemo(
    () => blocks.filter(b => b.prospects && b.prospects.length > 0),
    [blocks]
  );

  const groups = useMemo(() => buildGroups(blocksWithProspects, groupBy), [blocksWithProspects, groupBy]);

  const grandTotal = useMemo(() => {
    return groups.reduce(
      (acc, g) => ({ mmbo: acc.mmbo + g.totalMMBO, bcf: acc.bcf + g.totalBCF, count: acc.count + g.count }),
      { mmbo: 0, bcf: 0, count: 0 }
    );
  }, [groups]);

  const chartData = useMemo(
    () => groups.slice(0, 12).map(g => ({ name: g.name.length > 18 ? g.name.slice(0, 16) + "…" : g.name, fullName: g.name, MMBO: Math.round(g.totalMMBO), BCF: Math.round(g.totalBCF), count: g.count })),
    [groups]
  );

  const pieData = useMemo(
    () => groups.map(g => ({ name: g.name, value: Math.round(g.totalMMBO) })),
    [groups]
  );

  if (blocksWithProspects.length === 0) return null;

  return (
    <Card className="glass-card">
       <CardHeader className="p-4 2xl:p-5 pb-2">
         <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
           <Database className="w-4 h-4 2xl:w-5 2xl:h-5 text-primary" />
           Recursos Consolidados — {scopeLabel}
           <Badge variant="outline" className="ml-auto text-[10px] 2xl:text-xs bg-primary/10 text-primary border-primary/30">
             {grandTotal.count} prospectos · {grandTotal.mmbo.toLocaleString(undefined, { maximumFractionDigits: 0 })} MMBO
             {grandTotal.bcf > 0 && ` · ${grandTotal.bcf.toLocaleString()} BCF`}
           </Badge>
         </CardTitle>
       </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        {/* Group Toggle */}
        <Tabs value={groupBy} onValueChange={v => setGroupBy(v as any)} className="w-fit">
          <TabsList className="h-7 p-0.5">
            <TabsTrigger value="reservoir" className="text-[10px] h-6 px-3 gap-1">
              <Layers className="w-3 h-3" />Reservatório
            </TabsTrigger>
            <TabsTrigger value="basin" className="text-[10px] h-6 px-3 gap-1">
              <Layers className="w-3 h-3" />Bacia
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 2xl:gap-6">
          {/* Bar Chart */}
          <div className="md:col-span-2">
             <ResponsiveContainer width="100%" height={340}>
              <BarChart data={chartData} margin={{ left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} angle={-35} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: number, name: string) => [`${val.toLocaleString()} ${name}`, name]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Bar dataKey="MMBO" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                {grandTotal.bcf > 0 && (
                  <Bar dataKey="BCF" fill="hsl(var(--success))" radius={[3, 3, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div>
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                   data={pieData}
                   cx="50%" cy="45%"
                   innerRadius="25%" outerRadius="45%"
                   paddingAngle={1}
                   dataKey="value"
                   label={false}
                   labelLine={false}
                 >
                   {pieData.map((_, i) => (
                     <Cell key={i} fill={COLORS[i % COLORS.length]} />
                   ))}
                 </Pie>
                 <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 8 }} formatter={(value, entry: any) => { const p = entry?.payload?.percent; return p != null ? `${value} (${(p * 100).toFixed(0)}%)` : value; }} />
                 <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val.toLocaleString()} MMBO`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center text-[10px] text-muted-foreground -mt-2">Distribuição MMBO por {groupBy === "reservoir" ? "Reservatório" : "Bacia"}</div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="relative w-full overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                 <TableHead className="text-[10px] 2xl:text-xs uppercase tracking-wider">{groupBy === "reservoir" ? "Reservatório" : "Bacia"}</TableHead>
                 <TableHead className="text-[10px] 2xl:text-xs uppercase tracking-wider text-right">Prospectos</TableHead>
                 <TableHead className="text-[10px] 2xl:text-xs uppercase tracking-wider text-right">MMBO Total</TableHead>
                 <TableHead className="text-[10px] 2xl:text-xs uppercase tracking-wider text-right">BCF Total</TableHead>
                 <TableHead className="text-[10px] 2xl:text-xs uppercase tracking-wider text-right">POS Médio</TableHead>
                 <TableHead className="text-[10px] 2xl:text-xs uppercase tracking-wider">Blocos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((g, i) => (
                <TableRow key={g.name} className="border-border/30 hover:bg-secondary/30">
                  <TableCell className="text-xs 2xl:text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {g.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-right">{g.count}</TableCell>
                  <TableCell className="text-xs font-mono text-right font-bold">{g.totalMMBO.toLocaleString(undefined, { maximumFractionDigits: 1 })}</TableCell>
                  <TableCell className="text-xs font-mono text-right text-muted-foreground">{g.totalBCF > 0 ? g.totalBCF.toLocaleString() : "—"}</TableCell>
                  <TableCell className={`text-xs font-mono text-right font-bold ${posColor(g.avgPOS)}`}>{g.avgPOS}%</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {g.blocks.map(bn => (
                        <Badge key={bn} variant="outline" className="text-[9px]">{bn}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {/* Grand Total */}
              <TableRow className="border-t-2 border-border bg-secondary/20 font-bold">
                <TableCell className="text-xs">TOTAL</TableCell>
                <TableCell className="text-xs font-mono text-right">{grandTotal.count}</TableCell>
                <TableCell className="text-xs font-mono text-right">{grandTotal.mmbo.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                <TableCell className="text-xs font-mono text-right">{grandTotal.bcf > 0 ? grandTotal.bcf.toLocaleString() : "—"}</TableCell>
                <TableCell className="text-xs font-mono text-right">—</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
