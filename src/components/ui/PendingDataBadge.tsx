import { AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PendingDataBadgeProps {
  compact?: boolean;
  className?: string;
}

export const PendingDataBadge = ({ compact = false, className = "" }: PendingDataBadgeProps) => {
  const badge = (
    <span className={`inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 text-warning px-1.5 py-0.5 text-[9px] font-medium ${className}`}>
      <AlertTriangle className="w-2.5 h-2.5" />
      {!compact && "Dados Pendentes"}
    </span>
  );

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Dados reais ainda não carregados
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
};
