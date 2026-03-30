import { useMemo } from "react";
import type { OilBlock } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartWrapper } from "@/components/dashboard/ChartWrapper";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { tooltipDescriptions } from "@/lib/tooltipDescriptions";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Line, ComposedChart, ReferenceLine,
} from "recharts";
import {
  DollarSign, TrendingDown, AlertTriangle, Lightbulb, Anchor,
  BarChart3, PieChart as PieChartIcon, Wrench, ArrowRight, Ship,
} from "lucide-react";

const GE_COLOR = "hsl(199, 89%, 48%)";
const SNL_COLOR = "hsl(280, 65%, 60%)";
const CONC_COLOR = "hsl(152, 69%, 40%)";
const TAX_COLOR = "hsl(38, 92%, 50%)";
const CAPEX_COLOR = "hsl(199, 89%, 48%)";
const OPEX_COLOR = "hsl(38, 92%, 50%)";
const ABANDON_COLOR = "hsl(0, 72%, 51%)";
const GE_CUSTOS_COLOR = "hsl(199, 89%, 48%)";
const GE_LUCROS_COLOR = "hsl(152, 69%, 40%)";

const PLAN_COLORS = [
  "hsl(199, 89%, 48%)",
  "hsl(152, 69%, 40%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(0, 72%, 51%)",
];

const PIE_COLORS = [GE_COLOR, TAX_COLOR];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

interface Props {
  block: OilBlock;
}

