import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { oilBlocks, type OilBlock, type PlatformSpec } from "@/data/angolaBlocks";
import { AnimatedCounter } from "./AnimatedCounter";
import { FacilityDetailCard } from "./FacilityDetailCard";
import { AlertTriangle, Anchor, ArrowDown, ArrowLeft, Calendar, Factory, Gauge, Globe, HardHat, Search, Shield, Timer, Waves, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { Progress } from "@/components/ui/progress";

// ── Helpers ──

interface FacilityRecord {
  platform: PlatformSpec;
  blockName: string;
  blockId: string;
  operator: string;
  blockProduction: number;
  blockEfficiency: number;
  age: number;
  riskScore: number; // computed
  capacityBOPD: number;
  blockCapacity: number;
}

const currentYear = 2026;

const computeRiskScore = (p: PlatformSpec, blockRisk: number): number => {
  let score = 0;
  const age = p.installationYear ? currentYear - p.installationYear : 0;

  // Age risk (0-30)
  if (age > 40) score += 30;
  else if (age > 30) score += 22;
  else if (age > 20) score += 15;
  else if (age > 10) score += 8;
  else score += 3;

  // Status risk (0-25)
  if (p.status === "Manutenção") score += 20;
  else if (p.status === "Suspensa") score += 25;
  else if (p.status === "Descomissionada") score += 15;
  else score += 0;

  // Block risk contribution (0-20)
  score += Math.round(blockRisk * 2);

  // Maintenance overdue risk (0-15)
  if (p.nextMaintenance) {
    const quarter = p.nextMaintenance;
    const [year, q] = quarter.split("-Q").map(Number);
    const maintenanceMonth = (q - 1) * 3 + 2; // approximate
    const maintenanceDate = new Date(year, maintenanceMonth);
    if (maintenanceDate < new Date()) score += 15;
  }

  return Math.min(score, 100);
};

const parseCapacity = (cap?: string): number => {
  if (!cap) return 0;
  const match = cap.match(/([\d.,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/[.,]/g, ""));
};

// ── Component ──

export const FacilitiesIntegrityPanel = () => {
  const [selectedTab, setSelectedTab] = useState("installations");
  const [selectedFacility, setSelectedFacility] = useState<{ blockId: string; platformName: string } | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const facilities: FacilityRecord[] = useMemo(() => {
    const results: FacilityRecord[] = [];
    oilBlocks.forEach(block => {
      if (!block.facilityData?.platformSpecs) return;
      block.facilityData.platformSpecs.forEach(p => {
        const age = p.installationYear ? currentYear - p.installationYear : 0;
        const capBOPD = parseCapacity(p.capacity);
        results.push({
          platform: p,
          blockName: block.name,
          blockId: block.id,
          operator: block.operator,
          blockProduction: block.dailyProduction,
          blockEfficiency: block.facilityData?.overallEfficiency || 0,
          age,
          riskScore: computeRiskScore(p, block.riskScore),
          capacityBOPD: capBOPD,
          blockCapacity: block.facilityData?.capacityBOPD || 0,
        });
      });
    });
    return results.sort((a, b) => b.riskScore - a.riskScore);
  }, []);

  // KPIs
  const totalInstallations = facilities.length;
  const criticalInstallations = facilities.filter(f => f.riskScore >= 60).length;
  const avgAge = Math.round(facilities.reduce((s, f) => s + f.age, 0) / (facilities.length || 1));
  const avgRemainingLife = Math.max(0, 30 - avgAge); // assume ~30 year average life
  const productionAtRisk = useMemo(() => {
    // Blocks with critical facilities
    const criticalBlockIds = new Set(facilities.filter(f => f.riskScore >= 60).map(f => f.blockId));
    return oilBlocks.filter(b => criticalBlockIds.has(b.id)).reduce((s, b) => s + b.dailyProduction, 0);
  }, [facilities]);

  // Bottleneck analysis: capacity vs production
  const bottlenecks = useMemo(() => {
    return oilBlocks
      .filter(b => b.facilityData?.capacityBOPD && b.dailyProduction > 0)
      .map(b => ({
        name: b.name,
        production: b.dailyProduction,
        capacity: b.facilityData!.capacityBOPD!,
        utilization: Math.round((b.dailyProduction / b.facilityData!.capacityBOPD!) * 100),
        efficiency: b.facilityData!.overallEfficiency || 0,
        losses: b.facilityData!.productionLossesBbls || 0,
      }))
      .sort((a, b) => b.utilization - a.utilization);
  }, []);

  // Scatter data: age vs risk
  const scatterData = useMemo(() => {
    return facilities
      .filter(f => f.platform.status !== "Descomissionada")
      .map(f => ({
        name: `${f.platform.name} (${f.blockName})`,
        age: f.age,
        risk: f.riskScore,
        capacity: f.capacityBOPD || 50,
        type: f.platform.type,
        status: f.platform.status,
      }));
  }, [facilities]);

  // Type distribution
  const typeDistribution = useMemo(() => {
    const map = new Map<string, number>();
    facilities.forEach(f => {
      map.set(f.platform.type, (map.get(f.platform.type) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [facilities]);

  const statusColors: Record<string, string> = {
    "Operacional": "text-success",
    "Manutenção": "text-warning",
    "Suspensa": "text-danger",
    "Descomissionada": "text-muted-foreground",
  };

  const riskColor = (score: number) =>
    score >= 60 ? "text-danger" : score >= 40 ? "text-warning" : score >= 20 ? "text-[hsl(var(--chart-3))]" : "text-success";

  const riskBg = (score: number) =>
    score >= 60 ? "bg-danger/10 border-danger/30" : score >= 40 ? "bg-warning/10 border-warning/30" : score >= 20 ? "bg-muted/50 border-border" : "bg-success/5 border-success/20";

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Instalações", value: totalInstallations, icon: Factory, color: "text-primary" },
          { label: "Instalações Críticas", value: criticalInstallations, icon: AlertTriangle, color: "text-danger" },
          { label: "Idade Média", value: avgAge, suffix: " anos", icon: Timer, color: "text-warning" },
          { label: "Vida Útil Rem. Média", value: avgRemainingLife, suffix: " anos", icon: Calendar, color: "text-[hsl(var(--chart-3))]" },
          { label: "Produção em Risco", value: productionAtRisk, suffix: " BOPD", icon: ArrowDown, color: "text-danger" },
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

      {/* Detail view when facility selected */}
      {selectedFacility && (() => {
        const block = oilBlocks.find(b => b.id === selectedFacility.blockId);
        const spec = block?.facilityData?.platformSpecs?.find(p => p.name === selectedFacility.platformName);
        if (!block || !spec) return null;
        const facilityPhotos = block.facilityData?.photos || [];
        const facilityDocs = block.facilityData?.documents || [];
        const facilityMaintenance = block.facilityData?.maintenancePlan || [];
        return (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setSelectedFacility(null)}>
              <ArrowLeft className="w-4 h-4" /> Voltar à lista
            </Button>
            <FacilityDetailCard spec={spec} photos={facilityPhotos} documents={facilityDocs} maintenanceItems={facilityMaintenance} />
          </div>
        );
      })()}

      {!selectedFacility && (
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-muted/50 flex-wrap">
          <TabsTrigger value="installations">Lista de Instalações</TabsTrigger>
          <TabsTrigger value="ranking">Ranking por Criticidade</TabsTrigger>
          <TabsTrigger value="scatter">Idade vs Risco</TabsTrigger>
          <TabsTrigger value="bottlenecks">Gargalos Operacionais</TabsTrigger>
          <TabsTrigger value="types">Distribuição por Tipo</TabsTrigger>
        </TabsList>

        {/* Installations List */}
        <TabsContent value="installations">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Tipo:</span>
            {["all", ...Array.from(new Set(facilities.map(f => f.platform.type)))].map(t => (
              <Badge
                key={t}
                variant="outline"
                className={`text-[10px] cursor-pointer transition-colors ${filterType === t ? "bg-primary/15 text-primary border-primary/40" : "hover:bg-muted"}`}
                onClick={() => setFilterType(t)}
              >
                {t === "all" ? "Todos" : t}
              </Badge>
            ))}
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground ml-3">Status:</span>
            {["all", "Operacional", "Manutenção", "Suspensa", "Descomissionada"].map(s => (
              <Badge
                key={s}
                variant="outline"
                className={`text-[10px] cursor-pointer transition-colors ${filterStatus === s ? "bg-primary/15 text-primary border-primary/40" : "hover:bg-muted"}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === "all" ? "Todos" : s}
              </Badge>
            ))}
          </div>

          <ScrollArea className="h-[560px]">
            <div className="space-y-6">
              {oilBlocks.filter(b => b.facilityData?.platformSpecs?.length).map(block => {
                const filtered = block.facilityData!.platformSpecs!.filter(p =>
                  (filterType === "all" || p.type === filterType) &&
                  (filterStatus === "all" || p.status === filterStatus)
                );
                if (filtered.length === 0) return null;
                return (
                <div key={block.id}>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Factory className="w-4 h-4 text-primary" />
                    {block.name}
                    <Badge variant="outline" className="text-[9px] ml-1">{block.operator}</Badge>
                    <Badge variant="outline" className="text-[9px]">{filtered.length} instalações</Badge>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filtered.map(p => {
                      const age = p.installationYear ? currentYear - p.installationYear : null;
                      const statusCls: Record<string, string> = {
                        Operacional: "bg-success/10 text-success border-success/30",
                        Manutenção: "bg-warning/10 text-warning border-warning/30",
                        Descomissionada: "bg-muted text-muted-foreground border-border",
                        Suspensa: "bg-danger/10 text-danger border-danger/30",
                      };
                      return (
                        <div
                          key={p.name}
                          className="rounded-xl border border-border/50 bg-card overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                          onClick={() => setSelectedFacility({ blockId: block.id, platformName: p.name })}
                        >
                          {p.photo ? (
                            <div className="relative aspect-[16/9] overflow-hidden">
                              <img src={p.photo} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                              <div className="absolute top-2 right-2 flex gap-1">
                                <Badge variant="outline" className={`text-[8px] ${statusCls[p.status] || ""}`}>{p.status}</Badge>
                                {p.matterportUrl && <Badge variant="outline" className="text-[8px] bg-primary/10 text-primary border-primary/30"><Globe className="w-2.5 h-2.5 mr-0.5" />360°</Badge>}
                              </div>
                            </div>
                          ) : (
                            <div className="relative aspect-[16/9] bg-muted/30 flex items-center justify-center">
                              <Factory className="w-8 h-8 text-muted-foreground/30" />
                              <div className="absolute top-2 right-2 flex gap-1">
                                <Badge variant="outline" className={`text-[8px] ${statusCls[p.status] || ""}`}>{p.status}</Badge>
                                {p.matterportUrl && <Badge variant="outline" className="text-[8px] bg-primary/10 text-primary border-primary/30"><Globe className="w-2.5 h-2.5 mr-0.5" />360°</Badge>}
                              </div>
                            </div>
                          )}
                          <div className="p-3">
                            <h4 className="text-xs font-bold truncate">{p.name}</h4>
                            <p className="text-[10px] text-muted-foreground">{p.type}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                              {age !== null && <span className="flex items-center gap-0.5"><Timer className="w-3 h-3" />{age}a</span>}
                              {p.waterDepthM && <span className="flex items-center gap-0.5"><Waves className="w-3 h-3" />{p.waterDepthM}m</span>}
                              {p.capacity && <span className="flex items-center gap-0.5"><Gauge className="w-3 h-3" />{p.capacity}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Ranking */}
        <TabsContent value="ranking">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Ranking de Instalações por Criticidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-1.5">
                  {facilities.map((f, i) => (
                    <div key={`${f.blockId}-${f.platform.name}`} className={`flex items-center gap-3 p-3 rounded-lg border ${riskBg(f.riskScore)}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i < 3 ? "bg-danger/20 text-danger" : i < 10 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{f.platform.name}</div>
                        <div className="text-[10px] text-muted-foreground">{f.blockName} • {f.operator}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px]">{f.platform.type}</Badge>
                          <span className={`text-[10px] font-medium ${statusColors[f.platform.status]}`}>{f.platform.status}</span>
                        </div>
                      </div>
                      <div className="text-center shrink-0">
                        <div className="text-[9px] text-muted-foreground uppercase mb-0.5">Idade</div>
                        <div className="text-sm font-bold">{f.age} anos</div>
                      </div>
                      <div className="text-center shrink-0">
                        <div className="text-[9px] text-muted-foreground uppercase mb-0.5">Capacidade</div>
                        <div className="text-sm font-bold">{f.capacityBOPD > 0 ? `${(f.capacityBOPD / 1000).toFixed(0)}k` : "N/D"}</div>
                      </div>
                      <div className="text-center shrink-0 min-w-[60px]">
                        <div className="text-[9px] text-muted-foreground uppercase mb-0.5">Risco</div>
                        <div className={`text-lg font-bold ${riskColor(f.riskScore)}`}>{f.riskScore}</div>
                        <Progress value={f.riskScore} className="h-1 mt-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scatter: Age vs Risk */}
        <TabsContent value="scatter">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Gauge className="w-4 h-4 text-warning" />
                Idade vs Risco (tamanho = capacidade)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      type="number"
                      dataKey="age"
                      name="Idade"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "Idade (anos)", position: "bottom", offset: 10, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="risk"
                      name="Risco"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "Score de Risco", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      domain={[0, 100]}
                    />
                    <ZAxis type="number" dataKey="capacity" range={[30, 300]} name="Capacidade" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === "Idade") return [`${value} anos`, "Idade"];
                        if (name === "Risco") return [`${value}/100`, "Score Risco"];
                        if (name === "Capacidade") return [`${value.toLocaleString()} BOPD`, "Capacidade"];
                        return [value, name];
                      }}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""}
                    />
                    <Scatter data={scatterData}>
                      {scatterData.map((entry, i) => {
                        const color = entry.risk >= 60 ? "hsl(var(--danger))" :
                          entry.risk >= 40 ? "hsl(var(--warning))" :
                          entry.risk >= 20 ? "hsl(var(--chart-3))" :
                          "hsl(var(--success))";
                        return <Cell key={i} fill={color} fillOpacity={0.7} />;
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                {[
                  { label: "Crítico (≥60)", color: "bg-danger" },
                  { label: "Elevado (40-59)", color: "bg-warning" },
                  { label: "Moderado (20-39)", color: "bg-[hsl(var(--chart-3))]" },
                  { label: "Baixo (<20)", color: "bg-success" },
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

        {/* Bottlenecks */}
        <TabsContent value="bottlenecks">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" />
                Capacidade Instalada vs Produção Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bottlenecks} margin={{ top: 10, right: 20, left: 0, bottom: 40 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={140} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                      formatter={(value: number, name: string) => [`${value.toLocaleString()} BOPD`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="capacity" name="Capacidade" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="production" name="Produção" radius={[0, 4, 4, 0]}>
                      {bottlenecks.map((entry, i) => {
                        const color = entry.utilization >= 80 ? "hsl(var(--danger))" :
                          entry.utilization >= 50 ? "hsl(var(--warning))" :
                          "hsl(var(--success))";
                        return <Cell key={i} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <ScrollArea className="h-[200px]">
                <div className="space-y-1.5">
                  {bottlenecks.map((b) => (
                    <div key={b.name} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs truncate">{b.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {b.production.toLocaleString()} / {b.capacity.toLocaleString()} BOPD
                        </div>
                      </div>
                      <div className="text-center shrink-0">
                        <div className={`text-sm font-bold ${
                          b.utilization >= 80 ? "text-danger" : b.utilization >= 50 ? "text-warning" : "text-success"
                        }`}>
                          {b.utilization}%
                        </div>
                        <div className="text-[9px] text-muted-foreground">Utilização</div>
                      </div>
                      <div className="text-center shrink-0">
                        <div className="text-sm font-bold text-foreground">{b.efficiency}%</div>
                        <div className="text-[9px] text-muted-foreground">Eficiência</div>
                      </div>
                      {b.losses > 0 && (
                        <div className="text-center shrink-0">
                          <div className="text-sm font-bold text-danger">{(b.losses / 1e6).toFixed(1)}M</div>
                          <div className="text-[9px] text-muted-foreground">Perdas (bbl)</div>
                        </div>
                      )}
                      <div className="w-20 shrink-0">
                        <Progress value={b.utilization} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Type Distribution */}
        <TabsContent value="types">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Anchor className="w-4 h-4 text-primary" />
                Distribuição por Tipo de Instalação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="type" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" name="Instalações" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {(["Operacional", "Manutenção", "Suspensa", "Descomissionada"] as const).map(status => {
                  const count = facilities.filter(f => f.platform.status === status).length;
                  return (
                    <div key={status} className="text-center p-3 rounded-lg border border-border/50 bg-card/50">
                      <div className={`text-xl font-bold ${statusColors[status]}`}>{count}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">{status}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
};
