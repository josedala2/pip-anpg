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
  if (block.riskScore >= 8) return <Badge className="bg-danger text-danger-foreground text-[9px] px-1.5 py-0">Critical</Badge>;
  if (block.executionRate < 70) return <Badge className="bg-warning text-warning-foreground text-[9px] px-1.5 py-0">Below Plan</Badge>;
  if (block.executionRate >= 90) return <Badge className="bg-success text-success-foreground text-[9px] px-1.5 py-0">On Target</Badge>;
  return <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Monitor</Badge>;
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

  const activeFilters = (operatorFilter !== ALL ? 1 : 0) + (phaseFilter !== ALL ? 1 : 0);

  const summaryCards = [
    { label: "Críticos", value: stats.critical, icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
    { label: "Below Plan", value: stats.belowPlan, icon: TrendingDown, color: "text-warning", bg: "bg-warning/10" },
    { label: "On Target", value: stats.onTarget, icon: Target, color: "text-success", bg: "bg-success/10" },
    { label: "Investimento", value: `$${stats.totalInvestment.toLocaleString()}M`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-3">
      {/* Compact top bar: filters + KPIs inline */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filters */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={operatorFilter} onValueChange={setOperatorFilter}>
            <SelectTrigger className="h-7 w-[140px] text-[11px] bg-card border-border/60 rounded-md">
              <SelectValue placeholder="Operador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos Operadores</SelectItem>
              {operators.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="h-7 w-[120px] text-[11px] bg-card border-border/60 rounded-md">
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
              className="h-7 px-2 rounded-md bg-muted/50 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-5 bg-border/60" />

        {/* Inline KPIs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {summaryCards.map(card => (
            <div key={card.label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${card.bg} border border-transparent`}>
              <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
              <span className="text-[10px] text-muted-foreground">{card.label}</span>
              <span className={`text-xs font-bold font-mono ${card.color}`}>{card.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid: 3-column layout — Heatmap | Table | Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1.2fr] gap-3">
        {/* Risk Heatmap — compact */}
        <Card className="glass-card">
          <CardHeader className="px-3 py-2 pb-1">
            <CardTitle className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Risk Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-1">
            <TooltipProvider delayDuration={150}>
              <ScrollArea className="h-[360px]">
                <div className="grid grid-cols-3 xl:grid-cols-4 gap-1">
                  {filtered.map(block => (
                    <UITooltip key={block.id}>
                      <TooltipTrigger asChild>
                        <div
                          className="p-1.5 rounded text-center transition-all hover:scale-105 cursor-default"
                          style={{ backgroundColor: `hsl(${block.riskScore <= 3 ? 'var(--success)' : block.riskScore <= 6 ? 'var(--warning)' : 'var(--danger)'} / 0.15)` }}
                        >
                          <div className="text-[9px] font-medium truncate leading-tight">{block.name}</div>
                          <div className="text-sm font-mono font-bold leading-tight">{block.riskScore}</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        <p className="font-semibold">{block.name}</p>
                        <p className="text-muted-foreground">{block.operator}</p>
                        <p>Risk: {block.riskScore} · Exec: {block.executionRate}%</p>
                      </TooltipContent>
                    </UITooltip>
                  ))}
                  {filtered.length === 0 && (
                    <div className="col-span-full text-center text-xs text-muted-foreground py-6">
                      Nenhum bloco encontrado
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Rankings Table — compact rows */}
        <Card className="glass-card">
          <CardHeader className="px-3 py-2 pb-1">
            <CardTitle className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              Rankings <span className="text-muted-foreground/60 font-normal normal-case">({filtered.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[360px]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-[10px] h-7 px-2">Block</TableHead>
                    <TableHead className="text-[10px] h-7 px-2 hidden xl:table-cell">Operador</TableHead>
                    {([
                      ["dailyProduction", "Prod."],
                      ["riskScore", "Risk"],
                      ["executionRate", "Exec%"],
                      ["accumulatedInvestment", "Inv."],
                    ] as [SortKey, string][]).map(([key, label]) => (
                      <TableHead key={key} className="text-[10px] h-7 px-2 cursor-pointer hover:text-foreground" onClick={() => toggleSort(key)}>
                        <div className="flex items-center gap-0.5">
                          {label}
                          <ArrowUpDown className="w-2.5 h-2.5" />
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-[10px] h-7 px-2">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-6 text-xs">Nenhum bloco</TableCell>
                    </TableRow>
                  )}
                  {sorted.map(block => (
                    <TableRow key={block.id} className="border-border/50 text-[11px]">
                      <TableCell className="font-semibold py-1 px-2">{block.name}</TableCell>
                      <TableCell className="text-muted-foreground py-1 px-2 hidden xl:table-cell">{block.operator}</TableCell>
                      <TableCell className="font-mono py-1 px-2">{block.dailyProduction.toLocaleString()}</TableCell>
                      <TableCell className="py-1 px-2">
                        <span className={`font-mono font-bold ${block.riskScore <= 3 ? 'text-success' : block.riskScore <= 6 ? 'text-warning' : 'text-danger'}`}>
                          {block.riskScore}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono py-1 px-2">{block.executionRate}%</TableCell>
                      <TableCell className="font-mono py-1 px-2">${block.accumulatedInvestment}M</TableCell>
                      <TableCell className="py-1 px-2">{alertBadge(block)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Scatter Chart — side by side instead of below */}
        <Card className="glass-card">
          <CardHeader className="px-3 py-2 pb-1">
            <CardTitle className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Risk vs Execução</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <ResponsiveContainer width="100%" height={360}>
              <ScatterChart margin={{ top: 8, right: 8, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  type="number" dataKey="riskScore" name="Risk" domain={[0, 10]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                >
                  <Label value="Risco" position="bottom" offset={3} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                </XAxis>
                <YAxis
                  type="number" dataKey="executionRate" name="Execução" domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" width={35}
                >
                  <Label value="Exec %" angle={-90} position="insideLeft" offset={8} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                </YAxis>
                <ZAxis type="number" dataKey="dailyProduction" range={[30, 300]} name="Produção" />
                <ReferenceLine y={70} stroke="hsl(var(--warning))" strokeDasharray="4 4" strokeOpacity={0.7} />
                <ReferenceLine x={8} stroke="hsl(var(--danger))" strokeDasharray="4 4" strokeOpacity={0.7} />
                <RechartsTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload as OilBlock;
                    return (
                      <div className="rounded-md border bg-popover p-2 text-[11px] shadow-md">
                        <p className="font-semibold">{d.name}</p>
                        <p className="text-muted-foreground">{d.operator}</p>
                        <p>Risk: <span className="font-mono font-bold">{d.riskScore}</span> · Exec: <span className="font-mono font-bold">{d.executionRate}%</span></p>
                        <p className="text-muted-foreground">{d.dailyProduction.toLocaleString()} BOPD</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={filtered}>
                  {filtered.map((block) => (
                    <Cell
                      key={block.id}
                      fill={`hsl(${block.riskScore <= 3 ? 'var(--success)' : block.riskScore <= 6 ? 'var(--warning)' : 'var(--danger)'})`}
                      fillOpacity={0.7}
                      stroke={`hsl(${block.riskScore <= 3 ? 'var(--success)' : block.riskScore <= 6 ? 'var(--warning)' : 'var(--danger)'})`}
                      strokeWidth={1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
