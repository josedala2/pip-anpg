import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { oilBlocks, type OilBlock } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BarChart3,
  Shield,
  Factory,
  TrendingUp,
  DollarSign,
  X,
  Sun,
  Moon,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "hsl(355, 90%, 58%)",
  "hsl(199, 89%, 48%)",
  "hsl(152, 69%, 40%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(20, 80%, 55%)",
  "hsl(170, 60%, 45%)",
  "hsl(340, 70%, 50%)",
];

const phaseLabel: Record<string, string> = {
  Exploration: "Exploração",
  Development: "Desenvolvimento",
  Production: "Produção",
  Suspended: "Suspenso",
  Bidding: "Licitação",
};

const formatNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("pt-AO");
};

const getNpvTotal = (b: OilBlock): number => {
  const ge = b.economicVision?.npvFullcycle?.find((e) => e.label === "GE");
  return ge?.valueMM ?? 0;
};

export default function ComparePage() {
  const { theme, toggleTheme } = useTheme();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filteredBlocks = useMemo(
    () =>
      oilBlocks.filter(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.operator.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const selectedBlocks = useMemo(
    () => oilBlocks.filter((b) => selectedIds.includes(b.id)),
    [selectedIds]
  );

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 8 ? [...prev, id] : prev
    );

  // ─── Chart Data Builders ───

  const productionData = useMemo(() => {
    return selectedBlocks.map((b) => ({
      name: b.name.replace("Block ", "B"),
      "Produção (BOPD)": b.dailyProduction,
      "Reservas (MMBO)": b.estimatedReserves,
    }));
  }, [selectedBlocks]);

  const investmentData = useMemo(() => {
    return selectedBlocks.map((b) => ({
      name: b.name.replace("Block ", "B"),
      "Capex Acumulado": b.accumulatedInvestment,
      "Capex Planeado": b.plannedInvestment,
    }));
  }, [selectedBlocks]);

  const radarData = useMemo(() => {
    const metrics = [
      { key: "execRate", label: "Execução (%)" },
      { key: "compliance", label: "Compliance (%)" },
      { key: "riskInv", label: "Risco (inv.)" },
      { key: "efficiency", label: "Eficiência (%)" },
      { key: "hse", label: "HSE Score" },
    ];
    return metrics.map((m) => {
      const row: Record<string, string | number> = { metric: m.label };
      selectedBlocks.forEach((b) => {
        const shortName = b.name.replace("Block ", "B");
        switch (m.key) {
          case "execRate":
            row[shortName] = b.executionRate;
            break;
          case "compliance":
            row[shortName] = b.complianceScore;
            break;
          case "riskInv":
            row[shortName] = (10 - b.riskScore) * 10; // invert so higher = better
            break;
          case "efficiency":
            row[shortName] = b.facilityData?.overallEfficiency ?? 0;
            break;
          case "hse": {
            const latest = b.hseData?.[b.hseData.length - 1];
            row[shortName] = latest ? Math.max(0, 100 - latest.trir * 100) : 0;
            break;
          }
        }
      });
      return row;
    });
  }, [selectedBlocks]);

  const hseData = useMemo(() => {
    if (selectedBlocks.length === 0) return [];
    const years = [2021, 2022, 2023, 2024, 2025];
    return years.map((y) => {
      const row: Record<string, string | number> = { year: y.toString() };
      selectedBlocks.forEach((b) => {
        const shortName = b.name.replace("Block ", "B");
        const yData = b.hseData?.find((h) => h.year === y);
        row[`${shortName} TRIR`] = yData?.trir ?? 0;
      });
      return row;
    });
  }, [selectedBlocks]);

  const emissionsData = useMemo(() => {
    if (selectedBlocks.length === 0) return [];
    const years = [2021, 2022, 2023, 2024, 2025];
    return years.map((y) => {
      const row: Record<string, string | number> = { year: y.toString() };
      selectedBlocks.forEach((b) => {
        const shortName = b.name.replace("Block ", "B");
        const eData = b.environmentalData?.find((e) => e.year === y);
        row[shortName] = eData?.co2EmissionsTonCO2eq
          ? Math.round(eData.co2EmissionsTonCO2eq / 1000)
          : 0;
      });
      return row;
    });
  }, [selectedBlocks]);

  const projectionsData = useMemo(() => {
    if (selectedBlocks.length === 0) return [];
    const years = Array.from({ length: 10 }, (_, i) => 2026 + i);
    return years.map((y, i) => {
      const row: Record<string, string | number> = { year: y.toString() };
      selectedBlocks.forEach((b) => {
        const shortName = b.name.replace("Block ", "B");
        row[shortName] = b.projections.base[i] ?? 0;
      });
      return row;
    });
  }, [selectedBlocks]);

  // ─── Financial Data Builders ───

  const npvData = useMemo(() => {
    return selectedBlocks.map((b, i) => ({
      name: b.name.replace("Block ", "B"),
      "NPV (MMUSD)": getNpvTotal(b),
      fill: COLORS[i % COLORS.length],
    }));
  }, [selectedBlocks]);

  const opexBarrelData = useMemo(() => {
    return selectedBlocks.map((b, i) => ({
      name: b.name.replace("Block ", "B"),
      "Opex/Barril (USD)": b.economicData?.opexPerBarrel ?? 0,
      fill: COLORS[i % COLORS.length],
    }));
  }, [selectedBlocks]);

  const investmentPlanData = useMemo(() => {
    if (selectedBlocks.length === 0) return [];
    const allYears = new Set<number>();
    selectedBlocks.forEach((b) =>
      b.economicData?.investmentPlan?.forEach((p) => allYears.add(p.year))
    );
    const years = Array.from(allYears).sort();
    return years.map((y) => {
      const row: Record<string, string | number> = { year: y.toString() };
      selectedBlocks.forEach((b) => {
        const shortName = b.name.replace("Block ", "B");
        const plan = b.economicData?.investmentPlan?.find((p) => p.year === y);
        row[shortName] = plan?.total ?? 0;
      });
      return row;
    });
  }, [selectedBlocks]);

  const costHistoryData = useMemo(() => {
    if (selectedBlocks.length === 0) return [];
    const allPeriods = new Set<string>();
    selectedBlocks.forEach((b) =>
      b.economicData?.costHistory?.forEach((c) => allPeriods.add(c.period))
    );
    const periods = Array.from(allPeriods).sort();
    return periods.map((p) => {
      const row: Record<string, string | number> = { period: p };
      selectedBlocks.forEach((b) => {
        const shortName = b.name.replace("Block ", "B");
        const cost = b.economicData?.costHistory?.find((c) => c.period === p);
        row[`${shortName} CAPEX`] = cost?.capex ?? 0;
        row[`${shortName} OPEX`] = cost?.opex ?? 0;
      });
      return row;
    });
  }, [selectedBlocks]);

  const abandonmentData = useMemo(() => {
    return selectedBlocks
      .filter((b) => b.economicData?.abandonment)
      .map((b, i) => ({
        name: b.name.replace("Block ", "B"),
        "Total Abandono": b.economicData!.abandonment!.total,
        "Fundeamento Depositado": b.economicData!.abandonment!.fundingDeposited,
        "Fundeamento Necessário": b.economicData!.abandonment!.fundingRequired,
        fill: COLORS[i % COLORS.length],
      }));
  }, [selectedBlocks]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 border-t-4 border-t-primary">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img
              src={theme === "dark" ? anpgLogoWhite : anpgLogoColor}
              alt="ANPG Logo"
              className="h-8 md:h-10"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight">
                <span className="text-primary">Comparativo</span>
                <span className="text-foreground font-light ml-2">de Blocos</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Seleccione até 8 blocos para comparação lado a lado
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Left: Block Selector */}
        <aside className="w-full lg:w-72 xl:w-80 border-b lg:border-b-0 lg:border-r border-border bg-card/50">
          <div className="p-3">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar blocos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedBlocks.map((b, i) => (
                  <Badge
                    key={b.id}
                    variant="secondary"
                    className="text-xs gap-1 cursor-pointer hover:bg-destructive/20"
                    style={{ borderLeftColor: COLORS[i % COLORS.length], borderLeftWidth: 3 }}
                    onClick={() => toggle(b.id)}
                  >
                    {b.name.replace("Block ", "B")}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground"
                  onClick={() => setSelectedIds([])}
                >
                  Limpar
                </Button>
              </div>
            )}
          </div>
          <ScrollArea className="h-[200px] lg:h-[calc(100vh-180px)]">
            <div className="px-3 pb-3 space-y-1">
              {filteredBlocks.map((b) => {
                const checked = selectedIds.includes(b.id);
                return (
                  <label
                    key={b.id}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                      checked
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-secondary/60 border border-transparent"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(b.id)}
                      disabled={!checked && selectedIds.length >= 8}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{b.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {b.operator} • {formatNum(b.dailyProduction)} BOPD
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] shrink-0"
                    >
                      {phaseLabel[b.phase] ?? b.phase}
                    </Badge>
                  </label>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* Right: Comparison Dashboard */}
        <main className="flex-1 p-4 md:p-6 min-w-0">
          {selectedBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-muted-foreground">
                Seleccione blocos para comparar
              </h2>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-md">
                Escolha entre 2 e 8 blocos no painel à esquerda para visualizar a comparação de KPIs
              </p>
            </div>
          ) : selectedBlocks.length === 1 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-muted-foreground">
                Seleccione pelo menos mais um bloco
              </h2>
              <p className="text-sm text-muted-foreground/70 mt-1">
                <strong>{selectedBlocks[0].name}</strong> seleccionado — adicione mais para comparar
              </p>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="overview" className="gap-1.5 text-xs">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="production" className="gap-1.5 text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Produção
                </TabsTrigger>
                <TabsTrigger value="hse" className="gap-1.5 text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  HSE & Ambiente
                </TabsTrigger>
                <TabsTrigger value="financial" className="gap-1.5 text-xs">
                  <DollarSign className="w-3.5 h-3.5" />
                  Financeiro
                </TabsTrigger>
                <TabsTrigger value="facilities" className="gap-1.5 text-xs">
                  <Factory className="w-3.5 h-3.5" />
                  Instalações
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                {/* KPI Comparison Table */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Comparação de KPIs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                              Indicador
                            </th>
                            {selectedBlocks.map((b, i) => (
                              <th
                                key={b.id}
                                className="text-right py-2 px-3 font-semibold"
                                style={{ color: COLORS[i % COLORS.length] }}
                              >
                                {b.name.replace("Block ", "B")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          <KPIRow
                            label="Produção (BOPD)"
                            values={selectedBlocks.map((b) => formatNum(b.dailyProduction))}
                            highlights={selectedBlocks.map((_, i) => COLORS[i % COLORS.length])}
                          />
                          <KPIRow
                            label="Reservas (MMBO)"
                            values={selectedBlocks.map((b) => b.estimatedReserves.toLocaleString("pt-AO"))}
                          />
                          <KPIRow
                            label="Capex Acumulado (MMUSD)"
                            values={selectedBlocks.map((b) => formatNum(b.accumulatedInvestment))}
                          />
                          <KPIRow
                            label="Taxa de Execução (%)"
                            values={selectedBlocks.map((b) => `${b.executionRate}%`)}
                          />
                          <KPIRow
                            label="Score de Risco (1-10)"
                            values={selectedBlocks.map((b) => b.riskScore.toString())}
                          />
                          <KPIRow
                            label="Compliance (%)"
                            values={selectedBlocks.map((b) => `${b.complianceScore}%`)}
                          />
                          <KPIRow
                            label="Opex/Barril (USD)"
                            values={selectedBlocks.map((b) =>
                              b.economicData?.opexPerBarrel
                                ? `$${b.economicData.opexPerBarrel}`
                                : "—"
                            )}
                          />
                          <KPIRow
                            label="Eficiência (%)"
                            values={selectedBlocks.map((b) =>
                              b.facilityData?.overallEfficiency
                                ? `${b.facilityData.overallEfficiency}%`
                                : "—"
                            )}
                          />
                          <KPIRow
                            label="Poços Activos"
                            values={selectedBlocks.map((b) => {
                              const w = b.facilityData?.activeWells;
                              return w ? `${w.op + w.wi + w.gi}` : "—";
                            })}
                          />
                          <KPIRow
                            label="TRIR (2025)"
                            values={selectedBlocks.map((b) => {
                              const latest = b.hseData?.[b.hseData.length - 1];
                              return latest ? latest.trir.toFixed(2) : "—";
                            })}
                          />
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Radar Chart */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Perfil Comparativo (Radar)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis
                            dataKey="metric"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          />
                          {selectedBlocks.map((b, i) => (
                            <Radar
                              key={b.id}
                              name={b.name.replace("Block ", "B")}
                              dataKey={b.name.replace("Block ", "B")}
                              stroke={COLORS[i % COLORS.length]}
                              fill={COLORS[i % COLORS.length]}
                              fillOpacity={0.1}
                              strokeWidth={2}
                            />
                          ))}
                          <Legend
                            wrapperStyle={{ fontSize: 11 }}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Produção vs Reservas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={productionData} barGap={4}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          />
                          <YAxis
                            yAxisId="left"
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            label={{
                              value: "BOPD",
                              angle: -90,
                              position: "insideLeft",
                              style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
                            }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            label={{
                              value: "MMBO",
                              angle: 90,
                              position: "insideRight",
                              style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
                            }}
                          />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar
                            yAxisId="left"
                            dataKey="Produção (BOPD)"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="Reservas (MMBO)"
                            fill="hsl(var(--chart-5))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Investment Chart */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Investimento Comparativo (MMUSD)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={investmentData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar
                          dataKey="Capex Acumulado"
                          fill="hsl(var(--chart-2))"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="Capex Planeado"
                          fill="hsl(var(--chart-3))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Production Tab */}
              <TabsContent value="production" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Projecções de Produção (Cenário Base, BOPD)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={projectionsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="year"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          tickFormatter={(v) => formatNum(v)}
                        />
                        <Tooltip formatter={(v: number) => formatNum(v)} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        {selectedBlocks.map((b, i) => (
                          <Line
                            key={b.id}
                            type="monotone"
                            dataKey={b.name.replace("Block ", "B")}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Production History Comparison */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Histórico de Produção Mensal (BOPD)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart
                        data={selectedBlocks[0]?.productionHistory.map((ph, idx) => {
                          const row: Record<string, string | number> = { month: ph.month };
                          selectedBlocks.forEach((b) => {
                            row[b.name.replace("Block ", "B")] =
                              b.productionHistory[idx]?.value ?? 0;
                          });
                          return row;
                        })}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          tickFormatter={(v) => formatNum(v)}
                        />
                        <Tooltip formatter={(v: number) => formatNum(v)} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        {selectedBlocks.map((b, i) => (
                          <Line
                            key={b.id}
                            type="monotone"
                            dataKey={b.name.replace("Block ", "B")}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* HSE Tab */}
              <TabsContent value="hse" className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">TRIR (2021-2025)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={hseData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="year"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          {selectedBlocks.map((b, i) => (
                            <Line
                              key={b.id}
                              type="monotone"
                              dataKey={`${b.name.replace("Block ", "B")} TRIR`}
                              stroke={COLORS[i % COLORS.length]}
                              strokeWidth={2}
                              dot={{ r: 3 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Emissões CO₂ (kt CO₂eq, 2021-2025)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={emissionsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="year"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            label={{
                              value: "kt CO₂eq",
                              angle: -90,
                              position: "insideLeft",
                              style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
                            }}
                          />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          {selectedBlocks.map((b, i) => (
                            <Bar
                              key={b.id}
                              dataKey={b.name.replace("Block ", "B")}
                              fill={COLORS[i % COLORS.length]}
                              radius={[3, 3, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* HSE Comparison Table */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Indicadores HSE (2025)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                              Indicador
                            </th>
                            {selectedBlocks.map((b, i) => (
                              <th
                                key={b.id}
                                className="text-right py-2 px-3 font-semibold"
                                style={{ color: COLORS[i % COLORS.length] }}
                              >
                                {b.name.replace("Block ", "B")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {(
                            [
                              ["FAT", "fat"],
                              ["LTI", "lti"],
                              ["TRIR", "trir"],
                              ["LTIR", "ltir"],
                              ["NMI", "nmi"],
                              ["HHR (M)", "hhr"],
                            ] as const
                          ).map(([label, key]) => (
                            <KPIRow
                              key={label}
                              label={label}
                              values={selectedBlocks.map((b) => {
                                const latest = b.hseData?.[b.hseData.length - 1];
                                if (!latest) return "—";
                                const val = latest[key as keyof typeof latest];
                                return typeof val === "number"
                                  ? key === "trir" || key === "ltir"
                                    ? (val as number).toFixed(2)
                                    : val.toString()
                                  : "—";
                              })}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Facilities Tab */}
              <TabsContent value="facilities" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Comparação de Instalações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                              Indicador
                            </th>
                            {selectedBlocks.map((b, i) => (
                              <th
                                key={b.id}
                                className="text-right py-2 px-3 font-semibold"
                                style={{ color: COLORS[i % COLORS.length] }}
                              >
                                {b.name.replace("Block ", "B")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          <KPIRow
                            label="Capacidade (BOPD)"
                            values={selectedBlocks.map((b) =>
                              b.facilityData?.capacityBOPD
                                ? formatNum(b.facilityData.capacityBOPD)
                                : "—"
                            )}
                          />
                          <KPIRow
                            label="Eficiência (%)"
                            values={selectedBlocks.map((b) =>
                              b.facilityData?.overallEfficiency
                                ? `${b.facilityData.overallEfficiency}%`
                                : "—"
                            )}
                          />
                          <KPIRow
                            label="Poços OP"
                            values={selectedBlocks.map((b) =>
                              b.facilityData?.activeWells?.op?.toString() ?? "—"
                            )}
                          />
                          <KPIRow
                            label="Poços WI"
                            values={selectedBlocks.map((b) =>
                              b.facilityData?.activeWells?.wi?.toString() ?? "—"
                            )}
                          />
                          <KPIRow
                            label="Poços GI"
                            values={selectedBlocks.map((b) =>
                              b.facilityData?.activeWells?.gi?.toString() ?? "—"
                            )}
                          />
                          <KPIRow
                            label="Plataformas"
                            values={selectedBlocks.map((b) =>
                              b.facilityData?.platformSpecs?.length?.toString() ?? "—"
                            )}
                          />
                          <KPIRow
                            label="Início de Produção"
                            values={selectedBlocks.map((b) =>
                              b.facilityData?.productionStartYear
                                ? b.facilityData.productionStartYear.toString()
                                : "—"
                            )}
                          />
                          <KPIRow
                            label="Fim de Vida"
                            values={selectedBlocks.map((b) =>
                              b.facilityData?.endOfLifeYear
                                ? b.facilityData.endOfLifeYear.toString()
                                : "—"
                            )}
                          />
                          <KPIRow
                            label="Prod. Acumulada (BO)"
                            values={selectedBlocks.map((b) =>
                              b.facilityData?.cumulativeProductionBO
                                ? formatNum(b.facilityData.cumulativeProductionBO)
                                : "—"
                            )}
                          />
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Efficiency Bar Chart */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Eficiência Operacional (%)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={selectedBlocks.map((b, i) => ({
                          name: b.name.replace("Block ", "B"),
                          efficiency: b.facilityData?.overallEfficiency ?? 0,
                          fill: COLORS[i % COLORS.length],
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip />
                        {selectedBlocks.map((b, i) => (
                          <Bar
                            key={b.id}
                            dataKey="efficiency"
                            name={b.name.replace("Block ", "B")}
                            fill={COLORS[i % COLORS.length]}
                            radius={[4, 4, 0, 0]}
                            hide={false}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-4">
                {/* NPV & Opex/Barrel side by side */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">NPV — Valor Presente Líquido (MMUSD)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={npvData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip />
                          <Bar dataKey="NPV (MMUSD)" radius={[4, 4, 0, 0]}>
                            {npvData.map((entry, i) => (
                              <rect key={i} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Opex por Barril (USD/bbl)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={opexBarrelData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip />
                          <Bar dataKey="Opex/Barril (USD)" radius={[4, 4, 0, 0]}>
                            {opexBarrelData.map((entry, i) => (
                              <rect key={i} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Investment Plan (5-year) */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Plano de Investimento Quinquenal (MMUSD)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={investmentPlanData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip />
                        <Legend />
                        {selectedBlocks.map((b, i) => (
                          <Line
                            key={b.id}
                            type="monotone"
                            dataKey={b.name.replace("Block ", "B")}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Financial KPI Table */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Indicadores Financeiros Detalhados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Indicador</th>
                            {selectedBlocks.map((b, i) => (
                              <th key={b.id} className="text-right py-2 px-3 font-semibold" style={{ color: COLORS[i % COLORS.length] }}>
                                {b.name.replace("Block ", "B")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          <KPIRow
                            label="NPV (MMUSD)"
                            values={selectedBlocks.map((b) => { const v = getNpvTotal(b); return v ? `$${v.toLocaleString("pt-AO")}` : "—"; })}
                          />
                          <KPIRow
                            label="Opex/Barril (USD)"
                            values={selectedBlocks.map((b) => b.economicData?.opexPerBarrel ? `$${b.economicData.opexPerBarrel}` : "—")}
                          />
                          <KPIRow
                            label="Dívida Sonangol (MMUSD)"
                            values={selectedBlocks.map((b) => b.economicData?.sonangolDebt != null ? `$${b.economicData.sonangolDebt}` : "—")}
                          />
                          <KPIRow
                            label="Custo Abandono (MMUSD)"
                            values={selectedBlocks.map((b) => b.economicData?.abandonment?.total ? `$${b.economicData.abandonment.total}` : "—")}
                          />
                          <KPIRow
                            label="Fundo Abandono Depositado"
                            values={selectedBlocks.map((b) => b.economicData?.abandonment?.fundingDeposited ? `$${b.economicData.abandonment.fundingDeposited}` : "—")}
                          />
                          <KPIRow
                            label="Capex Acumulado (MMUSD)"
                            values={selectedBlocks.map((b) => `$${formatNum(b.accumulatedInvestment)}`)}
                          />
                          <KPIRow
                            label="Capex Planeado (MMUSD)"
                            values={selectedBlocks.map((b) => `$${formatNum(b.plannedInvestment)}`)}
                          />
                          <KPIRow
                            label="Taxa de Execução (%)"
                            values={selectedBlocks.map((b) => `${b.executionRate}%`)}
                          />
                          <KPIRow
                            label="Receita Estado"
                            values={selectedBlocks.map((b) => {
                              const sr = b.economicData?.stateRevenueShare;
                              return sr?.length ? `${sr[sr.length - 1].percentage}% (${sr[sr.length - 1].period})` : "—";
                            })}
                          />
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Abandonment Fund Comparison */}
                {abandonmentData.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Fundos de Abandono (MMUSD)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={abandonmentData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Total Abandono" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Fundeamento Depositado" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Fundeamento Necessário" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Cost History (CAPEX vs OPEX) */}
                {costHistoryData.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Histórico CAPEX vs OPEX (MMUSD)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={costHistoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip />
                          <Legend />
                          {selectedBlocks.map((b, i) => (
                            <Bar
                              key={`${b.id}-capex`}
                              dataKey={`${b.name.replace("Block ", "B")} CAPEX`}
                              fill={COLORS[i % COLORS.length]}
                              radius={[4, 4, 0, 0]}
                              stackId={b.id}
                            />
                          ))}
                          {selectedBlocks.map((b, i) => (
                            <Bar
                              key={`${b.id}-opex`}
                              dataKey={`${b.name.replace("Block ", "B")} OPEX`}
                              fill={COLORS[i % COLORS.length]}
                              opacity={0.5}
                              radius={[4, 4, 0, 0]}
                              stackId={b.id}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
}

function KPIRow({
  label,
  values,
  highlights,
}: {
  label: string;
  values: string[];
  highlights?: string[];
}) {
  // Find the "best" value to highlight (highest number)
  const numericValues = values.map((v) => parseFloat(v.replace(/[^0-9.-]/g, "")));
  const maxIdx =
    numericValues.some((v) => !isNaN(v))
      ? numericValues.indexOf(Math.max(...numericValues.filter((v) => !isNaN(v))))
      : -1;

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="py-2 px-3 text-muted-foreground">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`text-right py-2 px-3 tabular-nums ${
            i === maxIdx && values.length > 1 ? "font-bold" : ""
          }`}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}
