import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { oilBlocks, type OilBlock, type WaterDepth } from "@/data/angolaBlocks";
import { Badge } from "@/components/ui/badge";
import { Filter, MapPin, Users, Droplets, TrendingUp, ChevronDown, ChevronUp, Map } from "lucide-react";
import { ConcessionMap } from "./ConcessionMap";

const operators = [...new Set(oilBlocks.map(b => b.operator))].sort();
const basins = [...new Set(oilBlocks.map(b => b.basin))].sort();
const phases = ["Production", "Development", "Exploration", "Suspended"];
const waterDepths: WaterDepth[] = ["Onshore", "Shallow Water", "Deep Water", "Ultra-Deep Water"];

const phaseColor = (phase: string) => {
  switch (phase) {
    case "Production": return "bg-success/15 text-success border-success/30";
    case "Development": return "bg-warning/15 text-warning border-warning/30";
    case "Exploration": return "bg-primary/15 text-primary border-primary/30";
    case "Suspended": return "bg-danger/15 text-danger border-danger/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const depthLabel: Record<WaterDepth, string> = {
  "Onshore": "Onshore",
  "Shallow Water": "Águas Rasas",
  "Deep Water": "Águas Profundas",
  "Ultra-Deep Water": "Ultra-Profundas",
};

interface BlockCardProps {
  block: OilBlock;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (block: OilBlock) => void;
  onHover: (id: string | null) => void;
}

const BlockCard = ({ block, isSelected, isHovered, onSelect, onHover }: BlockCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setExpanded(true);
    }
  }, [isSelected]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => onHover(block.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Card className={`glass-card transition-all ${isSelected ? "border-primary/50 ring-1 ring-primary/20" : isHovered ? "border-primary/30" : "hover:border-primary/20"}`}>
        <CardContent className="p-0">
          <button
            onClick={() => { setExpanded(!expanded); onSelect(block); }}
            className="w-full text-left p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs">{block.name}</span>
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${phaseColor(block.phase)}`}>
                    {block.phase}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  <span className="font-medium text-foreground">{block.operator}</span>
                  <span className="mx-1">·</span>
                  {block.basin} · {depthLabel[block.waterDepth]}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {block.dailyProduction > 0 && (
                  <span className="text-xs font-bold font-mono">{(block.dailyProduction / 1000).toFixed(0)}k</span>
                )}
                {expanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
              </div>
            </div>
          </button>

          {expanded && (
            <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2 animate-fade-in">
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "Reservas", value: `${block.estimatedReserves}M` },
                  { label: "Investido", value: `$${(block.accumulatedInvestment / 1000).toFixed(1)}B` },
                  { label: "Execução", value: `${block.executionRate}%` },
                  { label: "Risco", value: `${block.riskScore}/10` },
                ].map(m => (
                  <div key={m.label} className="glass-card p-1.5 rounded text-center">
                    <div className="text-[8px] text-muted-foreground">{m.label}</div>
                    <div className="text-[11px] font-bold font-mono">{m.value}</div>
                  </div>
                ))}
              </div>

              {block.concession.length > 0 && (
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Consórcio</div>
                  <div className="space-y-0.5">
                    {block.concession.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px]">
                        <span className={p.isOperator ? "font-semibold text-foreground" : "text-muted-foreground"}>
                          {p.name} {p.isOperator && <span className="text-primary text-[9px]">(OP)</span>}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${p.share}%` }} />
                          </div>
                          <span className="font-mono w-10 text-right text-[9px]">{p.share.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const BlocksPanel = () => {
  const [filterOperator, setFilterOperator] = useState("all");
  const [filterBasin, setFilterBasin] = useState("all");
  const [filterPhase, setFilterPhase] = useState("all");
  const [filterDepth, setFilterDepth] = useState("all");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  const filteredBlocks = useMemo(() => {
    return oilBlocks.filter(b => {
      if (filterOperator !== "all" && b.operator !== filterOperator) return false;
      if (filterBasin !== "all" && b.basin !== filterBasin) return false;
      if (filterPhase !== "all" && b.phase !== filterPhase) return false;
      if (filterDepth !== "all" && b.waterDepth !== filterDepth) return false;
      return true;
    });
  }, [filterOperator, filterBasin, filterPhase, filterDepth]);

  const stats = useMemo(() => ({
    total: filteredBlocks.length,
    production: filteredBlocks.filter(b => b.phase === "Production").length,
    totalProd: filteredBlocks.reduce((s, b) => s + b.dailyProduction, 0),
    totalReserves: filteredBlocks.reduce((s, b) => s + b.estimatedReserves, 0),
  }), [filteredBlocks]);

  const hasFilters = filterOperator !== "all" || filterBasin !== "all" || filterPhase !== "all" || filterDepth !== "all";

  const grouped = useMemo(() => {
    const groups: Record<string, OilBlock[]> = {};
    filteredBlocks.forEach(b => {
      if (!groups[b.waterDepth]) groups[b.waterDepth] = [];
      groups[b.waterDepth].push(b);
    });
    return groups;
  }, [filteredBlocks]);

  const handleBlockClick = useCallback((block: OilBlock) => {
    setSelectedBlockId(prev => prev === block.id ? null : block.id);
  }, []);

  const handleBlockHover = useCallback((id: string | null) => {
    setHoveredBlockId(id);
  }, []);

  return (
    <div className="space-y-4">
      {/* Filters + Stats */}
      <Card className="glass-card">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            Mapa de Concessões
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Select value={filterOperator} onValueChange={setFilterOperator}>
              <SelectTrigger className="w-36 md:w-40 h-7 text-xs glass-card border-border/50"><SelectValue placeholder="Operador" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos Operadores</SelectItem>
                {operators.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterBasin} onValueChange={setFilterBasin}>
              <SelectTrigger className="w-36 md:w-40 h-7 text-xs glass-card border-border/50"><SelectValue placeholder="Bacia" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas Bacias</SelectItem>
                {basins.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPhase} onValueChange={setFilterPhase}>
              <SelectTrigger className="w-36 md:w-40 h-7 text-xs glass-card border-border/50"><SelectValue placeholder="Fase" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas Fases</SelectItem>
                {phases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterDepth} onValueChange={setFilterDepth}>
              <SelectTrigger className="w-36 md:w-40 h-7 text-xs glass-card border-border/50"><SelectValue placeholder="Profundidade" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas Profundidades</SelectItem>
                {waterDepths.map(d => <SelectItem key={d} value={d}>{depthLabel[d]}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <button onClick={() => { setFilterOperator("all"); setFilterBasin("all"); setFilterPhase("all"); setFilterDepth("all"); }}
                className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors">Limpar</button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="glass-card p-1.5 rounded-lg text-center">
              <div className="text-[9px] text-muted-foreground">Blocos</div>
              <div className="text-base font-bold font-mono">{stats.total}</div>
            </div>
            <div className="glass-card p-1.5 rounded-lg text-center">
              <div className="text-[9px] text-muted-foreground">Produção</div>
              <div className="text-base font-bold font-mono text-success">{stats.production}</div>
            </div>
            <div className="glass-card p-1.5 rounded-lg text-center">
              <div className="text-[9px] text-muted-foreground">Prod. Total</div>
              <div className="text-base font-bold font-mono">{(stats.totalProd / 1000).toFixed(0)}k</div>
            </div>
            <div className="glass-card p-1.5 rounded-lg text-center">
              <div className="text-[9px] text-muted-foreground">Reservas</div>
              <div className="text-base font-bold font-mono">{(stats.totalReserves / 1000).toFixed(1)}B</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map + Block List side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Interactive Map */}
        <Card className="glass-card">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs flex items-center gap-2">
              <Map className="w-3.5 h-3.5 text-primary" />
              Vista Geográfica
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ConcessionMap
              blocks={filteredBlocks}
              selectedBlockId={selectedBlockId}
              hoveredBlockId={hoveredBlockId}
              onBlockClick={handleBlockClick}
              onBlockHover={handleBlockHover}
            />
          </CardContent>
        </Card>

        {/* Block List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {(["Deep Water", "Ultra-Deep Water", "Shallow Water", "Onshore"] as WaterDepth[]).map(depth => {
            const blocks = grouped[depth];
            if (!blocks || blocks.length === 0) return null;
            return (
              <div key={depth} className="space-y-1.5">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {depthLabel[depth]} ({blocks.length})
                </h3>
                <div className="space-y-1.5">
                  {blocks.map(block => (
                    <BlockCard
                      key={block.id}
                      block={block}
                      isSelected={selectedBlockId === block.id}
                      isHovered={hoveredBlockId === block.id}
                      onSelect={handleBlockClick}
                      onHover={handleBlockHover}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
