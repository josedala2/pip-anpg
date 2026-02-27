import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableProperties, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

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

type SortKey = "name" | "operator" | "phase" | "s2D" | "s3D" | "s4D" | "pesquisa" | "avaliacao" | "totalWells" | "discoveries" | "successRate";
type SortDir = "asc" | "desc";

interface Props {
  blocks: BlockData[];
  scopeLabel: string;
}

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
  return dir === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
};

export const ExplorationSummaryTable = ({ blocks, scopeLabel }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("totalWells");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "operator" || key === "phase" ? "asc" : "desc");
    }
  };

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
          name: b.name, operator: b.operator, phase: b.phase,
          s2D, s3D, s4D, pesquisa, avaliacao, totalWells,
          discoveries, successRate, hasData: s2D > 0 || s3D > 0 || totalWells > 0,
        };
      })
      .filter(b => b.hasData);
  }, [blocks]);

  const sortedData = useMemo(() => {
    const mult = sortDir === "asc" ? 1 : -1;
    return [...tableData].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * mult;
      return ((av as number) - (bv as number)) * mult;
    });
  }, [tableData, sortKey, sortDir]);

  if (tableData.length === 0) return null;

  const cols: { key: SortKey; label: string; align?: string }[] = [
    { key: "name", label: "Bloco" },
    { key: "operator", label: "Operador" },
    { key: "phase", label: "Fase" },
    { key: "s2D", label: "2D (km)", align: "text-right" },
    { key: "s3D", label: "3D (km²)", align: "text-right" },
    { key: "s4D", label: "4D (km²)", align: "text-right" },
    { key: "pesquisa", label: "Pesquisa", align: "text-right" },
    { key: "avaliacao", label: "Avaliação", align: "text-right" },
    { key: "totalWells", label: "Total Poços", align: "text-right" },
    { key: "discoveries", label: "Descobertas", align: "text-right" },
    { key: "successRate", label: "Taxa Sucesso", align: "text-right" },
  ];

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
                {cols.map(col => (
                  <TableHead
                    key={col.key}
                    className={`text-[10px] uppercase tracking-wider h-9 sticky top-0 bg-card z-10 cursor-pointer select-none hover:text-foreground transition-colors ${col.align || ""}`}
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <SortIcon active={sortKey === col.key} dir={sortDir} />
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map(row => (
                <TableRow key={row.name} className="border-border/30 hover:bg-secondary/30">
                  <TableCell className="py-2 px-4 text-xs font-semibold">{row.name}</TableCell>
                  <TableCell className="py-2 px-4 text-[11px] text-muted-foreground">{row.operator}</TableCell>
                  <TableCell className="py-2 px-4">
                    <Badge variant="outline" className={`text-[9px] ${phaseColor(row.phase)}`}>{row.phase}</Badge>
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right">{row.s2D > 0 ? row.s2D.toLocaleString() : "—"}</TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right">{row.s3D > 0 ? row.s3D.toLocaleString() : "—"}</TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right">{row.s4D > 0 ? row.s4D.toLocaleString() : "—"}</TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right text-primary">{row.pesquisa > 0 ? row.pesquisa : "—"}</TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right text-warning">{row.avaliacao > 0 ? row.avaliacao : "—"}</TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right font-semibold">{row.totalWells > 0 ? row.totalWells : "—"}</TableCell>
                  <TableCell className="py-2 px-4 text-xs font-mono text-right text-success">{row.discoveries > 0 ? row.discoveries : "—"}</TableCell>
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
