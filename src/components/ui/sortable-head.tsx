import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import type { SortDir } from "@/hooks/useTableSort";

interface SortableHeadProps {
  label: string;
  sortKey: string;
  colKey: string;
  sortDir: SortDir;
  onSort: (key: string) => void;
  align?: string;
  className?: string;
}

export const SortableHead = ({ label, sortKey, colKey, sortDir, onSort, align = "", className = "" }: SortableHeadProps) => {
  const active = sortKey === colKey;
  return (
    <TableHead
      className={`cursor-pointer select-none hover:text-foreground transition-colors ${align} ${className}`}
      onClick={() => onSort(colKey)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {active
          ? (sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />)
          : <ArrowUpDown className="w-3 h-3 opacity-40" />
        }
      </span>
    </TableHead>
  );
};
