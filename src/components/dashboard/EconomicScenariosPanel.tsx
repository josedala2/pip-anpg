import { useMemo, useState } from "react";
import {
  runAllScenarios,
  runAllScenariosForBlock,
  runAllScenariosForOperator,
  runCustomScenario,
  runScenarioForBlock,
  runScenarioForOperator,
  runScenarioForOperator as runSingleOperatorScenario,
  PREDEFINED_SCENARIOS,
  BASE_VARIABLES,
  type ScenarioVariables,
  type ScenarioOutput,
} from "@/lib/scenarioEngine";
import { oilBlocks } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip as RechartsTooltip, Legend, ReferenceLine,
} from "recharts";
import {
  Play, Settings2, TrendingUp, DollarSign, Percent, BarChart3,
  ChevronDown, ChevronUp, MapPin, Building2,
} from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { tooltipDescriptions } from "@/lib/tooltipDescriptions";

const producingBlocks = oilBlocks.filter(b => b.dailyProduction > 0).sort((a, b) => b.dailyProduction - a.dailyProduction);
const operators = [...new Set(oilBlocks.filter(b => b.dailyProduction > 0).map(b => b.operator))].sort();

/** Smart format: shows $B for large values, $MM for smaller */
function fmtUSD(mmusd: number): string {
  const abs = Math.abs(mmusd);
  if (abs >= 1000) return `${mmusd >= 0 ? "+" : ""}$${(mmusd / 1000).toFixed(1)}B`;
  return `${mmusd >= 0 ? "+" : ""}$${Math.round(mmusd)}MM`;
}
function fmtUSDShort(mmusd: number): string {
  const abs = Math.abs(mmusd);
  if (abs >= 1000) return `$${(mmusd / 1000).toFixed(1)}B`;
  return `$${Math.round(mmusd)}MM`;
}

type ViewMode = "national" | "block" | "operator";

