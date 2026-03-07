import { oilBlocks, type OilBlock } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useMemo } from "react";
import { ArrowUpDown, AlertTriangle, TrendingDown, Target, DollarSign } from "lucide-react";

type SortKey = "dailyProduction" | "riskScore" | "executionRate" | "accumulatedInvestment";

const alertBadge = (block: OilBlock) => {
  if (block.riskScore >= 8) return <Badge className="bg-danger text-danger-foreground text-[10px]">Critical</Badge>;
  if (block.executionRate < 70) return <Badge className="bg-warning text-warning-foreground text-[10px]">Below Plan</Badge>;
  if (block.executionRate >= 90) return <Badge className="bg-success text-success-foreground text-[10px]">On Target</Badge>;
  return <Badge variant="secondary" className="text-[10px]">Monitor</Badge>;
};

export const RiskPerformance = () => {
  const [sortKey, setSortKey] = useState<SortKey>("riskScore");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...oilBlocks].sort((a, b) => {
    const diff = (a[sortKey] as number) - (b[sortKey] as number);
    return sortAsc ? diff : -diff;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const riskColor = (score: number) =>
    score <= 3 ? "bg-success" : score <= 6 ? "bg-warning" : "bg-danger";

  const stats = useMemo(() => ({
    critical: oilBlocks.filter(b => b.riskScore >= 8).length,
    belowPlan: oilBlocks.filter(b => b.executionRate < 70).length,
    onTarget: oilBlocks.filter(b => b.executionRate >= 90).length,
    totalInvestment: oilBlocks.reduce((s, b) => s + b.accumulatedInvestment, 0),
  }), []);

  const summaryCards = [
    { label: "Blocos Críticos", value: stats.critical, icon: AlertTriangle, color: "text-danger" },
    { label: "Below Plan", value: stats.belowPlan, icon: TrendingDown, color: "text-warning" },
    { label: "On Target", value: stats.onTarget, icon: Target, color: "text-success" },
    { label: "Investimento Total", value: `$${stats.totalInvestment.toLocaleString()}M`, icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="space-y-4 2xl:space-y-6">
      {/* KPI Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 2xl:gap-3">
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
                {oilBlocks.map(block => (
                  <Tooltip key={block.id}>
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
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Ranking Table */}
        <Card className="glass-card">
          <CardHeader className="p-3 2xl:p-4 pb-1">
            <CardTitle className="text-sm 2xl:text-base">Block Rankings</CardTitle>
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
    </div>
  );
};
