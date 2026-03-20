import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { tooltipDescriptions } from "@/lib/tooltipDescriptions";
import { AnimatedCounter } from "./AnimatedCounter";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export type SemaphoreStatus = "healthy" | "warning" | "critical" | "neutral";

interface ExecutiveKPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  variation?: number;
  variationLabel?: string;
  status: SemaphoreStatus;
  icon: LucideIcon;
  sparklineData?: number[];
  drillDownInfo?: string;
  delay?: number;
}

const statusColors: Record<SemaphoreStatus, string> = {
  healthy: "bg-success",
  warning: "bg-warning",
  critical: "bg-danger",
  neutral: "bg-primary",
};

const barColors: Record<SemaphoreStatus, string> = {
  healthy: "bg-success",
  warning: "bg-warning",
  critical: "bg-danger",
  neutral: "bg-primary",
};

const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const formatBarValue = (v: number) =>
  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` :
  v >= 1000 ? `${(v / 1000).toFixed(0)}k` :
  v.toLocaleString();

const MiniTrendBars = ({ data, status }: { data: number[]; status: SemaphoreStatus }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  // Use last N months ending at current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const labels = data.map((_, i) => {
    const idx = (currentMonth - (data.length - 1 - i) + 12) % 12;
    return monthLabels[idx];
  });

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-end gap-[3px] h-10 w-20 flex-shrink-0">
        {data.map((v, i) => {
          const pct = ((v - min) / range) * 100;
          const height = Math.max(pct, 12);
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div
                  className={`flex-1 rounded-sm ${barColors[status]} transition-all duration-300 cursor-default hover:opacity-100`}
                  style={{ height: `${height}%`, opacity: 0.5 + (i / (data.length - 1)) * 0.5 }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="px-2 py-1">
                <p className="text-[10px] font-semibold">{labels[i]}: {formatBarValue(v)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export const ExecutiveKPICard = ({
  label,
  value,
  prefix = "",
  suffix = "",
  variation,
  variationLabel,
  status,
  icon: Icon,
  sparklineData,
  drillDownInfo,
  delay = 0,
}: ExecutiveKPICardProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="executive-card p-3 md:p-4 animate-counter-up cursor-default"
            data-status={status}
            style={{ animationDelay: `${delay}ms` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="flex-1 min-w-0">
                <AnimatedCounter
                  target={value}
                  prefix={prefix}
                  suffix={suffix}
                  className="font-bold text-foreground text-xl md:text-2xl 2xl:text-3xl"
                />
                {variation !== undefined && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {variation > 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-success" />
                    ) : variation < 0 ? (
                      <ArrowDownRight className="w-3 h-3 text-danger" />
                    ) : (
                      <Minus className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className={`text-[10px] font-semibold ${
                      variation > 0 ? "text-success" : variation < 0 ? "text-danger" : "text-muted-foreground"
                    }`}>
                      {variation > 0 ? "+" : ""}{variation}%
                    </span>
                    {variationLabel && (
                      <span className="text-[9px] text-muted-foreground">{variationLabel}</span>
                    )}
                  </div>
                )}
              </div>

              {sparklineData && sparklineData.length > 0 && (
                <MiniTrendBars data={sparklineData} status={status} />
              )}
            </div>
          </div>
        </TooltipTrigger>
        {drillDownInfo && (
          <TooltipContent side="bottom" className="max-w-[200px]">
            <p className="text-xs">{drillDownInfo}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};