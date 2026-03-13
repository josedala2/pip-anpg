import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { oilBlocks, type OilBlock } from "@/data/angolaBlocks";
import { AnimatedCounter } from "./AnimatedCounter";
import { AlertTriangle, Calendar, CheckCircle2, Clock, FileWarning, Scale, Shield, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, ScatterChart, Scatter, ZAxis } from "recharts";

// ── Helpers ──

const parseContractEnd = (block: OilBlock): Date | null => {
  if (block.contractInfo?.productionPeriodEnd) {
    return new Date(block.contractInfo.productionPeriodEnd);
  }
  // Try to infer from signing date + typical 20-year production period
  if (block.contractInfo?.signingDate) {
    const d = new Date(block.contractInfo.signingDate);
    d.setFullYear(d.getFullYear() + 25); // approximate total contract life
    return d;
  }
  return null;
};

const monthsUntil = (date: Date): number => {
  const now = new Date();
  return Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
};

type UrgencyLevel = "critical" | "high" | "medium" | "low" | "safe";

const getUrgency = (months: number | null): UrgencyLevel => {
  if (months === null) return "low";
  if (months <= 12) return "critical";
  if (months <= 24) return "high";
  if (months <= 36) return "medium";
  if (months <= 60) return "low";
  return "safe";
};

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bgColor: string; icon: typeof AlertTriangle }> = {
  critical: { label: "Crítico", color: "text-danger", bgColor: "bg-danger/10 border-danger/30", icon: XCircle },
  high: { label: "Elevado", color: "text-warning", bgColor: "bg-warning/10 border-warning/30", icon: AlertTriangle },
  medium: { label: "Moderado", color: "text-[hsl(var(--chart-3))]", bgColor: "bg-[hsl(var(--chart-3))]/10 border-[hsl(var(--chart-3))]/30", icon: Clock },
  low: { label: "Baixo", color: "text-muted-foreground", bgColor: "bg-muted/50 border-border", icon: Shield },
  safe: { label: "Seguro", color: "text-success", bgColor: "bg-success/10 border-success/30", icon: CheckCircle2 },
};

interface BlockContract {
  block: OilBlock;
  endDate: Date | null;
  monthsRemaining: number | null;
  urgency: UrgencyLevel;
  complianceScore: number;
  hasContractInfo: boolean;
}

// ── Component ──

