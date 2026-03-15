import { useMemo, useState } from "react";
import { oilBlocks, getTotalProduction } from "@/data/angolaBlocks";
import { ChartWrapper } from "./ChartWrapper";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import {
  Treemap, ResponsiveContainer, Tooltip,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))",
  "hsl(var(--danger))", "hsl(210, 70%, 55%)", "hsl(280, 60%, 55%)",
  "hsl(30, 80%, 55%)", "hsl(160, 60%, 45%)", "hsl(340, 65%, 50%)",
  "hsl(200, 55%, 50%)", "hsl(120, 50%, 45%)", "hsl(50, 70%, 50%)",
];

const statusColors: Record<string, string> = {
  Producing: "text-success",
  Development: "text-warning",
  Discovery: "text-primary",
  Abandoned: "text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  Producing: "Produção",
  Development: "Desenvolvimento",
  Discovery: "Descoberta",
  Abandoned: "Abandonado",
};

interface TreemapContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  blockName?: string;
  fill: string;
  hoveredBlock?: string | null;
}

const CustomTreemapContent = ({ x, y, width, height, name, blockName, fill, hoveredBlock }: TreemapContentProps) => {
  const showLabel = width > 50 && height > 30;
  const showBlock = width > 80 && height > 45;
  const dimmed = hoveredBlock && blockName !== hoveredBlock;
  return (
    <g style={{ opacity: dimmed ? 0.2 : 1, transition: "opacity 0.2s ease" }}>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="hsl(var(--background))" strokeWidth={2} rx={3} />
      {showLabel && (
        <text x={x + width / 2} y={y + height / 2 - (showBlock ? 6 : 0)} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={width > 100 ? 11 : 9} fontWeight={600}>
          {name.length > 15 ? name.slice(0, 13) + "…" : name}
        </text>
      )}
      {showBlock && (
        <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.7)" fontSize={8}>
          {blockName}
        </text>
      )}
    </g>
  );
};

interface FieldProductionBreakdownProps {
  filterOperator?: string;
  filterBasin?: string;
  filterBlock?: string;
}

export const FieldProductionBreakdown = ({ filterOperator = "all", filterBasin = "all", filterBlock = "all" }: FieldProductionBreakdownProps) => {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [pinnedBlock, setPinnedBlock] = useState<string | null>(null);
  const activeBlock = pinnedBlock || hoveredBlock;
  const totalProduction = useMemo(() => getTotalProduction(), []);

  const blocksWithFields = useMemo(() =>
    oilBlocks
      .filter(b => {
        if (b.dailyProduction <= 0 || !b.fields || b.fields.length === 0) return false;
        if (filterOperator !== "all" && b.operator !== filterOperator) return false;
        if (filterBasin !== "all" && b.basin !== filterBasin) return false;
        if (filterBlock !== "all" && b.id !== filterBlock) return false;
        return true;
      })
      .map(b => {
        const producingFields = b.fields!.filter(f => f.status === "Producing" && f.peakProduction && f.peakProduction > 0);
        const otherFields = b.fields!.filter(f => f.status !== "Producing" || !f.peakProduction);
        return { ...b, producingFields, otherFields };
      })
      .filter(b => b.producingFields.length > 0)
      .sort((a, b) => b.dailyProduction - a.dailyProduction),
    [filterOperator, filterBasin, filterBlock]
  );

  const treemapData = useMemo(() =>
    blocksWithFields.map((block, bi) => ({
      name: block.name,
      children: block.producingFields.map(f => ({
        name: f.name,
        size: f.peakProduction!,
        blockName: block.name,
        fill: COLORS[bi % COLORS.length],
      })),
    })),
    [blocksWithFields]
  );

  const flatTreemap = useMemo(() =>
    treemapData.flatMap(block =>
      block.children.map(c => ({ ...c }))
    ),
    [treemapData]
  );

  const toggleBlock = (id: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Treemap */}
      <ChartWrapper title="Produção por Campo/Instalação (Pico de Produção · BOPD)" height={520}>
        <ResponsiveContainer width="100%" height={340}>
          <Treemap
            data={flatTreemap}
            dataKey="size"
            nameKey="name"
            aspectRatio={4 / 3}
            stroke="hsl(var(--background))"
            content={<CustomTreemapContent x={0} y={0} width={0} height={0} name="" fill="" hoveredBlock={activeBlock} />}
          >
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }}
              formatter={(value: number, _: string, entry: any) => [
                `${value.toLocaleString()} BOPD`,
                entry?.payload?.blockName || ""
              ]}
            />
          </Treemap>
        </ResponsiveContainer>
        <div className="mx-4 mt-4 mb-2 rounded-md border border-border/50 bg-muted/30 px-4 py-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Legenda — Blocos</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {blocksWithFields.map((block, i) => (
              <div
                key={block.id}
                className={`flex items-center gap-1.5 cursor-pointer rounded px-1.5 py-0.5 transition-colors hover:bg-muted/60 ${pinnedBlock === block.name ? "ring-1 ring-foreground/30 bg-muted/50" : ""}`}
                onMouseEnter={() => setHoveredBlock(block.name)}
                onMouseLeave={() => setHoveredBlock(null)}
                onClick={() => setPinnedBlock(prev => prev === block.name ? null : block.name)}
                style={{ opacity: activeBlock && activeBlock !== block.name ? 0.4 : 1, transition: "opacity 0.2s ease" }}
              >
                <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-[11px] text-foreground/70">{block.name}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="px-4 pb-1 text-[10px] text-muted-foreground">
          Dimensão proporcional ao pico histórico de produção de cada campo.
        </p>
      </ChartWrapper>

      {/* Expandable Table */}
      <ChartWrapper title="Campos por Bloco — Detalhes de Produção" height="auto">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Bloco / Campo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Pico Produção (BOPD)</TableHead>
                <TableHead className="text-right">Ano Descoberta</TableHead>
                <TableHead className="text-right">Nº Campos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocksWithFields.map((block) => {
                const isExpanded = expandedBlocks.has(block.id);
                const allFields = [...block.producingFields, ...block.otherFields];
                const totalPeak = block.producingFields.reduce((s, f) => s + (f.peakProduction || 0), 0);
                return (
                  <>
                    <TableRow
                      key={block.id}
                      className="cursor-pointer hover:bg-muted/70"
                      onClick={() => toggleBlock(block.id)}
                    >
                      <TableCell className="px-2">
                        {isExpanded
                          ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        }
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-primary" />
                          {block.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{block.phase}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">
                        {totalPeak.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">—</TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {allFields.length}
                      </TableCell>
                    </TableRow>
                    {isExpanded && allFields.map((field, fi) => (
                      <TableRow key={`${block.id}-${fi}`} className="bg-muted/20">
                        <TableCell />
                        <TableCell className="pl-10 text-xs">{field.name}</TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-medium ${statusColors[field.status]}`}>
                            {statusLabels[field.status]}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {field.peakProduction ? field.peakProduction.toLocaleString() : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {field.discoveryYear || "—"}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    ))}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ChartWrapper>
    </div>
  );
};
