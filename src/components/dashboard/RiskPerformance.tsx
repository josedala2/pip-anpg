import { oilBlocks, type OilBlock } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

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

  return (
    <div className="space-y-6 2xl:space-y-8">
      {/* Risk Heatmap */}
      <Card className="glass-card">
        <CardHeader className="p-4 3xl:p-6 pb-2">
          <CardTitle className="text-sm 2xl:text-lg 3xl:text-xl">Risk Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="p-4 3xl:p-6 pt-2">
          <div className="grid grid-cols-3 md:grid-cols-5 2xl:grid-cols-6 gap-2 2xl:gap-3 3xl:gap-4">
            {oilBlocks.map(block => (
              <div
                key={block.id}
                className={`p-2.5 2xl:p-4 3xl:p-5 rounded-lg text-center transition-all hover:scale-105 ${riskColor(block.riskScore)} bg-opacity-20`}
                style={{ backgroundColor: `hsl(${block.riskScore <= 3 ? 'var(--success)' : block.riskScore <= 6 ? 'var(--warning)' : 'var(--danger)'} / 0.15)` }}
              >
                <div className="text-xs 2xl:text-sm 3xl:text-base font-bold">{block.name}</div>
                <div className="text-lg 2xl:text-2xl 3xl:text-3xl font-mono font-bold">{block.riskScore}</div>
                <div className="text-[9px] 2xl:text-xs 3xl:text-sm text-muted-foreground">{block.operator}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ranking Table */}
      <Card className="glass-card">
        <CardHeader className="p-4 3xl:p-6 pb-2">
          <CardTitle className="text-sm 2xl:text-lg 3xl:text-xl">Block Rankings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs 2xl:text-sm 3xl:text-base">Block</TableHead>
                <TableHead className="text-xs 2xl:text-sm 3xl:text-base">Operator</TableHead>
                {([
                  ["dailyProduction", "Production"],
                  ["riskScore", "Risk"],
                  ["executionRate", "Execution %"],
                  ["accumulatedInvestment", "Investment"],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <TableHead key={key} className="text-xs 2xl:text-sm 3xl:text-base cursor-pointer hover:text-foreground" onClick={() => toggleSort(key)}>
                    <div className="flex items-center gap-1">
                      {label}
                      <ArrowUpDown className="w-3 h-3 3xl:w-4 3xl:h-4" />
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-xs 2xl:text-sm 3xl:text-base">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(block => (
                <TableRow key={block.id} className="border-border text-xs 2xl:text-sm 3xl:text-base">
                  <TableCell className="font-semibold">{block.name}</TableCell>
                  <TableCell className="text-muted-foreground">{block.operator}</TableCell>
                  <TableCell className="font-mono">{block.dailyProduction.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`font-mono font-bold ${block.riskScore <= 3 ? 'text-success' : block.riskScore <= 6 ? 'text-warning' : 'text-danger'}`}>
                      {block.riskScore}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono">{block.executionRate}%</TableCell>
                  <TableCell className="font-mono">${block.accumulatedInvestment}M</TableCell>
                  <TableCell>{alertBadge(block)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
