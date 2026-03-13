import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatedCounter } from "./AnimatedCounter";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

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

const sparklineColors: Record<SemaphoreStatus, string> = {
  healthy: "hsl(152, 65%, 45%)",
  warning: "hsl(38, 90%, 55%)",
  critical: "hsl(0, 75%, 50%)",
  neutral: "hsl(210, 70%, 50%)",
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
  const chartData = sparklineData?.map((v, i) => ({ v, i })) || [];

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

              {chartData.length > 0 && (
                <div className="w-20 h-10 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`sparkGrad-${label}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={sparklineColors[status]} stopOpacity={0.5} />
                          <stop offset="100%" stopColor={sparklineColors[status]} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={sparklineColors[status]}
                        strokeWidth={1.5}
                        fill={`url(#sparkGrad-${label})`}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
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
