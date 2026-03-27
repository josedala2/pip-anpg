import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartWrapper } from "./ChartWrapper";
import { nationalForecast, forecastProjects } from "@/data/nationalForecast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Target } from "lucide-react";

export const NationalForecastPanel = () => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "fid" | "no-fid">("all");

  const filteredProjects = forecastProjects.filter(
    p => selectedCategory === "all" || p.category === selectedCategory
  );

  const peakYear = nationalForecast.reduce((max, y) => y.total > max.total ? y : max, nationalForecast[0]);

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground font-medium">Produção Actual</span>
            </div>
            <div className="text-2xl font-bold">{nationalForecast[0].total.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">kBOPD (2025)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-[10px] text-muted-foreground font-medium">Pico Projectado</span>
            </div>
            <div className="text-2xl font-bold">{peakYear.total.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">kBOPD ({peakYear.year})</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-chart-2" />
              <span className="text-[10px] text-muted-foreground font-medium">Projectos c/ FID</span>
            </div>
            <div className="text-2xl font-bold">{forecastProjects.filter(p => p.category === "fid").length}</div>
            <div className="text-[10px] text-muted-foreground">IP 2026–2033</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium">Projectos s/ FID</span>
            </div>
            <div className="text-2xl font-bold">{forecastProjects.filter(p => p.category === "no-fid").length}</div>
            <div className="text-[10px] text-muted-foreground">IP 2028–2045</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <ChartWrapper title="Previsão de Produção de Petróleo — Angola 2025-2050 (kBOPD)">
        <ResponsiveContainer width="100%" height={420}>
          <AreaChart data={nationalForecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "kBOPD", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  baseProduction: "Produção de Base",
                  discoveredWithFID: "Descobertas c/ FID",
                  discoveredWithoutFID: "Descobertas s/ FID",
                };
                return [value.toLocaleString() + " kBOPD", labels[name] || name];
              }}
            />
            <Legend
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  baseProduction: "Produção de Base",
                  discoveredWithFID: "Descobertas c/ FID",
                  discoveredWithoutFID: "Descobertas s/ FID",
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ fontSize: 11 }}
            />
            <Area type="monotone" dataKey="baseProduction" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.6)" />
            <Area type="monotone" dataKey="discoveredWithFID" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.6)" />
            <Area type="monotone" dataKey="discoveredWithoutFID" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3) / 0.5)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Projects Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Pipeline de Projectos — IP Previsto</CardTitle>
            <div className="flex gap-1">
              {[
                { value: "all" as const, label: "Todos" },
                { value: "fid" as const, label: "Com FID" },
                { value: "no-fid" as const, label: "Sem FID" },
              ].map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                    selectedCategory === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Bloco</TableHead>
                  <TableHead className="text-[10px]">Projecto</TableHead>
                  <TableHead className="text-[10px]">Bacia</TableHead>
                  <TableHead className="text-[10px] text-center">IP</TableHead>
                  <TableHead className="text-[10px] text-center">Categoria</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((p, i) => (
                  <TableRow key={i} className="text-xs">
                    <TableCell className="py-1.5 font-mono font-semibold">{p.block}</TableCell>
                    <TableCell className="py-1.5">{p.name}</TableCell>
                    <TableCell className="py-1.5 text-muted-foreground">{p.basin}</TableCell>
                    <TableCell className="py-1.5 text-center font-semibold">{p.expectedIP}</TableCell>
                    <TableCell className="py-1.5 text-center">
                      <Badge variant={p.category === "fid" ? "default" : "secondary"} className="text-[9px]">
                        {p.category === "fid" ? "FID" : "s/ FID"}
                      </Badge>
                    </TableCell>
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
