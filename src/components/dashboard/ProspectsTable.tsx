import { useMemo, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Target, Search } from "lucide-react";
import { SortableHead } from "@/components/ui/sortable-head";
import { useTableSort } from "@/hooks/useTableSort";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
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

const posHsl = (pos: number) => {
  if (pos >= 50) return "hsl(var(--success))";
  if (pos >= 25) return "hsl(var(--warning))";
  return "hsl(var(--danger))";
};

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const BubbleTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipStyle} className="p-2 space-y-0.5">
      <div className="font-semibold text-xs">{d.name}</div>
      <div className="text-[10px] text-muted-foreground">{d.block} · {d.discoveryArea}</div>
      <div className="text-[10px]">Reservatório: {d.reservoir}</div>
      <div className="text-[10px] font-mono">{d.resourcesMMBO.toLocaleString()} MMBO · POS {d.pos}%</div>
      {d.resourcesBCF > 0 && <div className="text-[10px] font-mono">{d.resourcesBCF.toLocaleString()} BCF</div>}
    </div>
  );
};

export const ProspectsTable = ({ blocks, scopeLabel }: ProspectsTableProps) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [prospectSearch, setProspectSearch] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);

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

  const flatProspects = useMemo(() => {
    const q = prospectSearch.toLowerCase();
    const data: { block: string; blockId: string; discoveryArea: string; name: string; reservoir: string; resourcesMMBO: number; resourcesBCF: number; pos: number; key: string; z: number; idx: number }[] = [];
    blocksWithProspects.forEach(b => {
      b.prospects!.forEach((p, i) => {
        data.push({
          block: b.name,
          blockId: b.id,
          discoveryArea: p.discoveryArea,
          name: p.name,
          reservoir: p.reservoir,
          resourcesMMBO: p.resourcesMMBO,
          resourcesBCF: p.resourcesBCF || 0,
          pos: p.pos,
          idx: i,
          key: `${b.id}-${i}`,
          z: Math.max(p.resourcesMMBO, 20),
        });
      });
    });
    if (!q) return data;
    return data.filter(d =>
      d.block.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q) ||
      d.discoveryArea.toLowerCase().includes(q) ||
      d.reservoir.toLowerCase().includes(q)
    );
  }, [blocksWithProspects, prospectSearch]);

  const prospectSort = useTableSort(flatProspects, "resourcesMMBO", "desc", ["block", "discoveryArea", "name", "reservoir"]);

  const bubbleData = flatProspects;

  const handleBubbleClick = useCallback((data: any) => {
    if (!data) return;
    const key = data.key;
    setSelectedKey(prev => prev === key ? null : key);
    // Scroll to highlighted row
    setTimeout(() => {
      const row = document.getElementById(`prospect-row-${key}`);
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, []);

  if (blocksWithProspects.length === 0) return null;

  return (
    <>
      {/* Bubble Chart */}
      <Card className="glass-card">
         <CardHeader className="p-4 2xl:p-5 pb-2">
           <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
             <Target className="w-4 h-4 2xl:w-5 2xl:h-5 text-primary" />
             Recursos vs Probabilidade de Sucesso — {scopeLabel}
            {selectedKey && (
              <button
                onClick={() => setSelectedKey(null)}
                className="ml-auto text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar selecção
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="pos"
                name="POS"
                unit="%"
                domain={[0, 80]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                stroke="hsl(var(--border))"
                label={{ value: "POS (%)", position: "bottom", offset: 0, style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 } }}
              />
              <YAxis
                type="number"
                dataKey="resourcesMMBO"
                name="MMBO"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                stroke="hsl(var(--border))"
                width={60}
                label={{ value: "Recursos (MMBO)", angle: -90, position: "insideLeft", offset: 5, style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 } }}
              />
              <ZAxis type="number" dataKey="z" range={[40, 600]} />
              <Tooltip content={<BubbleTooltip />} />
              <Scatter
                data={bubbleData}
                fillOpacity={0.7}
                strokeWidth={1}
                stroke="hsl(var(--border))"
                onClick={handleBubbleClick}
                className="cursor-pointer"
              >
                {bubbleData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={posHsl(d.pos)}
                    fillOpacity={selectedKey === null || selectedKey === d.key ? 0.8 : 0.15}
                    strokeWidth={selectedKey === d.key ? 3 : 1}
                    stroke={selectedKey === d.key ? "hsl(var(--foreground))" : "hsl(var(--border))"}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px]"><span className="w-2.5 h-2.5 rounded-full bg-danger" /> POS &lt;25%</div>
            <div className="flex items-center gap-1.5 text-[10px]"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> POS 25–49%</div>
            <div className="flex items-center gap-1.5 text-[10px]"><span className="w-2.5 h-2.5 rounded-full bg-success" /> POS ≥50%</div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card">
         <CardHeader className="p-4 2xl:p-5 pb-2">
           <div className="flex items-center justify-between gap-3 flex-wrap">
             <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
               <Target className="w-4 h-4 2xl:w-5 2xl:h-5 text-primary" />
               Prospectos & Recursos — {scopeLabel}
               <Badge variant="outline" className="text-[10px] 2xl:text-xs bg-primary/10 text-primary border-primary/30">
                {prospectSort.sorted.length}{prospectSort.sorted.length !== totals.count ? ` de ${totals.count}` : ""} prospectos · {totals.mmbo.toLocaleString(undefined, { maximumFractionDigits: 1 })} MMBO
                {totals.bcf > 0 && ` · ${totals.bcf.toLocaleString()} BCF`}
              </Badge>
            </CardTitle>
            <div className="relative w-52">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Pesquisar prospecto..."
                value={prospectSearch}
                onChange={e => setProspectSearch(e.target.value)}
                className="h-7 pl-7 text-xs glass-card border-border/50"
              />
            </div>
           </div>
         </CardHeader>
        <CardContent className="p-4 pt-2">
          <div ref={tableRef} className="relative w-full overflow-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <SortableHead label="Bloco" colKey="block" sortKey={prospectSort.sortKey} sortDir={prospectSort.sortDir} onSort={prospectSort.handleSort} className="text-[10px] 2xl:text-xs uppercase tracking-wider" />
                  <SortableHead label="Discovery Area" colKey="discoveryArea" sortKey={prospectSort.sortKey} sortDir={prospectSort.sortDir} onSort={prospectSort.handleSort} className="text-[10px] 2xl:text-xs uppercase tracking-wider" />
                  <SortableHead label="Prospecto" colKey="name" sortKey={prospectSort.sortKey} sortDir={prospectSort.sortDir} onSort={prospectSort.handleSort} className="text-[10px] 2xl:text-xs uppercase tracking-wider" />
                  <SortableHead label="Reservatório" colKey="reservoir" sortKey={prospectSort.sortKey} sortDir={prospectSort.sortDir} onSort={prospectSort.handleSort} className="text-[10px] 2xl:text-xs uppercase tracking-wider" />
                  <SortableHead label="MMBO" colKey="resourcesMMBO" sortKey={prospectSort.sortKey} sortDir={prospectSort.sortDir} onSort={prospectSort.handleSort} className="text-[10px] 2xl:text-xs uppercase tracking-wider" align="text-right" />
                  <SortableHead label="BCF" colKey="resourcesBCF" sortKey={prospectSort.sortKey} sortDir={prospectSort.sortDir} onSort={prospectSort.handleSort} className="text-[10px] 2xl:text-xs uppercase tracking-wider" align="text-right" />
                  <SortableHead label="POS (%)" colKey="pos" sortKey={prospectSort.sortKey} sortDir={prospectSort.sortDir} onSort={prospectSort.handleSort} className="text-[10px] 2xl:text-xs uppercase tracking-wider" align="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {prospectSort.sorted.map(p => {
                  const isSelected = selectedKey === p.key;
                  return (
                    <TableRow
                      key={p.key}
                      id={`prospect-row-${p.key}`}
                      className={`border-border/30 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "bg-primary/15 ring-1 ring-primary/40"
                          : selectedKey !== null
                            ? "opacity-40 hover:opacity-70"
                            : "hover:bg-secondary/30"
                      }`}
                      onClick={() => setSelectedKey(isSelected ? null : p.key)}
                    >
                      <TableCell className="text-xs 2xl:text-sm font-semibold">{p.block}</TableCell>
                      <TableCell className="text-xs 2xl:text-sm text-muted-foreground">{p.discoveryArea}</TableCell>
                      <TableCell className="text-xs 2xl:text-sm font-mono">{p.name}</TableCell>
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
