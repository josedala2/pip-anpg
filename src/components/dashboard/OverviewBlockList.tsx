import { useState, useMemo } from "react";
import { oilBlocks, type OilBlock } from "@/data/angolaBlocks";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

const basinLabel: Record<string, string> = {
  "Lower Congo": "Bacia do Congo",
  "Congo": "Bacia do Congo",
  "Kwanza": "Bacia do Kwanza",
  "Namibe": "Bacia do Namibe",
  "Benguela": "Bacia de Benguela",
};

const CompactCard = ({
  block,
  isSelected,
  onSelect,
}: {
  block: OilBlock;
  isSelected: boolean;
  onSelect: (block: OilBlock) => void;
}) => (
  <button
    onClick={() => onSelect(block)}
    className={`w-full text-left glass-card rounded-lg p-2 transition-all border ${
      isSelected
        ? "border-primary/50 ring-1 ring-primary/20 shadow-md"
        : "border-transparent hover:border-primary/20"
    }`}
  >
    <div className="flex items-start justify-between gap-1 mb-0.5">
      <span className="font-bold text-[10px] leading-tight truncate">{block.name}</span>
      <Badge variant="outline" className={`text-[8px] px-1 py-0 shrink-0 ${phaseColor(block.phase)}`}>
        {block.phase === "Bidding" ? "Licitação" : block.phase}
      </Badge>
    </div>
    <div className="text-[9px] text-muted-foreground truncate">{block.operator}</div>
    <div className="flex items-center justify-between mt-1">
      {block.dailyProduction > 0 ? (
        <span className="text-[10px] font-bold font-mono text-success">
          {(block.dailyProduction / 1000).toFixed(0)}k <span className="text-[8px] font-normal text-muted-foreground">BOPD</span>
        </span>
      ) : (
        <span className="text-[9px] text-muted-foreground italic">—</span>
      )}
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          backgroundColor:
            block.phase === "Production" ? "hsl(var(--success))"
            : block.phase === "Development" ? "hsl(var(--warning))"
            : block.phase === "Exploration" ? "hsl(var(--primary))"
            : block.phase === "Bidding" ? "hsl(var(--bidding))"
            : "hsl(var(--danger))"
        }}
      />
    </div>
  </button>
);

const BasinGroup = ({
  label,
  blocks,
  selectedBlockId,
  onSelect,
  defaultOpen,
}: {
  label: string;
  blocks: OilBlock[];
  selectedBlockId: string | null;
  onSelect: (block: OilBlock) => void;
  defaultOpen: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const totalProd = blocks.reduce((s, b) => s + b.dailyProduction, 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          <span className="text-[11px] font-semibold">{label}</span>
          <span className="text-[9px] text-muted-foreground">({blocks.length})</span>
        </div>
        {totalProd > 0 && (
          <span className="text-[9px] font-mono text-muted-foreground">{(totalProd / 1000).toFixed(0)}k BOPD</span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 pt-1 pb-2">
          {blocks.map(block => (
            <CompactCard
              key={block.id}
              block={block}
              isSelected={selectedBlockId === block.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

interface OverviewBlockListProps {
  filteredIds: string[];
  selectedBlock: OilBlock | null;
  onBlockSelect: (block: OilBlock) => void;
}

export const OverviewBlockList = ({ filteredIds, selectedBlock, onBlockSelect }: OverviewBlockListProps) => {
  const [search, setSearch] = useState("");

  const visibleBlocks = useMemo(() => {
    let blocks = oilBlocks.filter(b => filteredIds.includes(b.id));
    if (search) {
      const q = search.toLowerCase();
      blocks = blocks.filter(b =>
        b.name.toLowerCase().includes(q) || b.operator.toLowerCase().includes(q) || b.basin.toLowerCase().includes(q)
      );
    }
    return blocks;
  }, [filteredIds, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, OilBlock[]> = {};
    visibleBlocks.forEach(b => {
      const key = b.basin;
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
    return Object.entries(groups).sort((a, b) => {
      const prodA = a[1].reduce((s, bl) => s + bl.dailyProduction, 0);
      const prodB = b[1].reduce((s, bl) => s + bl.dailyProduction, 0);
      return prodB - prodA;
    });
  }, [visibleBlocks]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Blocos Activos
        </h3>
        <span className="text-[10px] text-muted-foreground font-mono">{visibleBlocks.length} blocos</span>
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <Input
          placeholder="Pesquisar bloco, operador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 text-xs pl-7 glass-card border-border/50"
        />
      </div>
      <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
        {grouped.map(([basin, blocks]) => (
          <BasinGroup
            key={basin}
            label={basinLabel[basin] || basin}
            blocks={blocks}
            selectedBlockId={selectedBlock?.id ?? null}
            onSelect={onBlockSelect}
            defaultOpen={blocks.some(b => b.dailyProduction > 0)}
          />
        ))}
        {grouped.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-6">
            Nenhum bloco encontrado.
          </div>
        )}
      </div>
    </div>
  );
};
