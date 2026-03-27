import { oilBlocks, type OilBlock, type BlockPhase } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartWrapper } from "./ChartWrapper";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, AlertTriangle, TrendingDown, Target, DollarSign, Filter, X } from "lucide-react";
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
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>("riskScore");
  const [sortAsc, setSortAsc] = useState(false);
  const [operatorFilter, setOperatorFilter] = useState(ALL);
  const [phaseFilter, setPhaseFilter] = useState(ALL);

  const base = useMemo(() => oilBlocks.filter(b => !b.pendingRealData), []);
  const operators = useMemo(() => [...new Set(base.map(b => b.operator))].sort(), [base]);
  const phases = useMemo(() => [...new Set(base.map(b => b.phase))].sort(), [base]);

  const filtered = useMemo(() => {
    return base.filter(b =>
      (operatorFilter === ALL || b.operator === operatorFilter) &&
      (phaseFilter === ALL || b.phase === phaseFilter)
    );
  }, [operatorFilter, phaseFilter, base]);

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

  const activeFilters = (operatorFilter !== ALL ? 1 : 0) + (phaseFilter !== ALL ? 1 : 0);

  const summaryCards = [
    { label: "Blocos Críticos", value: stats.critical, icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
    { label: "Below Plan", value: stats.belowPlan, icon: TrendingDown, color: "text-warning", bg: "bg-warning/10" },
    { label: "On Target", value: stats.onTarget, icon: Target, color: "text-success", bg: "bg-success/10" },
    { label: "Investimento Total", value: `$${stats.totalInvestment.toLocaleString()}M`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-5 2xl:space-y-6">
      {/* Top section: Filters + KPI Cards */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={operatorFilter} onValueChange={setOperatorFilter}>
            <SelectTrigger className="h-8 w-[160px] text-xs bg-card border-border">
              <SelectValue placeholder="Operador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos Operadores</SelectItem>
              {operators.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="h-8 w-[140px] text-xs bg-card border-border">
              <SelectValue placeholder="Fase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas Fases</SelectItem>
              {phases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          {activeFilters > 0 && (
            <button
              onClick={() => { setOperatorFilter(ALL); setPhaseFilter(ALL); }}
              className="h-8 px-3 rounded-md bg-muted/60 text-xs text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Limpar ({activeFilters})
            </button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 2xl:gap-4">
          {summaryCards.map(card => (
            <Card key={card.label} className="glass-card">
              <CardContent className="p-4 2xl:p-5 flex items-center gap-3">
                <div className={`w-10 h-10 2xl:w-11 2xl:h-11 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                  <card.icon className={`w-5 h-5 2xl:w-5.5 2xl:h-5.5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] 2xl:text-xs text-muted-foreground">{card.label}</div>
                  <div className={`text-xl 2xl:text-2xl font-bold font-mono ${card.color}`}>{card.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Middle section: Heatmap + Table side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4 2xl:gap-5">
        {/* Risk Heatmap */}
        <Card className="glass-card">
          <CardHeader className="p-4 2xl:p-5 pb-2">
            <CardTitle className="text-sm 2xl:text-base">Risk Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="p-4 2xl:p-5 pt-2">
            <TooltipProvider delayDuration={150}>
              <ScrollArea className="h-[420px] 2xl:h-[480px]">
                <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-2 2xl:gap-2.5">
                  {filtered.map(block => (
                    <UITooltip key={block.id}>
                      <TooltipTrigger asChild>
                        <div
                          className="p-2 2xl:p-3 rounded-lg text-center transition-all hover:scale-105 hover:ring-1 hover:ring-primary/40 cursor-pointer"
                          style={{ backgroundColor: `hsl(${block.riskScore <= 3 ? 'var(--success)' : block.riskScore <= 6 ? 'var(--warning)' : 'var(--danger)'} / 0.15)` }}
                          onClick={() => navigate(`/block/${block.id}`)}
                        >
                          <div className="text-[10px] 2xl:text-xs font-medium truncate">{block.name}</div>
                          <div className="text-base 2xl:text-lg font-mono font-bold">{block.riskScore}</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs z-50">
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
              </ScrollArea>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Rankings Table */}
        <Card className="glass-card">
          <CardHeader className="p-4 2xl:p-5 pb-2">
            <CardTitle className="text-sm 2xl:text-base">
              Block Rankings <span className="text-muted-foreground font-normal">({filtered.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[420px] 2xl:h-[480px]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs 2xl:text-sm h-9 px-3">Block</TableHead>
                    <TableHead className="text-xs 2xl:text-sm h-9 px-3">Operador</TableHead>
                    {([
                      ["dailyProduction", "Prod."],
                      ["riskScore", "Risk"],
                      ["executionRate", "Exec%"],
                      ["accumulatedInvestment", "Invest."],
                    ] as [SortKey, string][]).map(([key, label]) => (
                      <TableHead key={key} className="text-xs 2xl:text-sm h-9 px-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort(key)}>
                        <div className="flex items-center gap-1">
                          {label}
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-xs 2xl:text-sm h-9 px-3">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum bloco encontrado</TableCell>
                    </TableRow>
                  )}
                  {sorted.map(block => (
                    <TableRow
                      key={block.id}
                      className="border-border/50 text-xs 2xl:text-sm cursor-pointer hover:bg-muted/30"
                      onClick={() => navigate(`/block/${block.id}`)}
                    >
                      <TableCell className="font-semibold py-2 px-3">{block.name}</TableCell>
                      <TableCell className="text-muted-foreground py-2 px-3">{block.operator}</TableCell>
                      <TableCell className="font-mono py-2 px-3">{block.dailyProduction.toLocaleString()}</TableCell>
                      <TableCell className="py-2 px-3">
                        <span className={`font-mono font-bold ${block.riskScore <= 3 ? 'text-success' : block.riskScore <= 6 ? 'text-warning' : 'text-danger'}`}>
                          {block.riskScore}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono py-2 px-3">{block.executionRate}%</TableCell>
                      <TableCell className="font-mono py-2 px-3">${block.accumulatedInvestment}M</TableCell>
                      <TableCell className="py-2 px-3">{alertBadge(block)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Bottom section: Scatter Chart full width */}
      <ChartWrapper title="Risk Score vs Taxa de Execução" height={380}>
        <ResponsiveContainer width="100%" height={380}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis
              type="number" dataKey="riskScore" name="Risk Score" domain={[0, 10]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            >
              <Label value="Risk Score" position="bottom" offset={8} style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            </XAxis>
            <YAxis
              type="number" dataKey="executionRate" name="Execution Rate" domain={[0, 100]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%"
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
                  <div className="rounded-md border bg-popover p-2.5 text-xs shadow-md">
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
