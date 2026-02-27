import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { oilBlocks, type OilBlock, type WaterDepth } from "@/data/angolaBlocks";
import { Badge } from "@/components/ui/badge";
import { Filter, Map, ChevronDown, ChevronRight, ExternalLink, Search } from "lucide-react";
import { ConcessionMap } from "./ConcessionMap";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const operators = [...new Set(oilBlocks.map(b => b.operator))].sort();
const basins = [...new Set(oilBlocks.map(b => b.basin))].sort();
const phases = ["Production", "Development", "Exploration", "Bidding", "Suspended"];
const waterDepths: WaterDepth[] = ["Onshore", "Shallow Water", "Deep Water", "Ultra-Deep Water"];

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

const depthLabel: Record<WaterDepth, string> = {
  "Onshore": "Onshore",
  "Shallow Water": "Águas Rasas",
  "Deep Water": "Águas Profundas",
  "Ultra-Deep Water": "Ultra-Profundas",
};

const basinLabel: Record<string, string> = {
  "Lower Congo": "Bacia do Congo",
  "Congo": "Bacia do Congo",
  "Kwanza": "Bacia do Kwanza",
  "Namibe": "Bacia do Namibe",
  "Benguela": "Bacia de Benguela",
};

// Compact grid card for a single block
const CompactBlockCard = ({
  block,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onNavigate,
}: {
  block: OilBlock;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (block: OilBlock) => void;
  onHover: (id: string | null) => void;
  onNavigate: (id: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => onHover(block.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(block)}
      className={`glass-card rounded-lg p-2 cursor-pointer transition-all border ${
        isSelected
          ? "border-primary/50 ring-1 ring-primary/20 shadow-md"
          : isHovered
          ? "border-primary/30 shadow-sm"
          : "border-transparent hover:border-primary/20"
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="font-bold text-[10px] 2xl:text-xs leading-tight truncate">{block.name}</span>
        <Badge variant="outline" className={`text-[8px] px-1 py-0 shrink-0 ${phaseColor(block.phase)}`}>
          {block.phase === "Bidding" ? "Licitação" : block.phase}
        </Badge>
      </div>
      <div className="text-[9px] 2xl:text-[11px] text-muted-foreground truncate">{block.operator}</div>
      <div className="flex items-center justify-between mt-1.5">
        {block.dailyProduction > 0 ? (
          <span className="text-[10px] font-bold font-mono text-success">
            {(block.dailyProduction / 1000).toFixed(0)}k <span className="text-[8px] font-normal text-muted-foreground">BOPD</span>
          </span>
        ) : (
          <span className="text-[9px] text-muted-foreground italic">—</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(block.id); }}
          className="text-[8px] text-primary hover:text-primary/80 flex items-center gap-0.5"
        >
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>
      {isSelected && (
        <div className="mt-2 pt-2 border-t border-border/50 animate-fade-in space-y-1.5">
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: "Reservas", value: `${block.estimatedReserves}M bbl` },
              { label: "Risco", value: `${block.riskScore}/10` },
            ].map(m => (
              <div key={m.label} className="text-[8px]">
                <span className="text-muted-foreground">{m.label}: </span>
                <span className="font-mono font-semibold">{m.value}</span>
              </div>
            ))}
          </div>
          {block.concession.length > 0 && (
            <div className="space-y-0.5">
              {block.concession.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center justify-between text-[8px]">
                  <span className={p.isOperator ? "font-semibold" : "text-muted-foreground"}>
                    {p.name}{p.isOperator ? " (OP)" : ""}
                  </span>
                  <span className="font-mono">{p.share.toFixed(0)}%</span>
                </div>
              ))}
              {block.concession.length > 3 && (
                <div className="text-[8px] text-muted-foreground">+{block.concession.length - 3} mais</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Collapsible basin/region group
const BasinGroup = ({
  label,
  blocks,
  selectedBlockId,
  hoveredBlockId,
  onSelect,
  onHover,
  onNavigate,
  defaultOpen = true,
}: {
  label: string;
  blocks: OilBlock[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  onSelect: (block: OilBlock) => void;
  onHover: (id: string | null) => void;
  onNavigate: (id: string) => void;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const totalProd = blocks.reduce((s, b) => s + b.dailyProduction, 0);
  const producing = blocks.filter(b => b.phase === "Production").length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors group">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          <span className="text-[11px] font-semibold">{label}</span>
          <span className="text-[9px] text-muted-foreground">({blocks.length})</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
          {producing > 0 && <span className="text-success font-mono">{producing} prod.</span>}
          {totalProd > 0 && <span className="font-mono">{(totalProd / 1000).toFixed(0)}k BOPD</span>}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 pt-1.5 pb-2">
          {blocks.map(block => (
            <CompactBlockCard
              key={block.id}
              block={block}
              isSelected={selectedBlockId === block.id}
              isHovered={hoveredBlockId === block.id}
              onSelect={onSelect}
              onHover={onHover}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const BlocksPanel = () => {
  const navigate = useNavigate();
  const [filterOperator, setFilterOperator] = useState("all");
  const [filterBasin, setFilterBasin] = useState("all");
  const [filterPhase, setFilterPhase] = useState("all");
  const [filterDepth, setFilterDepth] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  const filteredBlocks = useMemo(() => {
    return oilBlocks.filter(b => {
      if (filterOperator !== "all" && b.operator !== filterOperator) return false;
      if (filterBasin !== "all" && b.basin !== filterBasin) return false;
      if (filterPhase !== "all" && b.phase !== filterPhase) return false;
      if (filterDepth !== "all" && b.waterDepth !== filterDepth) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return b.name.toLowerCase().includes(q) || b.operator.toLowerCase().includes(q) || b.basin.toLowerCase().includes(q);
      }
      return true;
    });
  }, [filterOperator, filterBasin, filterPhase, filterDepth, searchQuery]);

  const stats = useMemo(() => ({
    total: filteredBlocks.length,
    production: filteredBlocks.filter(b => b.phase === "Production").length,
    totalProd: filteredBlocks.reduce((s, b) => s + b.dailyProduction, 0),
    totalReserves: filteredBlocks.reduce((s, b) => s + b.estimatedReserves, 0),
  }), [filteredBlocks]);

  const hasFilters = filterOperator !== "all" || filterBasin !== "all" || filterPhase !== "all" || filterDepth !== "all" || searchQuery !== "";

  // Group by basin, then by water depth within each basin
  const grouped = useMemo(() => {
    const basinGroups: Record<string, OilBlock[]> = {};
    filteredBlocks.forEach(b => {
      const key = b.basin;
      if (!basinGroups[key]) basinGroups[key] = [];
      basinGroups[key].push(b);
    });
    // Sort basins by total production desc
    return Object.entries(basinGroups).sort((a, b) => {
      const prodA = a[1].reduce((s, bl) => s + bl.dailyProduction, 0);
      const prodB = b[1].reduce((s, bl) => s + bl.dailyProduction, 0);
      return prodB - prodA;
    });
  }, [filteredBlocks]);

  const handleBlockClick = useCallback((block: OilBlock) => {
    setSelectedBlockId(prev => prev === block.id ? null : block.id);
  }, []);

  const handleBlockHover = useCallback((id: string | null) => {
    setHoveredBlockId(id);
  }, []);

  return (
    <div className="space-y-4 2xl:space-y-6 3xl:space-y-8">
      {/* Filters + Stats */}
      <Card className="glass-card">
        <CardHeader className="p-3 3xl:p-5 pb-1">
           <CardTitle className="text-sm 2xl:text-lg 3xl:text-xl flex items-center gap-2">
             <Filter className="w-4 h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 text-primary" />
            Mapa de Concessões
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 3xl:p-5 pt-1 space-y-3 3xl:space-y-4">
          <div className="flex flex-wrap gap-2 3xl:gap-3">
            <div className="relative w-full md:w-48 3xl:w-56">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 3xl:w-4 3xl:h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar bloco..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 3xl:h-9 text-xs 3xl:text-sm pl-7 3xl:pl-9 glass-card border-border/50"
              />
            </div>
            <Select value={filterOperator} onValueChange={setFilterOperator}>
              <SelectTrigger className="w-36 md:w-40 3xl:w-48 h-7 3xl:h-9 text-xs 3xl:text-sm glass-card border-border/50"><SelectValue placeholder="Operador" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos Operadores</SelectItem>
                {operators.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterBasin} onValueChange={setFilterBasin}>
              <SelectTrigger className="w-36 md:w-40 3xl:w-48 h-7 3xl:h-9 text-xs 3xl:text-sm glass-card border-border/50"><SelectValue placeholder="Bacia" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas Bacias</SelectItem>
                {basins.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPhase} onValueChange={setFilterPhase}>
              <SelectTrigger className="w-36 md:w-40 3xl:w-48 h-7 3xl:h-9 text-xs 3xl:text-sm glass-card border-border/50"><SelectValue placeholder="Fase" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas Fases</SelectItem>
                {phases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterDepth} onValueChange={setFilterDepth}>
              <SelectTrigger className="w-36 md:w-40 3xl:w-48 h-7 3xl:h-9 text-xs 3xl:text-sm glass-card border-border/50"><SelectValue placeholder="Profundidade" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas Profundidades</SelectItem>
                {waterDepths.map(d => <SelectItem key={d} value={d}>{depthLabel[d]}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <button onClick={() => { setFilterOperator("all"); setFilterBasin("all"); setFilterPhase("all"); setFilterDepth("all"); setSearchQuery(""); }}
                className="h-7 3xl:h-9 px-3 text-xs 3xl:text-sm text-muted-foreground hover:text-foreground transition-colors">Limpar</button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 2xl:gap-3 3xl:gap-4">
             <div className="glass-card p-1.5 2xl:p-3 3xl:p-4 rounded-lg text-center">
               <div className="text-[9px] 2xl:text-xs 3xl:text-sm text-muted-foreground">Blocos</div>
               <div className="text-base 2xl:text-xl 3xl:text-2xl font-bold font-mono">{stats.total}</div>
            </div>
             <div className="glass-card p-1.5 2xl:p-3 3xl:p-4 rounded-lg text-center">
               <div className="text-[9px] 2xl:text-xs 3xl:text-sm text-muted-foreground">Produção</div>
               <div className="text-base 2xl:text-xl 3xl:text-2xl font-bold font-mono text-success">{stats.production}</div>
            </div>
             <div className="glass-card p-1.5 2xl:p-3 3xl:p-4 rounded-lg text-center">
               <div className="text-[9px] 2xl:text-xs 3xl:text-sm text-muted-foreground">Prod. Total</div>
               <div className="text-base 2xl:text-xl 3xl:text-2xl font-bold font-mono">{(stats.totalProd / 1000).toFixed(0)}k</div>
            </div>
             <div className="glass-card p-1.5 2xl:p-3 3xl:p-4 rounded-lg text-center">
               <div className="text-[9px] 2xl:text-xs 3xl:text-sm text-muted-foreground">Reservas</div>
               <div className="text-base 2xl:text-xl 3xl:text-2xl font-bold font-mono">{(stats.totalReserves / 1000).toFixed(1)}B</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map + Block List side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 2xl:gap-6 3xl:gap-8">
        {/* Interactive Map */}
        <Card className="glass-card">
          <CardHeader className="p-3 3xl:p-5 pb-1">
            <CardTitle className="text-xs 2xl:text-sm 3xl:text-base flex items-center gap-2">
              <Map className="w-3.5 h-3.5 3xl:w-5 3xl:h-5 text-primary" />
              Vista Geográfica
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 3xl:p-4">
            <ConcessionMap
              blocks={filteredBlocks}
              selectedBlockId={selectedBlockId}
              hoveredBlockId={hoveredBlockId}
              onBlockClick={handleBlockClick}
              onBlockHover={handleBlockHover}
            />
          </CardContent>
        </Card>

        {/* Block List - Grouped by Basin */}
        <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
          {grouped.map(([basin, blocks]) => (
            <BasinGroup
              key={basin}
              label={basinLabel[basin] || basin}
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              hoveredBlockId={hoveredBlockId}
              onSelect={handleBlockClick}
              onHover={handleBlockHover}
              onNavigate={(id) => navigate(`/block/${id}`)}
              defaultOpen={blocks.some(b => b.dailyProduction > 0)}
            />
          ))}
          {grouped.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Nenhum bloco encontrado com os filtros actuais.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
