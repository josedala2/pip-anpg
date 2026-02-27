import { useParams, useNavigate } from "react-router-dom";
import { oilBlocks } from "@/data/angolaBlocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Droplets, DollarSign, ShieldCheck, TrendingUp, Users, Activity, Target, Layers, BarChart3, MapPin } from "lucide-react";
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const phaseColor = (phase: string) => {
  switch (phase) {
    case "Production": return "bg-success/15 text-success border-success/30";
    case "Development": return "bg-warning/15 text-warning border-warning/30";
    case "Exploration": return "bg-primary/15 text-primary border-primary/30";
    case "Suspended": return "bg-danger/15 text-danger border-danger/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const CONSORTIUM_COLORS = [
  "hsl(199, 89%, 48%)", "hsl(152, 69%, 40%)", "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)", "hsl(170, 60%, 45%)",
  "hsl(220, 70%, 55%)", "hsl(340, 65%, 50%)",
];

const BlockPage = () => {
  const { blockId } = useParams<{ blockId: string }>();
  const navigate = useNavigate();
  const block = oilBlocks.find(b => b.id === blockId);

  if (!block) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Bloco não encontrado</h2>
          <p className="text-muted-foreground mb-4">O bloco "{blockId}" não existe na base de dados.</p>
          <Button onClick={() => navigate("/")} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Voltar ao Dashboard</Button>
        </Card>
      </div>
    );
  }

  const projectionYears = block.projections.base.map((_, i) => ({
    year: `${2025 + i}`,
    conservative: block.projections.conservative[i],
    base: block.projections.base[i],
    expansion: block.projections.expansion[i],
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button onClick={() => navigate("/")} variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{block.name}</h1>
            <Badge variant="outline" className={`text-xs shrink-0 ${phaseColor(block.phase)}`}>{block.phase}</Badge>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <span>{block.operator}</span>
            <span>·</span>
            <span>{block.basin}</span>
            <span>·</span>
            <span>{block.waterDepth}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 space-y-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="glass-card p-1 h-auto flex-wrap">
            <TabsTrigger value="overview" className="gap-1.5 text-xs"><Activity className="w-3.5 h-3.5" />Visão Geral</TabsTrigger>
            <TabsTrigger value="consortium" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />Consórcio</TabsTrigger>
            <TabsTrigger value="exploration" className="gap-1.5 text-xs"><Target className="w-3.5 h-3.5" />Exploração</TabsTrigger>
            <TabsTrigger value="production" className="gap-1.5 text-xs"><BarChart3 className="w-3.5 h-3.5" />Produção</TabsTrigger>
            <TabsTrigger value="projections" className="gap-1.5 text-xs"><TrendingUp className="w-3.5 h-3.5" />Projecções</TabsTrigger>
          </TabsList>

          {/* Tab 1: Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Produção Diária", value: block.dailyProduction > 0 ? `${(block.dailyProduction / 1000).toFixed(0)}k BOPD` : "—", icon: Droplets, color: "text-primary" },
                { label: "Reservas Estimadas", value: `${block.estimatedReserves}M bbl`, icon: Layers, color: "text-success" },
                { label: "Investimento Acum.", value: `$${(block.accumulatedInvestment / 1000).toFixed(1)}B`, icon: DollarSign, color: "text-warning" },
                { label: "Taxa Execução", value: `${block.executionRate}%`, icon: TrendingUp, color: "text-primary" },
              ].map(kpi => (
                <Card key={kpi.label} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                      <span className="text-xs text-muted-foreground">{kpi.label}</span>
                    </div>
                    <div className="text-2xl font-bold font-mono">{kpi.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Info Grid */}
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {[
                      { label: "Operador", value: block.operator },
                      { label: "Bacia Sedimentar", value: block.basin },
                      { label: "Profundidade", value: block.waterDepth },
                      { label: "Data do Contrato", value: new Date(block.contractDate).toLocaleDateString("pt-AO") },
                      { label: "Investimento Planeado", value: `$${(block.plannedInvestment / 1000).toFixed(1)}B` },
                      ...(block.areaKm2 ? [{ label: "Área", value: `${block.areaKm2.toLocaleString()} km²` }] : []),
                      ...(block.waterDepthRange ? [{ label: "Lâmina d'Água", value: block.waterDepthRange }] : []),
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk & Compliance */}
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" />Risco & Compliance</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-8 mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold font-mono">{block.riskScore}<span className="text-lg text-muted-foreground">/10</span></div>
                      <div className="text-xs text-muted-foreground mt-1">Score de Risco</div>
                    </div>
                    <div className="text-center flex-1">
                      <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                          <Pie data={[{ value: block.complianceScore }, { value: 100 - block.complianceScore }]}
                            cx="50%" cy="50%" innerRadius={35} outerRadius={50} startAngle={90} endAngle={-270} dataKey="value">
                            <Cell fill="hsl(152, 69%, 40%)" />
                            <Cell fill="hsl(var(--muted))" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="text-xs text-muted-foreground -mt-2">Compliance: <span className="font-bold text-foreground">{block.complianceScore}%</span></div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {block.riskScore <= 3 ? "Risco baixo — operações estáveis e previsíveis." :
                     block.riskScore <= 6 ? "Risco moderado — requer monitorização contínua." :
                     "Risco elevado — necessário plano de mitigação activo."}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fields/Discoveries */}
            {block.fields && block.fields.length > 0 && (
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">Campos & Descobertas</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {block.fields.map(f => (
                      <div key={f.name} className="glass-card p-3 rounded-lg">
                        <div className="font-medium text-sm">{f.name}</div>
                        <Badge variant="outline" className="text-[10px] mt-1">{f.status}</Badge>
                        {f.discoveryYear && <div className="text-[10px] text-muted-foreground mt-1">Descoberto: {f.discoveryYear}</div>}
                        {f.peakProduction && <div className="text-[10px] text-muted-foreground">{(f.peakProduction / 1000).toFixed(0)}k BOPD pico</div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 2: Consórcio */}
          <TabsContent value="consortium" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">Parceiros do Consórcio</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {block.concession.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CONSORTIUM_COLORS[i % CONSORTIUM_COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{p.name}</span>
                            {p.isOperator && <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">Operador</Badge>}
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full mt-1 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${p.share}%`, backgroundColor: CONSORTIUM_COLORS[i % CONSORTIUM_COLORS.length] }} />
                          </div>
                        </div>
                        <span className="font-mono text-sm font-bold w-14 text-right">{p.share.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">Distribuição de Participações</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={block.concession.map(p => ({ name: p.name, value: p.share }))}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value"
                        label={({ name, value }) => `${name.split(" ")[0]} ${value.toFixed(0)}%`}>
                        {block.concession.map((_, i) => (
                          <Cell key={i} fill={CONSORTIUM_COLORS[i % CONSORTIUM_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => `${val.toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Exploração */}
          <TabsContent value="exploration" className="space-y-4">
            {block.seismicData && block.seismicData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="glass-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">Dados Sísmicos (km)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={block.seismicData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="seismic2D" name="2D" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="seismic3D" name="3D" fill="hsl(152, 69%, 40%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="seismic4D" name="4D" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {block.wellsData && block.wellsData.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm">Poços Perfurados</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={block.wellsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="pesquisa" name="Pesquisa" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="avaliacao" name="Avaliação" fill="hsl(280, 65%, 60%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Dados de exploração detalhados não disponíveis para este bloco.</p>
                  <p className="text-xs text-muted-foreground mt-1">Dados sísmicos e de poços serão adicionados conforme disponibilização pela ANPG.</p>
                </CardContent>
              </Card>
            )}

            {block.geologicalObjectives && block.geologicalObjectives.length > 0 && (
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">Objectivos Geológicos</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {block.geologicalObjectives.map(obj => (
                      <Badge key={obj} variant="outline" className="text-xs bg-primary/5">{obj}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 4: Produção */}
          <TabsContent value="production" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">Tendência de Produção (12 meses)</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={block.productionHistory}>
                      <defs>
                        <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                        formatter={(val: number) => [`${(val / 1000).toFixed(1)}k BOPD`, "Produção"]} />
                      <Area type="monotone" dataKey="value" stroke="hsl(152, 69%, 40%)" fill="url(#prodGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">CAPEX: Planeado vs Real ($M)</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={block.capexHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                        formatter={(val: number) => [`$${val}M`]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="planned" name="Planeado" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" name="Real" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 5: Projecções */}
          <TabsContent value="projections">
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Projecções de Produção (2025–2034)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={projectionYears}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                      formatter={(val: number) => [`${(val / 1000).toFixed(1)}k BOPD`]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="conservative" name="Conservador" stroke="hsl(0, 72%, 51%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="base" name="Base" stroke="hsl(199, 89%, 48%)" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="expansion" name="Expansão" stroke="hsl(152, 69%, 40%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BlockPage;
