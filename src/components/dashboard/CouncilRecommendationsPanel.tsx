import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { oilBlocks } from "@/data/angolaBlocks";
import { AnimatedCounter } from "./AnimatedCounter";
import { AlertTriangle, Award, BarChart3, ChevronDown, ChevronUp, Eye, Lightbulb, Shield, Target, Zap } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { tooltipDescriptions } from "@/lib/tooltipDescriptions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { calculateAllScores, classificationConfig, urgencyConfig, type StrategicScore, type StrategicClassification } from "@/lib/strategicScoring";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// ── Component ──

export const CouncilRecommendationsPanel = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [selectedRadar, setSelectedRadar] = useState<string | null>(null);

  const scores: StrategicScore[] = useMemo(() => calculateAllScores(oilBlocks), []);

  // KPIs
  const classificationCounts = useMemo(() => {
    const map = new Map<StrategicClassification, number>();
    scores.forEach(s => map.set(s.classification, (map.get(s.classification) || 0) + 1));
    return map;
  }, [scores]);

  const immediateActions = scores.filter(s => s.urgency === "Imediata" || s.urgency === "Elevada").length;
  const avgScore = Math.round(scores.reduce((s, sc) => s + sc.totalScore, 0) / (scores.length || 1));
  const revitalize = classificationCounts.get("Revitalizar") || 0;
  const renegotiate = classificationCounts.get("Renegociar") || 0;
  const abandon = (classificationCounts.get("Preparar Abandono") || 0) + (classificationCounts.get("Relicitar") || 0);

  // Top 5 priority actions
  const top5 = useMemo(() => scores.filter(s => s.urgency === "Imediata" || s.urgency === "Elevada").slice(0, 5), [scores]);

  // Distribution chart data
  const distributionData = useMemo(() => {
    const classifications: StrategicClassification[] = ["Revitalizar", "Manter & Optimizar", "Renegociar", "Monitorar", "Preparar Abandono", "Relicitar"];
    return classifications.map(c => ({
      name: c,
      count: classificationCounts.get(c) || 0,
    }));
  }, [classificationCounts]);

  // Radar data for selected block
  const radarData = useMemo(() => {
    const target = selectedRadar ? scores.find(s => s.blockId === selectedRadar) : scores[0];
    if (!target) return [];
    return target.dimensions.map(d => ({
      dimension: d.label.replace("Integridade ", "Int. ").replace("Desempenho ", "Desemp. ").replace("Viabilidade ", "Viab. ").replace("Potencial ", "Pot. "),
      score: d.score,
      fullMark: 100,
    }));
  }, [selectedRadar, scores]);

  const selectedScore = selectedRadar ? scores.find(s => s.blockId === selectedRadar) : scores[0];

  const scoreColor = (score: number) =>
    score >= 70 ? "text-success" : score >= 50 ? "text-[hsl(var(--chart-3))]" : score >= 30 ? "text-warning" : "text-danger";

  const scoreBg = (score: number) =>
    score >= 70 ? "bg-success/10 border-success/30" : score >= 50 ? "bg-muted/50 border-border" : score >= 30 ? "bg-warning/10 border-warning/30" : "bg-danger/10 border-danger/30";

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Acções Prioritárias", value: immediateActions, icon: Zap, color: "text-danger" },
          { label: "Score Médio Nacional", value: avgScore, suffix: "/100", icon: Target, color: "text-primary" },
          { label: "A Revitalizar", value: revitalize, icon: Lightbulb, color: "text-[hsl(var(--chart-5))]" },
          { label: "A Renegociar", value: renegotiate, icon: AlertTriangle, color: "text-warning" },
          { label: "Abandono/Relicitação", value: abandon, icon: Shield, color: "text-danger" },
        ].map((kpi) => (
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

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Top 5 Prioritárias</TabsTrigger>
          <TabsTrigger value="radar">Radar de Saúde</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="full">Tabela Completa</TabsTrigger>
        </TabsList>

        {/* Top 5 Priority Actions */}
        <TabsContent value="overview">
          <div className="space-y-3">
            {top5.length === 0 && (
              <Card className="glass-card">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Award className="w-8 h-8 mx-auto mb-2 text-success" />
                  <p className="text-sm font-medium">Sem acções de urgência imediata ou elevada</p>
                </CardContent>
              </Card>
            )}
            {top5.map((s, i) => {
              const cfg = classificationConfig[s.classification];
              const ucfg = urgencyConfig[s.urgency];
              return (
                <Card key={s.blockId} className={`overflow-hidden border ${cfg.bgColor}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        i === 0 ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{s.blockName}</span>
                          <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>{s.classification}</Badge>
                          <Badge variant="outline" className={`text-[9px] ${ucfg.color}`}>{s.urgency}</Badge>
                        </div>
                        <div className="text-[10px] text-muted-foreground mb-2">{s.operator} • Score: {s.totalScore}/100</div>

                        <div className="bg-card/50 rounded-lg p-3 space-y-2 text-xs">
                          <div><span className="font-semibold text-foreground">Recomendação:</span> <span className="text-muted-foreground">{s.recommendation}</span></div>
                          <div><span className="font-semibold text-danger">Risco de inacção:</span> <span className="text-muted-foreground">{s.riskOfInaction}</span></div>
                          <div><span className="font-semibold text-success">Impacto esperado:</span> <span className="text-muted-foreground">{s.expectedImpact}</span></div>
                        </div>

                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {s.topDrivers.map((d, j) => (
                            <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{d}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-center shrink-0">
                        <div className={`text-2xl font-bold ${scoreColor(s.totalScore)}`}>{s.totalScore}</div>
                        <div className="text-[9px] text-muted-foreground">Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Radar Chart */}
        <TabsContent value="radar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Radar de Saúde — {selectedScore?.blockName || ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                      <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: 12,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Dimension details */}
                {selectedScore && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                    {selectedScore.dimensions.map(d => (
                      <div key={d.label} className="p-2 rounded-lg border border-border/50 bg-card/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase">{d.label}</span>
                          <span className={`text-sm font-bold ${scoreColor(d.score)}`}>{d.score}</span>
                        </div>
                        <Progress value={d.score} className="h-1" />
                        <div className="text-[9px] text-muted-foreground mt-1">Peso: {d.weight}% • Ponderado: {d.weighted}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Block selector */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Seleccionar Bloco</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-1">
                    {scores.map(s => {
                      const cfg = classificationConfig[s.classification];
                      return (
                        <button
                          key={s.blockId}
                          onClick={() => setSelectedRadar(s.blockId)}
                          className={`w-full text-left p-2 rounded-lg border transition-colors ${
                            selectedRadar === s.blockId || (!selectedRadar && s.blockId === scores[0]?.blockId)
                              ? "border-primary bg-primary/5"
                              : "border-transparent hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate">{s.blockName}</div>
                              <div className="text-[9px] text-muted-foreground">{s.operator}</div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[9px] font-medium ${cfg.color}`}>{s.classification}</span>
                              <span className={`text-sm font-bold ${scoreColor(s.totalScore)}`}>{s.totalScore}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution */}
        <TabsContent value="distribution">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Distribuição de Classificações Estratégicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [`${value} blocos`, "Classificação"]}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {distributionData.map((entry) => {
                        const cfg = classificationConfig[entry.name as StrategicClassification];
                        // Extract hsl color
                        const colorMap: Record<string, string> = {
                          "Revitalizar": "hsl(var(--chart-5))",
                          "Manter & Optimizar": "hsl(var(--success))",
                          "Renegociar": "hsl(var(--warning))",
                          "Monitorar": "hsl(var(--muted-foreground))",
                          "Preparar Abandono": "hsl(var(--danger))",
                          "Relicitar": "hsl(var(--chart-4))",
                        };
                        return <Cell key={entry.name} fill={colorMap[entry.name] || "hsl(var(--primary))"} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
                {distributionData.map(d => {
                  const cfg = classificationConfig[d.name as StrategicClassification];
                  return (
                    <div key={d.name} className={`text-center p-3 rounded-lg border ${cfg.bgColor}`}>
                      <div className={`text-xl font-bold ${cfg.color}`}>{d.count}</div>
                      <div className="text-[9px] text-muted-foreground uppercase font-semibold">{d.name}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Full Table */}
        <TabsContent value="full">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Classificação Estratégica de Todas as Concessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-1.5">
                  {scores.map((s) => {
                    const cfg = classificationConfig[s.classification];
                    const ucfg = urgencyConfig[s.urgency];
                    const isExpanded = expandedBlock === s.blockId;

                    return (
                      <Collapsible key={s.blockId} open={isExpanded} onOpenChange={(open) => setExpandedBlock(open ? s.blockId : null)}>
                        <CollapsibleTrigger asChild>
                          <button className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${scoreBg(s.totalScore)} hover:bg-muted/30`}>
                            <div className="text-center shrink-0 min-w-[45px]">
                              <div className={`text-lg font-bold ${scoreColor(s.totalScore)}`}>{s.totalScore}</div>
                              <Progress value={s.totalScore} className="h-1 mt-0.5" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="font-semibold text-xs truncate">{s.blockName}</div>
                              <div className="text-[10px] text-muted-foreground">{s.operator} • {s.phase}</div>
                            </div>
                            <Badge variant="outline" className={`text-[9px] shrink-0 ${cfg.color}`}>{s.classification}</Badge>
                            <Badge variant="outline" className={`text-[9px] shrink-0 ${ucfg.color}`}>{s.urgency}</Badge>
                            {isExpanded ? <ChevronUp className="w-3 h-3 shrink-0" /> : <ChevronDown className="w-3 h-3 shrink-0" />}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-[57px] mr-3 mb-2 p-3 rounded-lg bg-card/50 border border-border/50 space-y-2 text-xs">
                            <div><span className="font-semibold">Recomendação:</span> {s.recommendation}</div>
                            <div><span className="font-semibold text-danger">Risco de inacção:</span> {s.riskOfInaction}</div>
                            <div><span className="font-semibold text-success">Impacto esperado:</span> {s.expectedImpact}</div>
                            <div className="flex gap-2 mt-1">
                              {s.dimensions.map(d => (
                                <div key={d.label} className="text-center">
                                  <div className={`text-xs font-bold ${scoreColor(d.score)}`}>{d.score}</div>
                                  <div className="text-[8px] text-muted-foreground">{d.label.split(" ")[0]}</div>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-1 flex-wrap mt-1">
                              {s.topDrivers.map((d, j) => (
                                <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{d}</span>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
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
