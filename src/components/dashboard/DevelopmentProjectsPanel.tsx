import { useMemo } from "react";
import type { DevelopmentProject } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartWrapper } from "@/components/dashboard/ChartWrapper";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { Rocket, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  projects: DevelopmentProject[];
}

const statusConfig: Record<string, { color: string; badge: string; icon: typeof CheckCircle2 }> = {
  "On Track": { color: "hsl(var(--success))", badge: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  "Above Plan": { color: "hsl(199, 89%, 48%)", badge: "bg-primary/15 text-primary border-primary/30", icon: TrendingUp },
  "Below Plan": { color: "hsl(var(--warning))", badge: "bg-warning/15 text-warning border-warning/30", icon: TrendingDown },
  "Critical": { color: "hsl(var(--danger))", badge: "bg-danger/15 text-danger border-danger/30", icon: AlertTriangle },
};

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

export const DevelopmentProjectsPanel = ({ projects }: Props) => {
  const chartData = useMemo(() =>
    projects.map(p => ({
      name: p.name,
      plan: p.planRecoveryMMBO,
      actual: p.actualRecoveryMMBO,
      pct: p.percentOfPlan,
      status: p.status,
    })),
  [projects]);

  const summary = useMemo(() => {
    const totalPlan = projects.reduce((s, p) => s + p.planRecoveryMMBO, 0);
    const totalActual = projects.reduce((s, p) => s + p.actualRecoveryMMBO, 0);
    const onTrack = projects.filter(p => p.status === "On Track" || p.status === "Above Plan").length;
    return { totalPlan, totalActual, pct: totalPlan > 0 ? Math.round((totalActual / totalPlan) * 100) : 0, onTrack };
  }, [projects]);

  return (
    <Card className="glass-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
            <Rocket className="w-4 h-4 text-primary" />
            Projectos de Desenvolvimento
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span><span className="font-bold text-foreground font-mono">{projects.length}</span> projectos</span>
            <span className="text-border">|</span>
            <span><span className="font-bold text-success font-mono">{summary.onTrack}</span> on track</span>
            <span className="text-border">|</span>
            <span>Recuperação global: <span className={`font-bold font-mono ${summary.pct >= 90 ? "text-success" : summary.pct >= 80 ? "text-warning" : "text-danger"}`}>{summary.pct}%</span></span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        {/* Bar Chart */}
        <ChartWrapper title="Plan vs Actual — Recuperação (MMBO)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barGap={4} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                stroke="hsl(var(--border))"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                stroke="hsl(var(--border))"
                tickFormatter={v => `${v}`}
                width={45}
                label={{ value: "MMBO", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 10 }, offset: -5 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val: number, name: string) => [`${val} MMBO`, name === "plan" ? "Planeado" : "Real"]}
                labelFormatter={l => `Projecto: ${l}`}
              />
              <Legend
                formatter={(value: string) => (value === "plan" ? "Planeado" : "Real")}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Bar dataKey="plan" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="plan" animationDuration={800} />
              <Bar dataKey="actual" name="actual" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={200}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={statusConfig[entry.status]?.color || "hsl(var(--primary))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Project cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 2xl:gap-4">
          {projects.map(p => {
            const cfg = statusConfig[p.status] || statusConfig["Below Plan"];
            const Icon = cfg.icon;
            return (
              <div key={p.name} className="glass-card rounded-lg p-3 2xl:p-4 space-y-2 border border-border/50">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-sm 2xl:text-base truncate">{p.name}</h4>
                  <Badge variant="outline" className={`text-[9px] shrink-0 ${cfg.badge}`}>
                    <Icon className="w-3 h-3 mr-1" />{p.status}
                  </Badge>
                </div>
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] 2xl:text-xs text-muted-foreground">
                    <span>Plan: <span className="font-mono font-medium text-foreground">{p.planRecoveryMMBO} MMBO</span></span>
                    <span>Real: <span className="font-mono font-medium text-foreground">{p.actualRecoveryMMBO} MMBO</span></span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(p.percentOfPlan, 100)}%`, backgroundColor: cfg.color }}
                    />
                  </div>
                  <div className="text-right text-[10px] font-mono font-bold" style={{ color: cfg.color }}>
                    {p.percentOfPlan}%
                  </div>
                </div>
                {/* Observations */}
                <p className="text-[10px] 2xl:text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {p.observations}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
