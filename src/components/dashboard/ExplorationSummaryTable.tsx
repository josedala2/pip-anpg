import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableProperties } from "lucide-react";

interface BlockData {
  id: string;
  name: string;
  operator: string;
  basin: string;
  phase: string;
  seismicData?: { seismic2D: number; seismic3D: number; seismic4D: number }[];
  wellsData?: { pesquisa: number; avaliacao: number }[];
  fields?: { name: string }[];
}

const phaseColor = (phase: string) => {
  switch (phase) {
    case "Production": return "bg-success/15 text-success border-success/30";
    case "Development": return "bg-warning/15 text-warning border-warning/30";
    case "Exploration": return "bg-primary/15 text-primary border-primary/30";
    case "Suspended": return "bg-danger/15 text-danger border-danger/30";
    case "Bidding": return "bg-[hsl(280,65%,60%)]/15 text-[hsl(280,65%,60%)] border-[hsl(280,65%,60%)]/30";
    default: return "bg-muted text-muted-foreground";
  }
};

interface Props {
  blocks: BlockData[];
  scopeLabel: string;
}

export const ExplorationSummaryTable = ({ blocks, scopeLabel }: Props) => {
  const tableData = useMemo(() => {
    return blocks
      .map(b => {
        const s2D = (b.seismicData || []).reduce((s, d) => s + d.seismic2D, 0);
        const s3D = (b.seismicData || []).reduce((s, d) => s + d.seismic3D, 0);
        const s4D = (b.seismicData || []).reduce((s, d) => s + d.seismic4D, 0);
        const pesquisa = (b.wellsData || []).reduce((s, d) => s + d.pesquisa, 0);
        const avaliacao = (b.wellsData || []).reduce((s, d) => s + d.avaliacao, 0);
        const totalWells = pesquisa + avaliacao;
        const discoveries = b.fields?.length || 0;
        const successRate = totalWells > 0 ? Math.min(Math.round((discoveries / totalWells) * 100), 100) : null;

        return {
          name: b.name,
          operator: b.operator,
          phase: b.phase,
          s2D, s3D, s4D,
          pesquisa, avaliacao, totalWells,
          discoveries, successRate,
          hasData: s2D > 0 || s3D > 0 || totalWells > 0,
        };
      })
      .filter(b => b.hasData)
      .sort((a, b) => b.totalWells - a.totalWells || b.s3D - a.s3D);
  }, [blocks]);

  if (tableData.length === 0) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TableProperties className="w-4 h-4 text-primary" />
          Resumo de Exploração por Bloco — {scopeLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="relative w-full overflow-auto max-h-[420px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-[10px] uppercase tracking-wider h-9 sticky top-0 bg-card z-10">Bloco</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider h-9 sticky top-0 bg-card z-10">Operador</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider h-9 sticky top-0 bg-card z-10">Fase</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider h-9 text-right sticky top-0 bg-card z-10">2D (km)</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider h-9 text-right sticky top-0 bg-card z-10">3D (km²)</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider h-9 text-right sticky top-0 bg-card z-10">4D (km²)</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider h-9 text-right sticky top-0 bg-card z-10">Pesquisa</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider h-9 text-right sticky top-0 bg-card z-10">Avaliação</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider h-9 text-right sticky top-0 bg-card z-10">Total Poços</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider h-9 text-right sticky top-0 bg-card z-10">Descobertas</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider h-9 text-right sticky top-0 bg-card z-10">Taxa Sucesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map(row => (
                <TableRow key={row.name} className="border-border/30 hover:bg-secondary/30">
                  <TableCell className="py-2 px-4 text-xs font-semibold">{row.name}</TableCell>
                  <TableCell className="py-2 px-4 text-[11px] text-muted-foreground">{row.operator}</TableCell>
                  <TableCell className="py-2 px-4">
                    <Badge variant="outline" className={`text-[9px] ${phaseColor(row.phase)}`}>
                      {row.phase}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right">
                    {row.s2D > 0 ? row.s2D.toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right">
                    {row.s3D > 0 ? row.s3D.toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right">
                    {row.s4D > 0 ? row.s4D.toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right text-primary">
                    {row.pesquisa > 0 ? row.pesquisa : "—"}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right text-warning">
                    {row.avaliacao > 0 ? row.avaliacao : "—"}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right font-semibold">
                    {row.totalWells > 0 ? row.totalWells : "—"}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right text-success">
                    {row.discoveries > 0 ? row.discoveries : "—"}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right">
                    {row.successRate !== null ? (
                      <span className={row.successRate >= 50 ? "text-success" : row.successRate >= 25 ? "text-warning" : "text-danger"}>
                        {row.successRate}%
                      </span>
                    ) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          {tableData.length} bloco{tableData.length !== 1 ? "s" : ""} com dados de exploração
        </div>
      </CardContent>
    </Card>
  );
};
