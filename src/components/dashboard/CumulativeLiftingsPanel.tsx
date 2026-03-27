import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartWrapper } from "./ChartWrapper";
import { totalLiftingsMMBO, liftingsByEntity, liftingsByBlock, topANPGContributors } from "@/data/liftingsData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp } from "lucide-react";

export const CumulativeLiftingsPanel = () => {
  return (
    <div className="space-y-6">
      {/* Total KPI */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-bold">{totalLiftingsMMBO.toLocaleString()} MMBO</div>
            <div className="text-xs text-muted-foreground">Levantamentos acumulados de petróleo (1988–2025)</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* By Entity */}
        <ChartWrapper title="Distribuição por Entidade">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={liftingsByEntity}
                  dataKey="volumeMMBO"
                  nameKey="entity"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {liftingsByEntity.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                  formatter={(value: number) => [value.toLocaleString() + " MMBO"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {liftingsByEntity.map((e, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                  <div>
                    <div className="text-xs font-semibold">{e.entity}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {e.volumeMMBO.toLocaleString()} MMBO ({e.percentage}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartWrapper>

        {/* Top ANPG Contributors */}
        <ChartWrapper title="Top Contribuintes ANPG">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topANPGContributors} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="block" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={60} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                formatter={(value: number) => [value.toLocaleString() + " MMBO"]}
              />
              <Bar dataKey="volumeMMBO" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Full Block Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Levantamentos por Bloco</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Bloco</TableHead>
                <TableHead className="text-[10px] text-right">Volume (MMBO)</TableHead>
                <TableHead className="text-[10px] text-right">% do Total</TableHead>
                <TableHead className="text-[10px]">Proporção</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liftingsByBlock.map((b, i) => (
                <TableRow key={i} className="text-xs">
                  <TableCell className="py-1.5 font-semibold">{b.block}</TableCell>
                  <TableCell className="py-1.5 text-right font-mono">{b.volumeMMBO.toLocaleString()}</TableCell>
                  <TableCell className="py-1.5 text-right font-mono">{b.percentageOfTotal.toFixed(2)}%</TableCell>
                  <TableCell className="py-1.5">
                    <div className="w-full bg-muted rounded-full h-2 max-w-[120px]">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${Math.min(b.percentageOfTotal * 3, 100)}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
