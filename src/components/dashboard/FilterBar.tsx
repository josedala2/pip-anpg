import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { oilBlocks } from "@/data/angolaBlocks";

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  operator: string;
  basin: string;
  phase: string;
  productionRange: string;
}

const operators = [...new Set(oilBlocks.map(b => b.operator))].sort();
const basins = [...new Set(oilBlocks.map(b => b.basin))].sort();
const phases = ["Production", "Development", "Exploration", "Bidding", "Suspended"];
const productionRanges = [
  { label: "All", value: "all" },
  { label: "> 100k BOPD", value: "100000" },
  { label: "> 50k BOPD", value: "50000" },
  { label: "< 50k BOPD", value: "lt50000" },
];

export const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const [filters, setFilters] = useState<FilterState>({
    operator: "all",
    basin: "all",
    phase: "all",
    productionRange: "all",
  });

  const update = (key: keyof FilterState, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      {[
        { key: "operator" as const, label: "Operator", options: operators },
        { key: "basin" as const, label: "Basin", options: basins },
        { key: "phase" as const, label: "Phase", options: phases },
      ].map(({ key, label, options }) => (
        <Select key={key} value={filters[key]} onValueChange={(v) => update(key, v)}>
          <SelectTrigger className="w-36 md:w-40 h-8 text-xs glass-card border-border/50">
            <SelectValue placeholder={label} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All {label}s</SelectItem>
            {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      ))}
      <Select value={filters.productionRange} onValueChange={(v) => update("productionRange", v)}>
        <SelectTrigger className="w-36 md:w-40 h-8 text-xs glass-card border-border/50">
          <SelectValue placeholder="Production" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {productionRanges.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
};

export const applyFilters = (filters: FilterState) => {
  return oilBlocks.filter(b => {
    if (filters.operator !== "all" && b.operator !== filters.operator) return false;
    if (filters.basin !== "all" && b.basin !== filters.basin) return false;
    if (filters.phase !== "all" && b.phase !== filters.phase) return false;
    if (filters.productionRange === "100000" && b.dailyProduction <= 100000) return false;
    if (filters.productionRange === "50000" && b.dailyProduction <= 50000) return false;
    if (filters.productionRange === "lt50000" && b.dailyProduction >= 50000) return false;
    return true;
  });
};
