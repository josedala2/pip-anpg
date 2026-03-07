import { oilBlocks, type OilBlock, type BlockPhase } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartWrapper } from "./ChartWrapper";
import { useState, useMemo } from "react";
import { ArrowUpDown, AlertTriangle, TrendingDown, Target, DollarSign, Filter } from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceLine, Cell, ZAxis, Label,
} from "recharts";

type SortKey = "dailyProduction" | "riskScore" | "executionRate" | "accumulatedInvestment";

const alertBadge = (block: OilBlock) => {
  if (block.riskScore >= 8) return <Badge className="bg-danger text-danger-foreground text-[10px]">Critical</Badge>;
  if (block.executionRate < 70) return <Badge className="bg-warning text-warning-foreground text-[10px]">Below Plan</Badge>;
  if (block.executionRate >= 90) return <Badge className="bg-success text-success-foreground text-[10px]">On Target</Badge>;
  return <Badge variant="secondary" className="text-[10px]">Monitor</Badge>;
};

const ALL = "__all__";

export const RiskPerformance = () => {
  const [sortKey, setSortKey] = useState<SortKey>("riskScore");
  const [sortAsc, setSortAsc] = useState(false);
  const [operatorFilter, setOperatorFilter] = useState(ALL);
  const [phaseFilter, setPhaseFilter] = useState(ALL);

  const operators = useMemo(() => [...new Set(oilBlocks.map(b => b.operator))].sort(), []);
  const phases = useMemo(() => [...new Set(oilBlocks.map(b => b.phase))].sort(), []);

  const filtered = useMemo(() => {
    return oilBlocks.filter(b =>
      (operatorFilter === ALL || b.operator === operatorFilter) &&
      (phaseFilter === ALL || b.phase === phaseFilter)
    );
  }, [operatorFilter, phaseFilter]);

  const sorted = [...filtered].sort((a, b) => {
    const diff = (a[sortKey] as number) - (b[sortKey] as number);
    return sortAsc ? diff : -diff;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const stats = useMemo(() => ({
    critical: filtered.filter(b => b.riskScore >= 8).length,
    belowPlan: filtered.filter(b => b.executionRate < 70).length,
    onTarget: filtered.filter(b => b.executionRate >= 90).length,
    totalInvestment: filtered.reduce((s, b) => s + b.accumulatedInvestment, 0),
  }), [filtered]);

  const summaryCards = [
    { label: "Blocos Críticos", value: stats.critical, icon: AlertTriangle, color: "text-danger" },
    { label: "Below Plan", value: stats.belowPlan, icon: TrendingDown, color: "text-warning" },
    { label: "On Target", value: stats.onTarget, icon: Target, color: "text-success" },
    { label: "Investimento Total", value: `$${stats.totalInvestment.toLocaleString()}M`, icon: DollarSign, color: "text-primary" },
  ];

  const activeFilters = (operatorFilter !== ALL ? 1 : 0) + (phaseFilter !== ALL ? 1 : 0);

  return (
    <div className="space-y-4 2xl:space-y-6">
      {/* Filter Bar + KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={operatorFilter} onValueChange={setOperatorFilter}>
            <SelectTrigger className="h-8 w-[160px] text-xs bg-card border-border">
              <SelectValue placeholder="Operador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos Operadores</SelectItem>
              {operators.map(op => (
                <SelectItem key={op} value={op}>{op}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="h-8 w-[140px] text-xs bg-card border-border">
              <SelectValue placeholder="Fase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas Fases</SelectItem>
              {phases.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeFilters > 0 && (
            <button
              onClick={() => { setOperatorFilter(ALL); setPhaseFilter(ALL); }}
              className="text-[10px] text-muted-foreground hover:text-foreground underline"
            >
              Limpar ({activeFilters})
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 2xl:gap-3 flex-1">
          {summaryCards.map(card => (
            <Card key={card.label} className="glass-card">
              <CardContent className="p-3 2xl:p-4 flex items-center gap-2">
                <card.icon className={`w-4 h-4 2xl:w-5 2xl:h-5 ${card.color} shrink-0`} />
                <div className="min-w-0">
                  <div className="text-[10px] 2xl:text-xs text-muted-foreground uppercase tracking-wider">{card.label}</div>
                  <div className={`text-lg 2xl:text-xl font-bold font-mono ${card.color}`}>{card.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Side-by-side: Heatmap + Table */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4 2xl:gap-6">
        {/* Risk Heatmap */}
        <Card className="glass-card">
          <CardHeader className="p-3 2xl:p-4 pb-1">
            <CardTitle className="text-sm 2xl:text-base">Risk Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="p-3 2xl:p-4 pt-1">
            <TooltipProvider delayDuration={200}>
              <div className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 2xl:gap-2">
                {filtered.map(block => (
                  <UITooltip key={block.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="p-1.5 2xl:p-2.5 rounded-md text-center transition-all hover:scale-105 cursor-default"
                        style={{ backgroundColor: `hsl(${block.riskScore <= 3 ? 'var(--success)' : block.riskScore <= 6 ? 'var(--warning)' : 'var(--danger)'} / 0.15)` }}
                      >
                        <div className="text-[10px] 2xl:text-xs font-bold truncate">{block.name}</div>
                        <div className="text-base 2xl:text-lg font-mono font-bold">{block.riskScore}</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-semibold">{block.name}</p>
                      <p className="text-muted-foreground">{block.operator}</p>
                      <p>Risk: {block.riskScore} · Exec: {block.executionRate}%</p>
                    </TooltipContent>
                  </UITooltip>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                    Nenhum bloco encontrado
                  </div>
                )}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Ranking Table */}
        <Card className="glass-card">
          <CardHeader className="p-3 2xl:p-4 pb-1">
            <CardTitle className="text-sm 2xl:text-base">Block Rankings <span className="text-muted-foreground font-normal">({filtered.length})</span></CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[420px] 2xl:h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs 2xl:text-sm">Block</TableHead>
                    <TableHead className="text-xs 2xl:text-sm">Operator</TableHead>
                    {([
                      ["dailyProduction", "Prod."],
                      ["riskScore", "Risk"],
                      ["executionRate", "Exec%"],
                      ["accumulatedInvestment", "Invest."],
                    ] as [SortKey, string][]).map(([key, label]) => (
                      <TableHead key={key} className="text-xs 2xl:text-sm cursor-pointer hover:text-foreground" onClick={() => toggleSort(key)}>
                        <div className="flex items-center gap-1">
                          {label}
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-xs 2xl:text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum bloco encontrado</TableCell>
                    </TableRow>
                  )}
                  {sorted.map(block => (
                    <TableRow key={block.id} className="border-border text-xs 2xl:text-sm">
                      <TableCell className="font-semibold py-2">{block.name}</TableCell>
                      <TableCell className="text-muted-foreground py-2">{block.operator}</TableCell>
                      <TableCell className="font-mono py-2">{block.dailyProduction.toLocaleString()}</TableCell>
                      <TableCell className="py-2">
                        <span className={`font-mono font-bold ${block.riskScore <= 3 ? 'text-success' : block.riskScore <= 6 ? 'text-warning' : 'text-danger'}`}>
                          {block.riskScore}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono py-2">{block.executionRate}%</TableCell>
                      <TableCell className="font-mono py-2">${block.accumulatedInvestment}M</TableCell>
                      <TableCell className="py-2">{alertBadge(block)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Scatter Chart: Risk vs Execution */}
      <ChartWrapper title="Risk Score vs Execution Rate" height={350}>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              type="number"
              dataKey="riskScore"
              name="Risk Score"
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            >
              <Label value="Risk Score" position="bottom" offset={5} style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            </XAxis>
            <YAxis
              type="number"
              dataKey="executionRate"
              name="Execution Rate"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              unit="%"
            >
              <Label value="Execution %" angle={-90} position="insideLeft" offset={10} style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            </YAxis>
            <ZAxis type="number" dataKey="dailyProduction" range={[40, 400]} name="Production" />
            <ReferenceLine y={70} stroke="hsl(var(--warning))" strokeDasharray="4 4" label={{ value: "Min Exec 70%", position: "right", fontSize: 10, fill: "hsl(var(--warning))" }} />
            <ReferenceLine x={8} stroke="hsl(var(--danger))" strokeDasharray="4 4" label={{ value: "Critical", position: "top", fontSize: 10, fill: "hsl(var(--danger))" }} />
            <RechartsTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload as OilBlock;
                return (
                  <div className="rounded-md border bg-popover p-2 text-xs shadow-md">
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-muted-foreground">{d.operator} · {d.phase}</p>
                    <p>Risk: <span className="font-mono font-bold">{d.riskScore}</span></p>
                    <p>Execution: <span className="font-mono font-bold">{d.executionRate}%</span></p>
                    <p>Production: <span className="font-mono">{d.dailyProduction.toLocaleString()} BOPD</span></p>
                  </div>
                );
              }}
            />
            <Scatter data={filtered}>
              {filtered.map((block) => (
                <Cell
                  key={block.id}
                  fill={`hsl(${block.riskScore <= 3 ? 'var(--success)' : block.riskScore <= 6 ? 'var(--warning)' : 'var(--danger)'})`}
                  fillOpacity={0.75}
                  stroke={`hsl(${block.riskScore <= 3 ? 'var(--success)' : block.riskScore <= 6 ? 'var(--warning)' : 'var(--danger)'})`}
                  strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </div>
  );
};
