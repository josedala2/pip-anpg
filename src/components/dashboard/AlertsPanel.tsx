import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AnimatedCounter } from "./AnimatedCounter";
import {
  evaluateAlerts, defaultRules, categoryLabels, severityLabels, severityStyles, categoryStyles,
  type Alert, type AlertCategory, type AlertSeverity, type AlertRule,
} from "@/lib/alertsEngine";
import { oilBlocks } from "@/data/angolaBlocks";
import {
  AlertTriangle, Bell, FileText, Wrench, TrendingDown, TrendingUp, DollarSign, Shield, Leaf, Settings2, Filter,
} from "lucide-react";

const categoryIcons: Record<AlertCategory, React.ElementType> = {
  contract: FileText,
  integrity: Wrench,
  decline: TrendingDown,
  opex: DollarSign,
  compliance: Shield,
  esg: Leaf,
  forecast: TrendingUp,
};

export const AlertsPanel = () => {
  const [rules, setRules] = useState<AlertRule[]>(() => defaultRules.map(r => ({ ...r })));
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory | "all">("all");
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | "all">("all");

  const verifiedBlocks = useMemo(() => oilBlocks.filter(b => !b.pendingRealData), []);
  const alerts = useMemo(() => evaluateAlerts(verifiedBlocks, rules), [verifiedBlocks, rules]);

  const filtered = useMemo(() => {
    let result = alerts;
    if (selectedCategory !== "all") result = result.filter(a => a.category === selectedCategory);
    if (selectedSeverity !== "all") result = result.filter(a => a.severity === selectedSeverity);
    return result;
  }, [alerts, selectedCategory, selectedSeverity]);

  // Counts
  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const highCount = alerts.filter(a => a.severity === "high").length;
  const mediumCount = alerts.filter(a => a.severity === "medium").length;
  const categoryCounts = useMemo(() => {
    const map = new Map<AlertCategory, number>();
    alerts.forEach(a => map.set(a.category, (map.get(a.category) || 0) + 1));
    return map;
  }, [alerts]);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Alertas", value: alerts.length, icon: Bell, color: "text-primary" },
          { label: "Críticos", value: criticalCount, icon: AlertTriangle, color: "text-danger" },
          { label: "Elevados", value: highCount, icon: AlertTriangle, color: "text-warning" },
          { label: "Moderados", value: mediumCount, icon: AlertTriangle, color: "text-[hsl(var(--chart-3))]" },
          { label: "Regras Activas", value: rules.filter(r => r.enabled).length, suffix: `/${rules.length}`, icon: Settings2, color: "text-muted-foreground" },
        ].map(kpi => (
          <Card key={kpi.label} className="glass-card overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                <span className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">{kpi.label}</span>
              </div>
              <AnimatedCounter target={kpi.value} suffix={kpi.suffix || ""} className={`font-bold ${kpi.color} text-2xl md:text-3xl`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="alerts">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="alerts">Alertas Activos</TabsTrigger>
          <TabsTrigger value="by-category">Por Categoria</TabsTrigger>
          <TabsTrigger value="rules">Regras de Negócio</TabsTrigger>
        </TabsList>

        {/* Active Alerts */}
        <TabsContent value="alerts">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as AlertCategory | "all")}
              className="text-xs bg-muted/50 border border-border rounded-md px-2 py-1"
            >
              <option value="all">Todas categorias</option>
              {(Object.keys(categoryLabels) as AlertCategory[]).map(c => (
                <option key={c} value={c}>{categoryLabels[c]} ({categoryCounts.get(c) || 0})</option>
              ))}
            </select>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value as AlertSeverity | "all")}
              className="text-xs bg-muted/50 border border-border rounded-md px-2 py-1"
            >
              <option value="all">Todas severidades</option>
              {(Object.keys(severityLabels) as AlertSeverity[]).map(s => (
                <option key={s} value={s}>{severityLabels[s]}</option>
              ))}
            </select>
            <span className="text-[10px] text-muted-foreground ml-auto">{filtered.length} alertas</span>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filtered.length === 0 && (
                <Card className="glass-card">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-success" />
                    <p className="text-sm font-medium">Sem alertas activos</p>
                  </CardContent>
                </Card>
              )}
              {filtered.map(alert => {
                const sevStyle = severityStyles[alert.severity];
                const CatIcon = categoryIcons[alert.category];
                const catStyle = categoryStyles[alert.category];
                return (
                  <Card key={alert.id} className={`overflow-hidden border ${sevStyle.bg}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg ${sevStyle.bg}`}>
                          <CatIcon className={`w-4 h-4 ${catStyle.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-xs">{alert.title}</span>
                            <Badge variant="outline" className={`text-[8px] ${sevStyle.color}`}>{severityLabels[alert.severity]}</Badge>
                            <Badge variant="outline" className={`text-[8px] ${catStyle.color}`}>{categoryLabels[alert.category]}</Badge>
                          </div>
                          <div className="text-[10px] text-muted-foreground mb-1">{alert.blockName} • {alert.operator}</div>
                          <p className="text-xs text-muted-foreground">{alert.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-[10px]">
                            {alert.metric && (
                              <span>Valor: <strong className={sevStyle.color}>{alert.metric}</strong></span>
                            )}
                            {alert.threshold && (
                              <span>Limiar: <strong>{alert.threshold}</strong></span>
                            )}
                          </div>
                          <div className="mt-1.5 p-2 rounded bg-card/50 border border-border/30">
                            <span className="text-[10px] font-semibold text-foreground">Acção: </span>
                            <span className="text-[10px] text-muted-foreground">{alert.actionRequired}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* By Category */}
        <TabsContent value="by-category">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(categoryLabels) as AlertCategory[]).map(cat => {
              const catAlerts = alerts.filter(a => a.category === cat);
              const CatIcon = categoryIcons[cat];
              const catStyle = categoryStyles[cat];
              return (
                <Card key={cat} className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <CatIcon className={`w-4 h-4 ${catStyle.color}`} />
                      {categoryLabels[cat]}
                      <Badge variant="outline" className="ml-auto text-[9px]">{catAlerts.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {catAlerts.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">Sem alertas</p>
                    ) : (
                      <ScrollArea className="h-[250px]">
                        <div className="space-y-1.5">
                          {catAlerts.map(a => {
                            const sevStyle = severityStyles[a.severity];
                            return (
                              <div key={a.id} className={`p-2 rounded-lg border ${sevStyle.bg}`}>
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-[10px] font-semibold truncate">{a.blockName}</span>
                                  <Badge variant="outline" className={`text-[8px] ${sevStyle.color}`}>{severityLabels[a.severity]}</Badge>
                                </div>
                                <p className="text-[9px] text-muted-foreground">{a.title}</p>
                                {a.metric && <span className={`text-[9px] font-bold ${sevStyle.color}`}>{a.metric}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Rules Config */}
        <TabsContent value="rules">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Regras de Negócio Parametrizáveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rules.map(rule => {
                  const CatIcon = categoryIcons[rule.category];
                  const catStyle = categoryStyles[rule.category];
                  return (
                    <div key={rule.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <CatIcon className={`w-4 h-4 shrink-0 ${catStyle.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{rule.label}</div>
                        <div className="text-[10px] text-muted-foreground">{rule.description}</div>
                      </div>
                      <Badge variant="outline" className={`text-[8px] shrink-0 ${catStyle.color}`}>{categoryLabels[rule.category]}</Badge>
                      <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