export const ContractCompliancePanel = () => {
  const [selectedTab, setSelectedTab] = useState("timeline");

  const contracts: BlockContract[] = useMemo(() => {
    return oilBlocks.map(block => {
      const endDate = parseContractEnd(block);
      const months = endDate ? monthsUntil(endDate) : null;
      return {
        block,
        endDate,
        monthsRemaining: months,
        urgency: getUrgency(months),
        complianceScore: block.complianceScore,
        hasContractInfo: !!block.contractInfo,
      };
    }).sort((a, b) => {
      if (a.monthsRemaining === null) return 1;
      if (b.monthsRemaining === null) return -1;
      return a.monthsRemaining - b.monthsRemaining;
    });
  }, []);

  const expiringIn12 = contracts.filter(c => c.monthsRemaining !== null && c.monthsRemaining <= 12).length;
  const expiringIn24 = contracts.filter(c => c.monthsRemaining !== null && c.monthsRemaining <= 24).length;
  const expiringIn36 = contracts.filter(c => c.monthsRemaining !== null && c.monthsRemaining <= 36).length;
  const lowCompliance = contracts.filter(c => c.complianceScore < 80).length;
  const withContractData = contracts.filter(c => c.hasContractInfo).length;

  // Group by operator for compliance semaphore
  const operatorCompliance = useMemo(() => {
    const map = new Map<string, { total: number; sumCompliance: number; sumExecution: number; count: number; blocks: string[] }>();
    oilBlocks.forEach(b => {
      const entry = map.get(b.operator) || { total: 0, sumCompliance: 0, sumExecution: 0, count: 0, blocks: [] };
      entry.total++;
      entry.sumCompliance += b.complianceScore;
      entry.sumExecution += b.executionRate;
      entry.count++;
      entry.blocks.push(b.name);
      map.set(b.operator, entry);
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        avgCompliance: Math.round(data.sumCompliance / data.count),
        avgExecution: Math.round(data.sumExecution / data.count),
        blockCount: data.total,
        blocks: data.blocks,
      }))
      .sort((a, b) => a.avgCompliance - b.avgCompliance);
  }, []);

  // Urgency matrix data
  const urgencyMatrix = useMemo(() => {
    return contracts
      .filter(c => c.hasContractInfo && c.monthsRemaining !== null)
      .map(c => ({
        name: c.block.name,
        months: c.monthsRemaining!,
        compliance: c.complianceScore,
        production: c.block.dailyProduction,
        risk: c.block.riskScore,
      }));
  }, [contracts]);

  // Timeline data: group by year of expiry
  const timelineData = useMemo(() => {
    const yearMap = new Map<number, number>();
    contracts.forEach(c => {
      if (c.endDate) {
        const year = c.endDate.getFullYear();
        yearMap.set(year, (yearMap.get(year) || 0) + 1);
      }
    });
    return Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);
  }, [contracts]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Expiram em 12 meses", value: expiringIn12, icon: XCircle, color: "text-danger" },
          { label: "Expiram em 24 meses", value: expiringIn24, icon: AlertTriangle, color: "text-warning" },
          { label: "Expiram em 36 meses", value: expiringIn36, icon: Clock, color: "text-[hsl(var(--chart-3))]" },
          { label: "Compliance < 80%", value: lowCompliance, icon: FileWarning, color: "text-danger" },
          { label: "Com Dados Contratuais", value: withContractData, icon: Scale, color: "text-primary" },
        ].map((kpi) => (
          <Card key={kpi.label} className="glass-card overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                <span className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">{kpi.label}</span>
              </div>
              <AnimatedCounter target={kpi.value} className={`font-bold ${kpi.color} text-2xl md:text-3xl`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="timeline">Calendário Contratual</TabsTrigger>
          <TabsTrigger value="semaphore">Semáforo por Operador</TabsTrigger>
          <TabsTrigger value="urgency">Matriz de Urgência</TabsTrigger>
          <TabsTrigger value="list">Lista Completa</TabsTrigger>
        </TabsList>

        {/* Timeline */}
        <TabsContent value="timeline">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Expiração de Contratos por Ano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [`${value} contratos`, "Expiração"]}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {timelineData.map((entry) => {
                        const now = new Date().getFullYear();
                        const diff = entry.year - now;
                        const color = diff <= 1 ? "hsl(var(--danger))" : diff <= 3 ? "hsl(var(--warning))" : "hsl(var(--primary))";
                        return <Cell key={entry.year} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Semaphore by operator */}
        <TabsContent value="semaphore">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Compliance por Operador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {operatorCompliance.map((op) => {
                    const complianceColor = op.avgCompliance >= 90 ? "text-success" : op.avgCompliance >= 75 ? "text-warning" : "text-danger";
                    const executionColor = op.avgExecution >= 85 ? "text-success" : op.avgExecution >= 70 ? "text-warning" : "text-danger";
                    const bgColor = op.avgCompliance >= 90 ? "bg-success/5 border-success/20" : op.avgCompliance >= 75 ? "bg-warning/5 border-warning/20" : "bg-danger/5 border-danger/20";

                    return (
                      <div key={op.name} className={`flex items-center justify-between p-3 rounded-lg border ${bgColor}`}>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{op.name}</div>
                          <div className="text-[10px] text-muted-foreground">{op.blockCount} bloco{op.blockCount > 1 ? "s" : ""}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${complianceColor}`}>{op.avgCompliance}%</div>
                            <div className="text-[9px] text-muted-foreground uppercase">Compliance</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${executionColor}`}>{op.avgExecution}%</div>
                            <div className="text-[9px] text-muted-foreground uppercase">Execução</div>
                          </div>
                          <div className="w-3 h-3 rounded-full" style={{
                            backgroundColor: op.avgCompliance >= 90 ? "hsl(var(--success))" : op.avgCompliance >= 75 ? "hsl(var(--warning))" : "hsl(var(--danger))",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Urgency Matrix (scatter) */}
        <TabsContent value="urgency">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Matriz de Urgência Negocial (Meses Restantes vs Compliance)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      type="number"
                      dataKey="months"
                      name="Meses"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "Meses Restantes", position: "bottom", offset: 0, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="compliance"
                      name="Compliance"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "Compliance %", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      domain={[0, 100]}
                    />
                    <ZAxis type="number" dataKey="production" range={[40, 400]} name="Produção" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === "Meses") return [`${value} meses`, "Prazo"];
                        if (name === "Compliance") return [`${value}%`, "Compliance"];
                        if (name === "Produção") return [`${value.toLocaleString()} BOPD`, "Produção"];
                        return [value, name];
                      }}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""}
                    />
                    <Scatter data={urgencyMatrix} fill="hsl(var(--primary))">
                      {urgencyMatrix.map((entry, i) => {
                        const color = entry.months <= 12 ? "hsl(var(--danger))" :
                          entry.months <= 24 ? "hsl(var(--warning))" :
                          entry.months <= 36 ? "hsl(var(--chart-3))" :
                          "hsl(var(--primary))";
                        return <Cell key={i} fill={color} fillOpacity={0.7} />;
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                {[
                  { label: "< 12 meses", color: "bg-danger" },
                  { label: "12-24 meses", color: "bg-warning" },
                  { label: "24-36 meses", color: "bg-[hsl(var(--chart-3))]" },
                  { label: "> 36 meses", color: "bg-primary" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                    <span className="text-[10px] text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Full list */}
        <TabsContent value="list">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                Estado Contratual de Todas as Concessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-1.5">
                  {contracts.map((c) => {
                    const cfg = urgencyConfig[c.urgency];
                    const Icon = cfg.icon;
                    return (
                      <div key={c.block.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${cfg.bgColor}`}>
                        <Icon className={`w-4 h-4 shrink-0 ${cfg.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs truncate">{c.block.name}</div>
                          <div className="text-[10px] text-muted-foreground">{c.block.operator} • {c.block.contractInfo?.contractType || "N/D"}</div>
                        </div>
                        <div className="text-right shrink-0">
                          {c.monthsRemaining !== null ? (
                            <div className={`text-sm font-bold ${cfg.color}`}>
                              {c.monthsRemaining > 0 ? `${c.monthsRemaining} meses` : "Expirado"}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">S/D</div>
                          )}
                          {c.endDate && (
                            <div className="text-[9px] text-muted-foreground">
                              {c.endDate.toLocaleDateString("pt-AO", { year: "numeric", month: "short" })}
                            </div>
                          )}
                        </div>
                        <div className="text-center shrink-0 ml-2">
                          <div className={`text-sm font-bold ${c.complianceScore >= 90 ? "text-success" : c.complianceScore >= 75 ? "text-warning" : "text-danger"}`}>
                            {c.complianceScore}%
                          </div>
                          <div className="text-[9px] text-muted-foreground">Compl.</div>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0">{c.block.phase}</Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
