import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import type { OilBlock } from "@/data/angolaBlocks";

interface ProspectsTableProps {
  blocks: OilBlock[];
  scopeLabel: string;
}

const posColor = (pos: number) => {
  if (pos >= 50) return "text-success";
  if (pos >= 25) return "text-warning";
  return "text-danger";
};

export const ProspectsTable = ({ blocks, scopeLabel }: ProspectsTableProps) => {
  const blocksWithProspects = useMemo(
    () => blocks.filter(b => b.prospects && b.prospects.length > 0),
    [blocks]
  );

  const totals = useMemo(() => {
    let mmbo = 0, bcf = 0, count = 0;
    blocksWithProspects.forEach(b => {
      b.prospects!.forEach(p => {
        mmbo += p.resourcesMMBO;
        bcf += p.resourcesBCF || 0;
        count++;
      });
    });
    return { mmbo, bcf, count };
  }, [blocksWithProspects]);

  if (blocksWithProspects.length === 0) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Prospectos & Recursos — {scopeLabel}
          <Badge variant="outline" className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/30">
            {totals.count} prospectos · {totals.mmbo.toLocaleString(undefined, { maximumFractionDigits: 1 })} MMBO
            {totals.bcf > 0 && ` · ${totals.bcf.toLocaleString()} BCF`}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="relative w-full overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-[10px] uppercase tracking-wider">Bloco</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Discovery Area</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Prospecto</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Reservatório</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-right">MMBO</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-right">BCF</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-right">POS (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocksWithProspects.map(block =>
                block.prospects!.map((p, i) => (
                  <TableRow key={`${block.id}-${i}`} className="border-border/30 hover:bg-secondary/30">
                    {i === 0 && (
                      <TableCell rowSpan={block.prospects!.length} className="text-xs font-semibold align-top border-r border-border/20">
                        {block.name}
                      </TableCell>
                    )}
                    <TableCell className="text-xs text-muted-foreground">{p.discoveryArea}</TableCell>
                    <TableCell className="text-xs font-mono">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{p.reservoir}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-right font-medium">
                      {p.resourcesMMBO.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-right text-muted-foreground">
                      {p.resourcesBCF ? p.resourcesBCF.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className={`text-xs font-mono text-right font-bold ${posColor(p.pos)}`}>
                      {p.pos}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