/* ─── NPV Individual Chart ─── */
const NpvPeriodChart = ({ data }: { data: { period: string; ge: number; impostos: number; conc?: number } }) => {
  const bars = [
    { label: "GE", value: data.ge },
    { label: "Impostos", value: data.impostos },
  ];
  if (data.conc != null) bars.splice(1, 0, { label: "Conc.", value: data.conc });

  return (
    <ChartWrapper title={`NPV ${data.period} (MMUSD)`} icon={<DollarSign className="w-4 h-4 text-primary" />} height={220}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => v.toLocaleString()} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {bars.map((b, i) => (
              <Cell key={i} fill={b.label === "GE" ? GE_COLOR : b.label === "Conc." ? CONC_COLOR : TAX_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

/* ─── Revenue Share Period with GE Split ─── */
const RevenueShareCard = ({ rs }: { rs: NonNullable<OilBlock["economicVision"]>["revenueShare"][number] }) => {
  const hasGeSplit = rs.geCustosPercent != null && rs.geLucrosPercent != null;

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{rs.period}</p>
      <div className="flex items-center gap-2">
        {/* Main pie: GE vs Impostos */}
        <ResponsiveContainer width={150} height={170}>
          <PieChart>
            <Pie
              data={[
                { name: "GE", value: rs.gePercent },
                { name: "Impostos", value: rs.impostosPercent },
              ]}
              cx="50%" cy="50%" innerRadius={32} outerRadius={56} paddingAngle={2} dataKey="value"
              label={({ value, cx, cy, midAngle, outerRadius }) => {
                const RADIAN = Math.PI / 180;
                const radius = (outerRadius as number) + 16;
                const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
                const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);
                return <text x={x} y={y} textAnchor={x > (cx as number) ? "start" : "end"} dominantBaseline="central" fontSize={12} fontWeight={700} fill="hsl(var(--foreground))">{value}%</text>;
              }}
              labelLine={{ strokeWidth: 1, stroke: "hsl(var(--muted-foreground))" }}
            >
              {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>

        {/* Mini pie: GE Custos vs GE Lucros */}
        {hasGeSplit && (
          <ResponsiveContainer width={120} height={140}>
            <PieChart>
              <Pie
                data={[
                  { name: "GE Custos", value: rs.geCustosPercent! },
                  { name: "GE Lucros", value: rs.geLucrosPercent! },
                ]}
                cx="50%" cy="50%" innerRadius={22} outerRadius={42} paddingAngle={2} dataKey="value"
                label={({ value, cx, cy, midAngle, outerRadius }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = (outerRadius as number) + 14;
                  const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
                  const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);
                  return <text x={x} y={y} textAnchor={x > (cx as number) ? "start" : "end"} dominantBaseline="central" fontSize={10} fontWeight={600} fill="hsl(var(--foreground))">{value}%</text>;
                }}
                labelLine={{ strokeWidth: 1, stroke: "hsl(var(--muted-foreground))" }}
              >
                <Cell fill={GE_CUSTOS_COLOR} />
                <Cell fill={GE_LUCROS_COLOR} />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Labels + values */}
      <div className="flex flex-col gap-1 text-[10px] text-muted-foreground mt-1 text-center">
        {rs.liftingLabel && (
          <Badge variant="outline" className="text-[10px] mx-auto">{rs.liftingLabel}: {rs.geMMBO.toLocaleString()} MMBO</Badge>
        )}
        <div className="flex gap-3 justify-center">
          <span>GE: <strong>{rs.geMMBO.toLocaleString()} MMBO</strong></span>
          <span>Imp: <strong>{rs.impostosMMBO.toLocaleString()} MMBO</strong></span>
        </div>
        {rs.geMMUSD != null && (
          <div className="flex gap-3 justify-center">
            <span>GE: <strong>{rs.geMMUSD.toLocaleString()} MMUSD</strong></span>
            <span>Imp: <strong>{rs.impostosMMUSD?.toLocaleString()} MMUSD</strong></span>
          </div>
        )}
        {hasGeSplit && (
          <div className="flex gap-3 justify-center text-[9px]">
            <span>GE Custos: <strong>{rs.geCustosMMUSD?.toLocaleString()}</strong></span>
            <span>GE Lucros: <strong>{rs.geLucrosMMUSD?.toLocaleString()}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};

export const EconomicVisionTab = ({ block }: Props) => {
  const ev = block.economicVision;
  const ed = block.economicData;

  if (!ev && !ed) {
    return (
      <Card className="glass-card p-8 text-center">
        <p className="text-muted-foreground">Dados de visão económica não disponíveis para este bloco.</p>
      </Card>
    );
  }

  const npvByPeriod = ev?.npvByPeriod ?? [];
  const cashFlow = ev?.cashFlowTimeSeries ?? [];
  const revenueShare = ev?.revenueShare ?? [];
  const costHistory = ed?.costHistory ?? [];
  const investmentPlan = ed?.investmentPlan ?? [];
  const productionShare = ed?.productionShareGE ?? [];
  const abandonDetail = ev?.abandonmentDetail;
  const techCost = ev?.technicalCost;
  const liftingsAcc = ev?.liftingsAccumulated;
  const liftingsForecast = ev?.liftingsForecast ?? [];
  const liftingsObs = ev?.liftingsObservations ?? [];

  const observations = [
    ...(ev?.strategicObservations ?? []),
    ...(ed?.observations ?? []),
  ];
  const uniqueObs = [...new Set(observations)];

  const totalShareMMBO = parseFloat(productionShare.reduce((s, p) => s + p.mmbo, 0).toFixed(3));

  const abandonBars = abandonDetail
    ? [
        { label: "Total para Abandono", value: abandonDetail.total },
        { label: "Abandono Pontual", value: abandonDetail.pontual },
        { label: "Valor para Fundeamento", value: abandonDetail.fundeamento },
        { label: "Valor Fundeado", value: abandonDetail.fundeado },
        { label: "Dívida Sonangol", value: abandonDetail.dividaSonangol },
      ]
    : [];

  const hasGeSplit = revenueShare.some(rs => rs.geCustosPercent != null);

  return (
    <div className="space-y-4 2xl:space-y-6">
      {/* Row 1: NPV by Period (individual charts) + Observations */}
      {(npvByPeriod.length > 0 || uniqueObs.length > 0) && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 2xl:gap-6">
          {npvByPeriod.map((d, i) => (
            <NpvPeriodChart key={i} data={d} />
          ))}
          {uniqueObs.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  Principais Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ul className="space-y-2">
                  {uniqueObs.map((obs, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs 2xl:text-sm text-muted-foreground">
                      <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Row 2: Cash Flow */}
      {cashFlow.length > 0 && (
        <ChartWrapper title="Fluxo de Caixa (MMUSD)" icon={<BarChart3 className="w-4 h-4 text-primary" />} height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlow} barGap={0} barCategoryGap="10%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toLocaleString()} MMUSD`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Bar dataKey="impostos" name="Impostos" stackId="a" fill={TAX_COLOR} />
              {cashFlow.some(d => d.conc != null) && (
                <Bar dataKey="conc" name="Concessionária" stackId="a" fill={CONC_COLOR} />
              )}
              <Bar dataKey="ge" name="GE" stackId="a" fill={GE_COLOR} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

      {/* Row 3: Revenue Share Pie Charts with GE Split */}
      {revenueShare.length > 0 && (
        <ChartWrapper title="Repartição de Receitas (MMUSD & MMBO)" icon={<PieChartIcon className="w-4 h-4 text-primary" />} height="auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revenueShare.map((rs) => (
              <RevenueShareCard key={rs.period} rs={rs} />
            ))}
            <div className="col-span-full flex items-center justify-center gap-5 pt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: GE_COLOR }} />
                <span className="text-xs text-muted-foreground font-medium">GE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: TAX_COLOR }} />
                <span className="text-xs text-muted-foreground font-medium">Impostos</span>
              </div>
              {hasGeSplit && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: GE_CUSTOS_COLOR }} />
                    <span className="text-xs text-muted-foreground font-medium">GE Custos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: GE_LUCROS_COLOR }} />
                    <span className="text-xs text-muted-foreground font-medium">GE Lucros</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </ChartWrapper>
      )}

      {/* Row 4: Costs + Technical Cost + Abandonment */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 2xl:gap-6">
        {costHistory.length > 0 && (
          <ChartWrapper title="Custos Incorridos e Previsão (MMUSD)" icon={<Wrench className="w-4 h-4 text-warning" />} height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toLocaleString()} MMUSD`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="capex" name="CAPEX" stackId="a" fill={CAPEX_COLOR} />
                <Bar dataKey="opex" name="OPEX" stackId="a" fill={OPEX_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}

        {techCost && (
          <Card className="glass-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-warning" />
                Custo Técnico (USD/BO)
                {tooltipDescriptions["Custo Técnico (USD/BO)"] && <InfoTooltip text={tooltipDescriptions["Custo Técnico (USD/BO)"]} />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>CAPEX/BO</span>
                    <span className="font-mono font-semibold text-foreground">${techCost.capexPerBarrel.toFixed(1)}</span>
                  </div>
                  <div className="h-4 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(techCost.capexPerBarrel / (techCost.capexPerBarrel + techCost.opexPerBarrel)) * 100}%`, background: CAPEX_COLOR }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>OPEX/BO</span>
                    <span className="font-mono font-semibold text-foreground">${techCost.opexPerBarrel.toFixed(1)}</span>
                  </div>
                  <div className="h-4 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(techCost.opexPerBarrel / (techCost.capexPerBarrel + techCost.opexPerBarrel)) * 100}%`, background: OPEX_COLOR }} />
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Custo Total/BO</span>
                  <span className="font-mono font-bold text-lg text-foreground">${(techCost.capexPerBarrel + techCost.opexPerBarrel).toFixed(1)}</span>
                </div>
              </div>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Opex 2025</p>
                    <p className="text-lg font-mono font-bold text-warning">${techCost.opex2025.toFixed(1)}/BO</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {abandonBars.length > 0 && (
          <ChartWrapper title="Custos de Abandono (MMUSD)" icon={<Anchor className="w-4 h-4 text-destructive" />} height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={abandonBars} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={130} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toLocaleString()} MMUSD`} />
                <Bar dataKey="value" fill={ABANDON_COLOR} radius={[0, 4, 4, 0]} barSize={20}>
                  {abandonBars.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? ABANDON_COLOR : `hsl(0, 72%, ${51 + i * 8}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </div>

      {/* Row 4b: Abandonment Notes Panel */}
      {abandonDetail?.notes && abandonDetail.notes.length > 0 && (
        <Card className="glass-card border-destructive/20">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
              <Anchor className="w-4 h-4 text-destructive" />
              Detalhe de Abandono — Notas e Obrigações
              {abandonDetail.nextPAPRSubmission && (
                <Badge variant="outline" className="ml-auto text-[10px] border-warning/40 text-warning">
                  Próximo PAPR: {abandonDetail.nextPAPRSubmission}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {abandonDetail.notes.map((note, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Conta de Garantia</span>
                  <span className="font-mono font-bold text-sm">{abandonDetail.fundeamento.toLocaleString()} MMUSD</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Abandonos Pontuais</span>
                  <span className="font-mono font-bold text-sm">{abandonDetail.pontual.toLocaleString()} MMUSD</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Valor Fundeado</span>
                  <span className="font-mono font-bold text-sm text-warning">{abandonDetail.fundeado.toLocaleString()} MMUSD</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <span className="text-xs font-medium">Dívida Sonangol {abandonDetail.dividaSonangolSince && `(desde ${abandonDetail.dividaSonangolSince})`}</span>
                  <span className="font-mono font-bold text-sm text-destructive">{abandonDetail.dividaSonangol.toLocaleString()} MMUSD</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Row 5: Investment Plan + Production Share */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 2xl:gap-6">
        {investmentPlan.length > 0 && (
          <ChartWrapper title="Plano de Investimentos Quinquenal (MMUSD)" icon={<BarChart3 className="w-4 h-4 text-primary" />} height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={investmentPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toLocaleString()} MMUSD`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="exploracao" name="Exploração" stackId="a" fill={PLAN_COLORS[0]} />
                <Bar dataKey="desenvolvimento" name="Desenvolvimento" stackId="a" fill={PLAN_COLORS[1]} />
                <Bar dataKey="operacao" name="Operação" stackId="a" fill={PLAN_COLORS[2]} radius={[4, 4, 0, 0]} />
                {investmentPlan[0]?.adminServicos !== undefined && (
                  <Bar dataKey="adminServicos" name="Admin & Serviços" stackId="a" fill={PLAN_COLORS[3]} />
                )}
                {investmentPlan[0]?.cashCallSonangol !== undefined && (
                  <Line type="monotone" dataKey="cashCallSonangol" name="Cash Call Sonangol" stroke={PLAN_COLORS[4]} strokeWidth={2} dot={{ r: 3 }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}

        {productionShare.length > 0 && (
          <ChartWrapper title="Partilha de Produção GE (MMBO)" icon={<BarChart3 className="w-4 h-4 text-success" />} height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionShare}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v} MMBO`} />
                <Bar dataKey="mmbo" name="MMBO" fill={GE_COLOR} radius={[4, 4, 0, 0]}>
                  {productionShare.map((_, i) => (
                    <Cell key={i} fill={GE_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </div>

      {productionShare.length > 0 && (
        <div className="flex justify-end -mt-2">
          <Badge variant="outline" className="text-xs font-mono">
            Total GE: {totalShareMMBO} MMBO ({productionShare[0]?.year}–{productionShare[productionShare.length - 1]?.year})
          </Badge>
        </div>
      )}

      {/* Row 6: Liftings */}
      {(liftingsAcc || liftingsForecast.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2">
            <Ship className="w-4 h-4 text-primary" />
            Realização e Previsão de Levantamentos
          </h3>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 2xl:gap-6">
            {/* Accumulated liftings bar chart */}
            {liftingsAcc && (
              <ChartWrapper title="Levantamentos Acumulados (1988-2025)" icon={<BarChart3 className="w-4 h-4 text-primary" />} height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { label: "GE (59%)", value: liftingsAcc.geMMBO },
                    { label: "SNL E.P. (41%)", value: liftingsAcc.snlMMBO },
                  ]} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toLocaleString()} MMBO`} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      <Cell fill={GE_COLOR} />
                      <Cell fill={SNL_COLOR} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrapper>
            )}

            {/* Forecast chart */}
            {liftingsForecast.length > 0 && (
              <ChartWrapper title="Previsão de Levantamentos (2026-2050)" icon={<BarChart3 className="w-4 h-4 text-primary" />} height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={liftingsForecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={4} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar yAxisId="left" dataKey="snlEPMMBO" name="SNL E.P. (MMBO)" stackId="a" fill={SNL_COLOR} />
                    <Bar yAxisId="left" dataKey="geMMBO" name="GE (MMBO)" stackId="a" fill={GE_COLOR} radius={[2, 2, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="receitaGE" name="Receita GE (MMUSD)" stroke={GE_COLOR} strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartWrapper>
            )}

            {/* Observations */}
            {(liftingsObs.length > 0 || liftingsAcc) && (
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-warning" />
                    Indicadores de Levantamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {liftingsAcc && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                        <span className="text-xs text-muted-foreground">Total Levantado</span>
                        <span className="font-mono font-bold text-sm">{liftingsAcc.totalMMBO.toLocaleString()} MMBO</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                        <span className="text-xs text-muted-foreground">Reservas Totais</span>
                        <span className="font-mono font-bold text-sm">{liftingsAcc.totalReservesMMBO.toLocaleString()} MMBO</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-primary/10 border border-primary/20">
                        <span className="text-xs font-medium">% Levantado</span>
                        <span className="font-mono font-bold text-lg text-primary">{liftingsAcc.percentLifted}%</span>
                      </div>
                    </div>
                  )}
                  {liftingsObs.map((obs, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{obs}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
