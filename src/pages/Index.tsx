import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import {
  getTotalProduction, getTotalReserves, getActiveBlocks, getTotalCapex, getAvgExecutionRate,
  oilBlocks,
} from "@/data/angolaBlocks";
import {
  Activity, BarChart3, Boxes, DollarSign, TrendingUp, Users, Plus,
  ArrowRight, ShieldCheck, FileText, Droplets, Flame, Landmark,
  AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

/* ── KPI definitions ── */
const kpis = [
  { label: "Total Concessões", value: oilBlocks.length, suffix: "", icon: Boxes, color: "text-primary" },
  { label: "Activas", value: getActiveBlocks(), suffix: "", icon: Activity, color: "text-success" },
  { label: "Operadores", value: [...new Set(oilBlocks.map(b => b.operator))].length, suffix: "", icon: Users, color: "text-warning" },
  { label: "Petróleo", value: getTotalProduction(), suffix: " BOPD", icon: Droplets, color: "text-primary" },
  { label: "Reservas Est.", value: getTotalReserves(), suffix: " Mb", icon: Flame, color: "text-anpg" },
  { label: "CAPEX Total", value: getTotalCapex(), prefix: "$", suffix: "M", icon: Landmark, color: "text-success" },
];

/* ── Quick actions ── */
const quickActions = [
  { title: "Dados de Produção", desc: "Monitorizar produção diária", icon: Activity, path: "/producao" },
  { title: "Compliance", desc: "Verificar conformidade", icon: ShieldCheck, path: "/risk" },
  { title: "Gerar Relatório", desc: "Relatórios automáticos", icon: FileText, path: "/reports" },
];

/* ── Production trend data ── */
const productionTrend = [
  { month: "Jul", value: 1180000 },
  { month: "Ago", value: 1210000 },
  { month: "Set", value: 1195000 },
  { month: "Out", value: 1250000 },
  { month: "Nov", value: 1280000 },
  { month: "Dez", value: 1304000 },
];

/* ── Compliance alerts ── */
const complianceAlerts = [
  { block: "Block 15", type: "warning", message: "Relatório ambiental pendente", date: "2024-12-28" },
  { block: "Block 17", type: "success", message: "Auditoria Q4 aprovada", date: "2024-12-25" },
  { block: "Block 0", type: "info", message: "Inspeção de segurança agendada", date: "2025-01-05" },
  { block: "Block 31", type: "warning", message: "Licença de operação expira em 30 dias", date: "2024-12-30" },
  { block: "Block 14", type: "success", message: "Compliance fiscal atualizado", date: "2024-12-22" },
];

/* ── Basin production data ── */
const basinData = [
  { name: "Bacia do Congo", value: 890 },
  { name: "Bacia do Kwanza", value: 320 },
  { name: "Bacia do Namibe", value: 94 },
];

/* ── Operator production data ── */
const operatorData = useMemoOperatorData();

function useMemoOperatorData() {
  const opMap = new Map<string, number>();
  oilBlocks.forEach(b => {
    opMap.set(b.operator, (opMap.get(b.operator) || 0) + b.dailyProduction);
  });
  return Array.from(opMap.entries())
    .map(([name, value]) => ({ name, value: Math.round(value / 1000) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const Index = () => {
  const today = new Date().toLocaleDateString("pt-AO", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1920px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Dashboard Executivo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral do sector petrolífero angolano
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs font-mono">
            <Clock className="w-3 h-3 mr-1" />
            {today}
          </Badge>
          <Button variant="anpg" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Concessão
          </Button>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.path}>
            <Card className="group hover:border-anpg/30 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-anpg/10 flex items-center justify-center shrink-0 group-hover:bg-anpg/20 transition-colors">
                  <action.icon className="w-5 h-5 text-anpg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-anpg group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {kpis.map((kpi, i) => (
          <Card
            key={kpi.label}
            className="overflow-hidden animate-counter-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {kpi.label}
                </span>
              </div>
              <AnimatedCounter
                target={kpi.value}
                prefix={kpi.prefix || ""}
                suffix={kpi.suffix}
                className={`text-2xl md:text-3xl font-bold font-mono ${kpi.color}`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Production Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Tendência de Produção (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={productionTrend}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={50} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${(v / 1000).toFixed(0)}k BOPD`, "Produção"]} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#prodGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-anpg" />
              Alertas de Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {complianceAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                {alert.type === "warning" && <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />}
                {alert.type === "success" && <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />}
                {alert.type === "info" && <Activity className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {alert.block} • {new Date(alert.date).toLocaleDateString("pt-AO")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Production by Basin */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Produção por Bacia (kBOPD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={basinData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" />
                <YAxis dataKey="name" type="category" width={130} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}k BOPD`, "Produção"]} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Production by Operator */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-anpg" />
              Produção por Operador (kBOPD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={operatorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" />
                <YAxis dataKey="name" type="category" width={130} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}k BOPD`, "Produção"]} />
                <Bar dataKey="value" fill="hsl(var(--anpg))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