export const EconomicScenariosPanel = () => {
  const [showCustom, setShowCustom] = useState(false);
  const [customVars, setCustomVars] = useState<ScenarioVariables>({ ...BASE_VARIABLES });
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(
    PREDEFINED_SCENARIOS.map(s => s.id)
  );
  const [viewMode, setViewMode] = useState<ViewMode>("national");
  const [selectedBlockId, setSelectedBlockId] = useState<string>("all");
  const [selectedOperator, setSelectedOperator] = useState<string>("all");
  const [operatorCompareScenario, setOperatorCompareScenario] = useState<string>(PREDEFINED_SCENARIOS[0].id);

  const selectedBlock = useMemo(
    () => viewMode === "block" && selectedBlockId !== "all" ? oilBlocks.find(b => b.id === selectedBlockId) || null : null,
    [viewMode, selectedBlockId]
  );

  const operatorBlocks = useMemo(
    () => viewMode === "operator" && selectedOperator !== "all"
      ? oilBlocks.filter(b => b.operator === selectedOperator && b.dailyProduction > 0)
      : [],
    [viewMode, selectedOperator]
  );

  const predefinedOutputs = useMemo(() => {
    if (selectedBlock) return runAllScenariosForBlock(selectedBlock);
    if (viewMode === "operator" && selectedOperator !== "all") return runAllScenariosForOperator(selectedOperator);
    return runAllScenarios();
  }, [selectedBlock, viewMode, selectedOperator]);

  const customOutput = useMemo(() => {
    if (!showCustom) return null;
    const custom = {
      id: "custom", name: "Cenário Personalizado", description: "Variáveis definidas pelo utilizador.",
      icon: "🎯", color: "hsl(199, 70%, 45%)", variables: customVars,
    };
    if (selectedBlock) return runScenarioForBlock(custom, selectedBlock);
    if (viewMode === "operator" && selectedOperator !== "all") return runScenarioForOperator(custom, selectedOperator);
    return runCustomScenario(customVars);
  }, [showCustom, customVars, selectedBlock, viewMode, selectedOperator]);

  const allOutputs = useMemo(() => {
    const outputs = predefinedOutputs.filter(o => selectedScenarios.includes(o.scenario.id));
    if (customOutput) outputs.push(customOutput);
    return outputs;
  }, [predefinedOutputs, selectedScenarios, customOutput]);

  // Merged projection data for comparison charts
  const comparisonData = useMemo(() => {
    if (allOutputs.length === 0) return [];
    const years = allOutputs[0].projections.map(p => p.year);
    return years.map((year, i) => {
      const row: Record<string, number> = { year };
      allOutputs.forEach(o => {
        row[`${o.scenario.id}_cf`] = o.projections[i]?.netCashFlow || 0;
        row[`${o.scenario.id}_prod`] = (o.projections[i]?.production || 0) / 1000;
        row[`${o.scenario.id}_state`] = o.projections[i]?.stateRevenue || 0;
      });
      return row;
    });
  }, [allOutputs]);

  const toggleScenario = (id: string) => {
    setSelectedScenarios(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5">
      {/* Data coverage notice */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/5 border border-warning/20">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          Os cenários utilizam <span className="font-semibold text-foreground">valores estimados de OPEX ($20/bbl)</span> para concessões sem dados económicos verificados. Os resultados são indicativos até à integração completa dos dados reais.
        </p>
      </div>
      {/* ── Scenario Selector ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cenários Económicos</h3>
          <div className="flex items-center gap-2">
            {/* View mode tabs */}
            <div className="flex items-center bg-muted/40 rounded-md p-0.5 gap-0.5">
              {([
                { mode: "national" as ViewMode, icon: "🌍", label: "Nacional" },
                { mode: "block" as ViewMode, icon: "📍", label: "Bloco" },
                { mode: "operator" as ViewMode, icon: "🏢", label: "Operador" },
              ]).map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                    viewMode === mode
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-xs">{icon}</span> {label}
                </button>
              ))}
            </div>

            {/* Block selector */}
            {viewMode === "block" && (
              <Select value={selectedBlockId} onValueChange={setSelectedBlockId}>
                <SelectTrigger className="w-56 h-8 text-xs border-border/50">
                  <SelectValue placeholder="Seleccionar concessão" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Todos os Blocos</SelectItem>
                  {producingBlocks.map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} — {(b.dailyProduction / 1000).toFixed(0)}k BOPD
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Operator selector */}
            {viewMode === "operator" && (
              <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                <SelectTrigger className="w-56 h-8 text-xs border-border/50">
                  <SelectValue placeholder="Seleccionar operador" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Todos os Operadores</SelectItem>
                  {operators.map(op => {
                    const opProd = oilBlocks.filter(b => b.operator === op && b.dailyProduction > 0).reduce((s, b) => s + b.dailyProduction, 0);
                    return (
                      <SelectItem key={op} value={op}>
                        {op} — {(opProd / 1000).toFixed(0)}k BOPD
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Context banner: block */}
        {selectedBlock && (
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">{selectedBlock.name}</span>
            <Badge variant="outline" className="text-[10px]">{selectedBlock.operator}</Badge>
            <Badge variant="outline" className="text-[10px]">{(selectedBlock.dailyProduction / 1000).toFixed(1)}k BOPD</Badge>
            <Badge variant="outline" className="text-[10px]">{selectedBlock.basin}</Badge>
          </div>
        )}

        {/* Context banner: operator */}
        {viewMode === "operator" && selectedOperator !== "all" && (
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">{selectedOperator}</span>
            <Badge variant="outline" className="text-[10px]">{operatorBlocks.length} blocos</Badge>
            <Badge variant="outline" className="text-[10px]">
              {(operatorBlocks.reduce((s, b) => s + b.dailyProduction, 0) / 1000).toFixed(1)}k BOPD
            </Badge>
            <div className="flex items-center gap-1 ml-2">
              {operatorBlocks.map(b => (
                <span key={b.id} className="text-[9px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{b.name}</span>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {PREDEFINED_SCENARIOS.map(s => {
            const output = predefinedOutputs.find(o => o.scenario.id === s.id)!;
            const active = selectedScenarios.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleScenario(s.id)}
                className={`text-left rounded-lg border p-3 transition-all ${
                  active
                    ? "border-primary/40 bg-primary/5 shadow-sm"
                    : "border-border/30 bg-card opacity-50 hover:opacity-80"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{s.icon}</span>
                  <span className={`text-lg font-bold tabular-nums ${output.npv >= 0 ? "text-success" : "text-danger"}`}>
                    {fmtUSD(output.npv)}
                  </span>
                </div>
                <div className="text-xs font-semibold text-foreground">{s.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{s.description}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-muted-foreground">IRR: {output.irr.toFixed(1)}%</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">Estado: {fmtUSDShort(output.totalStateRevenue)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KPI Comparison ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">Comparação de Indicadores por Cenário <InfoTooltip text={tooltipDescriptions["Comparação de Indicadores por Cenário"]} /></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Cenário</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">NPV</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">IRR</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Cash Flow Total</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Receita Estado</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Custo/bbl</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Payback</th>
                </tr>
              </thead>
              <tbody>
                {allOutputs.map(o => (
                  <tr key={o.scenario.id} className="border-b border-border/20 hover:bg-muted/20">
                    <td className="py-2 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: o.scenario.color }}
                      />
                      <span className="font-semibold">{o.scenario.name}</span>
                    </td>
                    <td className={`py-2 text-right tabular-nums font-bold ${o.npv >= 0 ? "text-success" : "text-danger"}`}>
                      {fmtUSDShort(o.npv)}
                    </td>
                    <td className="py-2 text-right tabular-nums">{o.irr.toFixed(1)}%</td>
                    <td className={`py-2 text-right tabular-nums ${o.totalCashFlow >= 0 ? "text-foreground" : "text-danger"}`}>
                      {fmtUSDShort(o.totalCashFlow)}
                    </td>
                    <td className="py-2 text-right tabular-nums">{fmtUSDShort(o.totalStateRevenue)}</td>
                    <td className="py-2 text-right tabular-nums">${o.avgCostPerBarrel.toFixed(1)}</td>
                    <td className="py-2 text-right tabular-nums">{o.paybackYear || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cash Flow Projection */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">Projecção de Cash Flow por Cenário <InfoTooltip text={tooltipDescriptions["Projecção de Cash Flow por Cenário"]} /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `$${v}`} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number) => [`$${v.toLocaleString()}MM`, ""]}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  {allOutputs.map(o => (
                    <Area
                      key={o.scenario.id}
                      type="monotone"
                      dataKey={`${o.scenario.id}_cf`}
                      stroke={o.scenario.color}
                      fill={o.scenario.color}
                      fillOpacity={0.08}
                      strokeWidth={2}
                      name={o.scenario.name}
                      dot={false}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Production Projection */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">Projecção de Produção (kBOPD) <InfoTooltip text={tooltipDescriptions["Projecção de Produção (kBOPD)"]} /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `${v}k`} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number) => [`${v.toFixed(0)}k BOPD`, ""]}
                  />
                  {allOutputs.map(o => (
                    <Area
                      key={o.scenario.id}
                      type="monotone"
                      dataKey={`${o.scenario.id}_prod`}
                      stroke={o.scenario.color}
                      fill={o.scenario.color}
                      fillOpacity={0.08}
                      strokeWidth={2}
                      name={o.scenario.name}
                      dot={false}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* State Revenue Comparison */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">Receita do Estado por Cenário <InfoTooltip text={tooltipDescriptions["Receita do Estado por Cenário"]} /></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `$${v}`} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}MM`, ""]}
                />
                {allOutputs.map(o => (
                  <Bar
                    key={o.scenario.id}
                    dataKey={`${o.scenario.id}_state`}
                    fill={o.scenario.color}
                    fillOpacity={0.7}
                    name={o.scenario.name}
                    barSize={6}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Operator Comparison Chart ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Comparação entre Operadores — NPV vs Receita Estado
            </CardTitle>
            <Select value={operatorCompareScenario} onValueChange={setOperatorCompareScenario}>
              <SelectTrigger className="w-52 h-8 text-xs border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {PREDEFINED_SCENARIOS.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <OperatorComparisonChart scenarioId={operatorCompareScenario} />
        </CardContent>
      </Card>
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="flex items-center justify-between w-full"
          >
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              Cenário Personalizado
            </CardTitle>
            {showCustom ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CardHeader>
        {showCustom && (
          <CardContent className="space-y-5">
            {/* Market Variables */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" /> Variáveis de Mercado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SliderControl
                  label="Preço Brent"
                  value={customVars.brentPrice}
                  min={30}
                  max={150}
                  step={1}
                  unit="$/bbl"
                  onChange={v => setCustomVars(prev => ({ ...prev, brentPrice: v }))}
                />
                <SliderControl
                  label="Taxa de Câmbio"
                  value={customVars.exchangeRate}
                  min={400}
                  max={1500}
                  step={10}
                  unit="AOA/USD"
                  onChange={v => setCustomVars(prev => ({ ...prev, exchangeRate: v }))}
                />
                <SliderControl
                  label="Inflação Operacional"
                  value={customVars.inflationRate}
                  min={0}
                  max={15}
                  step={0.5}
                  unit="%/ano"
                  onChange={v => setCustomVars(prev => ({ ...prev, inflationRate: v }))}
                />
              </div>
            </div>

            {/* Operational Variables */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3" /> Variáveis Operacionais
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SliderControl
                  label="Factor OPEX"
                  value={customVars.opexMultiplier * 100}
                  min={50}
                  max={200}
                  step={5}
                  unit="%"
                  onChange={v => setCustomVars(prev => ({ ...prev, opexMultiplier: v / 100 }))}
                />
                <SliderControl
                  label="Taxa de Declínio"
                  value={customVars.declineRate}
                  min={0}
                  max={20}
                  step={0.5}
                  unit="%/ano"
                  onChange={v => setCustomVars(prev => ({ ...prev, declineRate: v }))}
                />
                <SliderControl
                  label="Ganho de Eficiência"
                  value={customVars.efficiencyGain}
                  min={-20}
                  max={30}
                  step={1}
                  unit="%"
                  onChange={v => setCustomVars(prev => ({ ...prev, efficiencyGain: v }))}
                />
              </div>
            </div>

            {/* Fiscal Variables */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Percent className="w-3 h-3" /> Variáveis Fiscais
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SliderControl
                  label="Royalty (IPP)"
                  value={customVars.royaltyRate}
                  min={0}
                  max={40}
                  step={1}
                  unit="%"
                  onChange={v => setCustomVars(prev => ({ ...prev, royaltyRate: v }))}
                />
                <SliderControl
                  label="Imposto (IRP)"
                  value={customVars.taxRate}
                  min={0}
                  max={80}
                  step={1}
                  unit="%"
                  onChange={v => setCustomVars(prev => ({ ...prev, taxRate: v }))}
                />
                <SliderControl
                  label="Participação Estado"
                  value={customVars.stateParticipation}
                  min={0}
                  max={60}
                  step={1}
                  unit="%"
                  onChange={v => setCustomVars(prev => ({ ...prev, stateParticipation: v }))}
                />
              </div>
            </div>

            {/* Custom Output */}
            {customOutput && (
              <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">🎯</span>
                  <span className="text-xs font-bold">Resultado do Cenário Personalizado</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <OutputKPI label="NPV" value={fmtUSDShort(customOutput.npv)} positive={customOutput.npv >= 0} />
                  <OutputKPI label="IRR" value={`${customOutput.irr.toFixed(1)}%`} positive={customOutput.irr > 10} />
                  <OutputKPI label="Cash Flow Total" value={fmtUSDShort(customOutput.totalCashFlow)} positive={customOutput.totalCashFlow >= 0} />
                  <OutputKPI label="Receita Estado" value={fmtUSDShort(customOutput.totalStateRevenue)} positive />
                  <OutputKPI label="Custo/bbl" value={`$${customOutput.avgCostPerBarrel.toFixed(1)}`} positive={customOutput.avgCostPerBarrel < 40} />
                  <OutputKPI label="Payback" value={customOutput.paybackYear ? `${customOutput.paybackYear}` : "—"} positive={!!customOutput.paybackYear} />
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

// ── Sub-components ──

function SliderControl({ label, value, min, max, step, unit, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
        <span className="text-xs font-bold tabular-nums text-foreground">{value}{unit}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
}

function OperatorComparisonChart({ scenarioId }: { scenarioId: string }) {
  const scenario = PREDEFINED_SCENARIOS.find(s => s.id === scenarioId) || PREDEFINED_SCENARIOS[0];

  const data = useMemo(() => {
    return operators.map(op => {
      const output = runScenarioForOperator(scenario, op);
      const opBlocks = oilBlocks.filter(b => b.operator === op && b.dailyProduction > 0);
      const totalProd = opBlocks.reduce((s, b) => s + b.dailyProduction, 0);
      return {
        name: op.length > 14 ? op.slice(0, 12) + "…" : op,
        fullName: op,
        npv: Math.round(output.npv),
        stateRevenue: Math.round(output.totalStateRevenue),
        irr: output.irr,
        production: Math.round(totalProd / 1000),
        blocks: opBlocks.length,
      };
    }).sort((a, b) => b.npv - a.npv);
  }, [scenario]);

  const COLORS = {
    npv: "hsl(var(--primary))",
    state: "hsl(152, 50%, 38%)",
  };

  return (
    <div className="space-y-4">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              className="fill-muted-foreground"
              tickFormatter={v => {
                const abs = Math.abs(v);
                if (abs >= 1000) return `$${(v / 1000).toFixed(0)}B`;
                return `$${v}MM`;
              }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10 }}
              className="fill-muted-foreground"
              width={110}
            />
            <RechartsTooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
              }}
              formatter={(v: number, name: string) => [
                `$${Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + "B" : v.toLocaleString() + "MM"}`,
                name === "npv" ? "NPV" : "Receita Estado",
              ]}
              labelFormatter={(label) => {
                const item = data.find(d => d.name === label);
                return item ? `${item.fullName} (${item.blocks} blocos, ${item.production}k BOPD)` : label;
              }}
            />
            <Bar dataKey="npv" fill={COLORS.npv} fillOpacity={0.85} name="NPV" barSize={10} radius={[0, 3, 3, 0]} />
            <Bar dataKey="stateRevenue" fill={COLORS.state} fillOpacity={0.85} name="Receita Estado" barSize={10} radius={[0, 3, 3, 0]} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Operador</th>
              <th className="text-center py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Blocos</th>
              <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Produção</th>
              <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">NPV</th>
              <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">IRR</th>
              <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Receita Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.fullName} className="border-b border-border/20 hover:bg-muted/20">
                <td className="py-1.5 font-semibold">{d.fullName}</td>
                <td className="py-1.5 text-center">{d.blocks}</td>
                <td className="py-1.5 text-right tabular-nums">{d.production}k BOPD</td>
                <td className={`py-1.5 text-right tabular-nums font-bold ${d.npv >= 0 ? "text-success" : "text-danger"}`}>
                  {fmtUSDShort(d.npv)}
                </td>
                <td className="py-1.5 text-right tabular-nums">{d.irr.toFixed(1)}%</td>
                <td className="py-1.5 text-right tabular-nums">{fmtUSDShort(d.stateRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OutputKPI({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-bold mt-0.5 ${positive ? "text-success" : "text-danger"}`}>{value}</div>
    </div>
  );
}
