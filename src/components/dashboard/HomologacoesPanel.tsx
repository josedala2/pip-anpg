import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { homologacoesData, type Homologacao } from "@/data/homologacoesData";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  DollarSign, FileText, TrendingUp, Building2, Users, Search,
  Filter, ChevronDown, ChevronRight, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = [
  "hsl(199, 89%, 48%)", "hsl(152, 69%, 40%)", "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)", "hsl(170, 60%, 45%)",
  "hsl(220, 70%, 55%)", "hsl(340, 65%, 50%)", "hsl(45, 80%, 50%)",
  "hsl(120, 50%, 40%)",
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const fmt = (v: number) => {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

const fmtFull = (v: number) => `$${v.toLocaleString("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

interface Props {
  filterBloco?: string;
}

export const HomologacoesPanel = ({ filterBloco }: Props) => {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [mesFilter, setMesFilter] = useState<string>("all");
  const [modalidadeFilter, setModalidadeFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [expandedBloco, setExpandedBloco] = useState<string | null>(null);

  // Map block names from angolaBlocks format ("Block 0 (Área A, B)") to homologações format ("Bloco 0")
  const matchBloco = (blocoData: string, filterName: string): boolean => {
    // Extract block identifier: "Block 0 (Área A, B)" → "0", "Bloco 0" → "0"
    const extractId = (name: string) => {
      const m = name.match(/Bloc[ko]\s+(.+?)(?:\s*\(|$)/i);
      return m ? m[1].trim() : name;
    };
    return extractId(blocoData) === extractId(filterName);
  };

  const data = useMemo(() => {
    let d = filterBloco
      ? homologacoesData.filter(h => matchBloco(h.bloco, filterBloco))
      : homologacoesData;
    if (yearFilter !== "all") d = d.filter(h => h.ano === Number(yearFilter));
    if (mesFilter !== "all") d = d.filter(h => h.mes === mesFilter);
    if (modalidadeFilter !== "all") d = d.filter(h => h.modalidade === modalidadeFilter);
    if (ownerFilter !== "all") d = d.filter(h => h.owner === ownerFilter);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      d = d.filter(h =>
        h.fornecedor?.toLowerCase().includes(q) ||
        h.servicos?.toLowerCase().includes(q) ||
        h.bloco?.toLowerCase().includes(q)
      );
    }
    return d;
  }, [filterBloco, yearFilter, mesFilter, modalidadeFilter, ownerFilter, searchText]);

  // KPIs
  const totalSolicitado = data.reduce((s, h) => s + h.montanteSolicitado, 0);
  const totalAprovado = data.reduce((s, h) => s + h.montanteAprovado, 0);
  const taxaAprovacao = totalSolicitado > 0 ? (totalAprovado / totalSolicitado) * 100 : 0;
  const nProcessos = data.length;
  const aprovados = data.filter(h => h.decisao === "Aprovado").length;

  // Categories
  const totalExploracao = data.reduce((s, h) => s + h.exploracao, 0);
  const totalDesenvolvimento = data.reduce((s, h) => s + h.desenvolvimento, 0);
  const totalOperacao = data.reduce((s, h) => s + h.operacao, 0);
  const totalAS = data.reduce((s, h) => s + h.as_, 0);

  // By Bloco (top 10)
  const byBloco = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(h => map.set(h.bloco, (map.get(h.bloco) || 0) + h.montanteAprovado));
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([bloco, valor]) => ({ bloco, valor }));
  }, [data]);

  // By Fornecedor (top 10)
  const byFornecedor = useMemo(() => {
    const map = new Map<string, { valor: number; count: number }>();
    data.forEach(h => {
      const f = h.fornecedor || "N/D";
      const prev = map.get(f) || { valor: 0, count: 0 };
      map.set(f, { valor: prev.valor + h.montanteAprovado, count: prev.count + 1 });
    });
    return [...map.entries()]
      .sort((a, b) => b[1].valor - a[1].valor)
      .slice(0, 10)
      .map(([nome, { valor, count }]) => ({ nome: nome.length > 30 ? nome.slice(0, 28) + "…" : nome, nomeCompleto: nome, valor, count }));
  }, [data]);

  // Monthly evolution
  const monthly = useMemo(() => {
    const mesOrder = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const map = new Map<string, number>();
    data.forEach(h => {
      const key = `${h.mes}`;
      map.set(key, (map.get(key) || 0) + h.montanteAprovado);
    });
    return mesOrder.filter(m => map.has(m)).map(m => ({ mes: m.slice(0, 3), valor: map.get(m) || 0 }));
  }, [data]);

  // Year-over-year comparison by month
  const yearComparison = useMemo(() => {
    const mesOrder = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const allData = filterBloco ? homologacoesData.filter(h => matchBloco(h.bloco, filterBloco)) : homologacoesData;
    const map2024 = new Map<string, { valor: number; count: number }>();
    const map2025 = new Map<string, { valor: number; count: number }>();
    allData.forEach(h => {
      const map = h.ano === 2024 ? map2024 : map2025;
      const prev = map.get(h.mes) || { valor: 0, count: 0 };
      map.set(h.mes, { valor: prev.valor + h.montanteAprovado, count: prev.count + 1 });
    });
    return mesOrder
      .filter(m => map2024.has(m) || map2025.has(m))
      .map(m => ({
        mes: m.slice(0, 3),
        "2024": map2024.get(m)?.valor || 0,
        "2025": map2025.get(m)?.valor || 0,
        count2024: map2024.get(m)?.count || 0,
        count2025: map2025.get(m)?.count || 0,
      }));
  }, [filterBloco]);

  // YoY totals
  const yoyTotals = useMemo(() => {
    const allData = filterBloco ? homologacoesData.filter(h => h.bloco === filterBloco) : homologacoesData;
    const t24 = allData.filter(h => h.ano === 2024).reduce((s, h) => s + h.montanteAprovado, 0);
    const t25 = allData.filter(h => h.ano === 2025).reduce((s, h) => s + h.montanteAprovado, 0);
    const n24 = allData.filter(h => h.ano === 2024).length;
    const n25 = allData.filter(h => h.ano === 2025).length;
    const variation = t24 > 0 ? ((t25 - t24) / t24) * 100 : 0;
    return { t24, t25, n24, n25, variation };
  }, [filterBloco]);

  // Category donut
  const categoryData = [
    { name: "Exploração", value: totalExploracao },
    { name: "Desenvolvimento", value: totalDesenvolvimento },
    { name: "Operação", value: totalOperacao },
    { name: "A&S", value: totalAS },
  ].filter(c => c.value > 0);

  // Local content classification
  const localContent = useMemo(() => {
    const intlKeywords = [
      "baker hughes", "schlumberger", "halliburton", "weatherford", "onesubsea",
      "technipfmc", "saipem", "subsea 7", "aker solutions", "sbm offshore",
      "maersk", "fugro", "kongsberg", "emerson", "cameron", "cecon",
      "liebherr", "jeumont", "man energy", "mtu maintenance", "nuovo pignone",
      "pgs", "framo", "advanced mechatronics", "h. butting", "clariant",
      "3t oil", "geofizyka", "dof", "bourbon", "seabulk", "tidewater",
      "shelf drilling", "valaris", "ensco", "diamond offshore", "noble",
      "champion x", "cladtek", "cetco", "intech", "bently nevada",
      "mrc global", "dnow", "nov uk", "oil spill response", "international sos",
      "mckinsey", "graham manufacturing", "airpack", "measurement solutions",
      "euronav", "grupo antonini", "telford", "dhl global", "excellence logging",
    ];
    const angolaKeywords = [
      "angola", "lda", "limitada", " s.a", "cabinda", "luanda", "sonamer",
      "sonamet", "sonangol", "kwanda", "sonepral", "enagol", "angolan",
      "asco", "aes", "bestfly", "friburge", "equador", "global catering",
      "newrest", "atlantic services", "atlantic facilities", "atlantic logistic",
      "magnitika", "luajardim", "nilmiguel", "novagest", "nossa seguros",
      "global seguros", "fidelidade", "fortaleza seguros", "ensa",
      "nasa comercial", "ncr angola", "nf clean", "clear angola",
      "internet technologies", "isistel", "ms telcom", "cosal",
      "organizações mgp", "petrowork", "certex", "basetek", "imovias",
      "emcica", "capgest", "kaeso", "kloten", "greenford",
    ];

    const classify = (name: string): "angolano" | "internacional" | "consórcio" => {
      const lower = name.toLowerCase();
      const hasIntl = intlKeywords.some(k => lower.includes(k));
      const hasAngola = angolaKeywords.some(k => lower.includes(k));
      if (lower.startsWith("consórcio") || lower.includes("/")) {
        return "consórcio";
      }
      if (hasAngola && !hasIntl) return "angolano";
      if (hasIntl && !hasAngola) return "internacional";
      if (hasAngola) return "consórcio"; // mixed = consortium
      return "internacional";
    };

    let angolanoCount = 0, intlCount = 0, consorcioCount = 0;
    let angolanoValor = 0, intlValor = 0, consorcioValor = 0;
    const fornecedorClassMap = new Map<string, "angolano" | "internacional" | "consórcio">();

    data.forEach(h => {
      const f = h.fornecedor || "N/D";
      if (!fornecedorClassMap.has(f)) {
        fornecedorClassMap.set(f, classify(f));
      }
      const cls = fornecedorClassMap.get(f)!;
      if (cls === "angolano") { angolanoCount++; angolanoValor += h.montanteAprovado; }
      else if (cls === "internacional") { intlCount++; intlValor += h.montanteAprovado; }
      else { consorcioCount++; consorcioValor += h.montanteAprovado; }
    });

    const total = angolanoCount + intlCount + consorcioCount;
    const totalValor = angolanoValor + intlValor + consorcioValor;
    const uniqueFornecedores = [...fornecedorClassMap.entries()];
    const uniqueAngolano = uniqueFornecedores.filter(([_, c]) => c === "angolano").length;
    const uniqueIntl = uniqueFornecedores.filter(([_, c]) => c === "internacional").length;
    const uniqueConsorcio = uniqueFornecedores.filter(([_, c]) => c === "consórcio").length;

    return {
      angolanoCount, intlCount, consorcioCount,
      angolanoValor, intlValor, consorcioValor,
      total, totalValor,
      uniqueAngolano, uniqueIntl, uniqueConsorcio,
      pctAngolanoProcessos: total > 0 ? (angolanoCount / total) * 100 : 0,
      pctIntlProcessos: total > 0 ? (intlCount / total) * 100 : 0,
      pctConsorcioProcessos: total > 0 ? (consorcioCount / total) * 100 : 0,
      pctAngolanoValor: totalValor > 0 ? (angolanoValor / totalValor) * 100 : 0,
      pctIntlValor: totalValor > 0 ? (intlValor / totalValor) * 100 : 0,
      pctConsorcioValor: totalValor > 0 ? (consorcioValor / totalValor) * 100 : 0,
      pieData: [
        { name: "Angolano", value: angolanoValor },
        { name: "Internacional", value: intlValor },
        { name: "Consórcio Misto", value: consorcioValor },
      ].filter(d => d.value > 0),
    };
  }, [data]);

  // By modalidade
  const byModalidade = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(h => map.set(h.modalidade || "N/D", (map.get(h.modalidade || "N/D") || 0) + h.montanteAprovado));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [data]);

  // By regime
  const byRegime = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(h => map.set(h.regimeServico || "N/D", (map.get(h.regimeServico || "N/D") || 0) + h.montanteAprovado));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [data]);

  // By entidade
  const byEntidade = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(h => map.set(h.tipoEntidade || "N/D", (map.get(h.tipoEntidade || "N/D") || 0) + h.montanteAprovado));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [data]);

  // Owner split
  const ownerSplit = useMemo(() => {
    const map = new Map<string, { count: number; valor: number }>();
    data.forEach(h => {
      const o = h.owner || "N/D";
      const prev = map.get(o) || { count: 0, valor: 0 };
      map.set(o, { count: prev.count + 1, valor: prev.valor + h.montanteAprovado });
    });
    return [...map.entries()].map(([name, { count, valor }]) => ({ name, count, valor }));
  }, [data]);

  // Bloco summary for tab 2
  const blocoSummary = useMemo(() => {
    const map = new Map<string, { count: number; solicitado: number; aprovado: number }>();
    data.forEach(h => {
      const prev = map.get(h.bloco) || { count: 0, solicitado: 0, aprovado: 0 };
      map.set(h.bloco, {
        count: prev.count + 1,
        solicitado: prev.solicitado + h.montanteSolicitado,
        aprovado: prev.aprovado + h.montanteAprovado,
      });
    });
    return [...map.entries()]
      .map(([bloco, stats]) => ({ bloco, ...stats, taxa: stats.solicitado > 0 ? (stats.aprovado / stats.solicitado) * 100 : 0 }))
      .sort((a, b) => b.aprovado - a.aprovado);
  }, [data]);

  const uniqueYears = [...new Set(homologacoesData.map(h => h.ano))].sort();
  const uniqueMeses = [...new Set(homologacoesData.map(h => h.mes))];
  const uniqueModalidades = [...new Set(homologacoesData.map(h => h.modalidade).filter(Boolean))] as string[];
  const uniqueOwners = [...new Set(homologacoesData.map(h => h.owner).filter(Boolean))] as string[];

  const exportCsv = () => {
    const headers = ["Mês", "Ano", "Bloco", "Fornecedor", "Serviços", "Tipo Processo", "Montante Solicitado", "Montante Aprovado", "Modalidade", "Owner", "Decisão"];
    const rows = data.map(h => [h.mes, h.ano, h.bloco, h.fornecedor, h.servicos, h.tipoProcesso, h.montanteSolicitado, h.montanteAprovado, h.modalidade, h.owner, h.decisao].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "homologacoes.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      {!filterBloco && (
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar fornecedor, serviço, bloco..." value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-9 text-xs"><SelectValue placeholder="Ano" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {uniqueYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={mesFilter} onValueChange={setMesFilter}>
            <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="Mês" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {uniqueMeses.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={modalidadeFilter} onValueChange={setModalidadeFilter}>
            <SelectTrigger className="w-44 h-9 text-xs"><SelectValue placeholder="Modalidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniqueModalidades.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-28 h-9 text-xs"><SelectValue placeholder="Owner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {uniqueOwners.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <Tabs defaultValue="dashboard" className="space-y-4">
        {!filterBloco && (
          <TabsList className="glass-card p-1 h-auto flex-wrap">
            <TabsTrigger value="dashboard" className="gap-1.5 text-xs"><TrendingUp className="w-3.5 h-3.5" />Dashboard Executivo</TabsTrigger>
            <TabsTrigger value="blocos" className="gap-1.5 text-xs"><Building2 className="w-3.5 h-3.5" />Por Bloco</TabsTrigger>
            <TabsTrigger value="fornecedores" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />Fornecedores & Contratação</TabsTrigger>
            <TabsTrigger value="tabela" className="gap-1.5 text-xs"><FileText className="w-3.5 h-3.5" />Tabela Detalhada</TabsTrigger>
          </TabsList>
        )}

        {/* TAB 1: Dashboard Executivo */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-success" /><span className="text-[10px] text-muted-foreground">Total Aprovado</span></div>
                <div className="text-lg font-bold font-mono">{fmt(totalAprovado)}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><FileText className="w-4 h-4 text-primary" /><span className="text-[10px] text-muted-foreground">Nº Processos</span></div>
                <div className="text-lg font-bold font-mono">{nProcessos}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-warning" /><span className="text-[10px] text-muted-foreground">Taxa Aprovação</span></div>
                <div className="text-lg font-bold font-mono">{taxaAprovacao.toFixed(1)}%</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><Building2 className="w-4 h-4 text-primary" /><span className="text-[10px] text-muted-foreground">Top Bloco</span></div>
                <div className="text-sm font-bold truncate">{byBloco[0]?.bloco || "—"}</div>
                <div className="text-[10px] text-muted-foreground">{byBloco[0] ? fmt(byBloco[0].valor) : ""}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-success" /><span className="text-[10px] text-muted-foreground">Top Fornecedor</span></div>
                <div className="text-xs font-bold truncate">{byFornecedor[0]?.nomeCompleto || "—"}</div>
                <div className="text-[10px] text-muted-foreground">{byFornecedor[0] ? fmt(byFornecedor[0].valor) : ""}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><Filter className="w-4 h-4 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Split CA / ADM</span></div>
                <div className="text-xs font-bold">
                  {ownerSplit.map(o => <span key={o.name} className="mr-2">{o.name}: {o.count}</span>)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By Bloco */}
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Montante Aprovado por Bloco (Top 10)</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byBloco} layout="vertical" margin={{ left: 80, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" tickFormatter={v => fmt(v)} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis type="category" dataKey="bloco" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={75} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtFull(v)} />
                    <Bar dataKey="valor" fill="hsl(199, 89%, 48%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category donut */}
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Repartição por Categoria</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtFull(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Fornecedores */}
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Top 10 Fornecedores por Montante</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byFornecedor} layout="vertical" margin={{ left: 120, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" tickFormatter={v => fmt(v)} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis type="category" dataKey="nome" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={115} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtFull(v)} />
                    <Bar dataKey="valor" fill="hsl(152, 69%, 40%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly evolution */}
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Evolução Mensal</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtFull(v)} />
                    <Line type="monotone" dataKey="valor" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts row 3: Year-over-Year */}
          <Card className="glass-card">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Comparativo Ano-a-Ano — 2024 vs 2025</CardTitle>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ background: "hsl(199, 89%, 48%)" }} />
                    <span className="text-muted-foreground">2024: {fmt(yoyTotals.t24)} ({yoyTotals.n24} proc.)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ background: "hsl(152, 69%, 40%)" }} />
                    <span className="text-muted-foreground">2025: {fmt(yoyTotals.t25)} ({yoyTotals.n25} proc.)</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${yoyTotals.variation >= 0 ? "text-success border-success/30" : "text-danger border-danger/30"}`}>
                    {yoyTotals.variation >= 0 ? "+" : ""}{yoyTotals.variation.toFixed(1)}% YoY
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={yearComparison} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number, name: string) => [fmtFull(v), name]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="2024" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="2025" fill="hsl(152, 69%, 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Charts row 4: Local Content */}
          <Card className="glass-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                🇦🇴 Indicadores de Conteúdo Local
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="text-[10px] text-muted-foreground mb-1">Fornecedores Angolanos</div>
                  <div className="text-lg font-bold text-success">{localContent.uniqueAngolano}</div>
                  <div className="text-[10px] text-muted-foreground">{localContent.angolanoCount} processos · {localContent.pctAngolanoProcessos.toFixed(1)}%</div>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-[10px] text-muted-foreground mb-1">Fornecedores Internacionais</div>
                  <div className="text-lg font-bold text-primary">{localContent.uniqueIntl}</div>
                  <div className="text-[10px] text-muted-foreground">{localContent.intlCount} processos · {localContent.pctIntlProcessos.toFixed(1)}%</div>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="text-[10px] text-muted-foreground mb-1">Consórcios Mistos</div>
                  <div className="text-lg font-bold text-warning">{localContent.uniqueConsorcio}</div>
                  <div className="text-[10px] text-muted-foreground">{localContent.consorcioCount} processos · {localContent.pctConsorcioProcessos.toFixed(1)}%</div>
                </div>
                <div className="p-3 rounded-lg bg-accent border border-border">
                  <div className="text-[10px] text-muted-foreground mb-1">% Conteúdo Local (Valor)</div>
                  <div className="text-lg font-bold">{localContent.pctAngolanoValor.toFixed(1)}%</div>
                  <div className="text-[10px] text-muted-foreground">{fmt(localContent.angolanoValor)} de {fmt(localContent.totalValor)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Stacked progress bars */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">Repartição por Nº de Processos</div>
                  <div className="flex h-6 rounded-full overflow-hidden">
                    <div className="bg-success flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${localContent.pctAngolanoProcessos}%` }}>
                      {localContent.pctAngolanoProcessos > 8 ? `${localContent.pctAngolanoProcessos.toFixed(0)}%` : ""}
                    </div>
                    <div className="bg-primary flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${localContent.pctIntlProcessos}%` }}>
                      {localContent.pctIntlProcessos > 8 ? `${localContent.pctIntlProcessos.toFixed(0)}%` : ""}
                    </div>
                    <div className="bg-warning flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${localContent.pctConsorcioProcessos}%` }}>
                      {localContent.pctConsorcioProcessos > 8 ? `${localContent.pctConsorcioProcessos.toFixed(0)}%` : ""}
                    </div>
                  </div>

                  <div className="text-xs font-medium text-muted-foreground mt-4">Repartição por Montante Aprovado</div>
                  <div className="flex h-6 rounded-full overflow-hidden">
                    <div className="bg-success flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${localContent.pctAngolanoValor}%` }}>
                      {localContent.pctAngolanoValor > 8 ? `${localContent.pctAngolanoValor.toFixed(0)}%` : ""}
                    </div>
                    <div className="bg-primary flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${localContent.pctIntlValor}%` }}>
                      {localContent.pctIntlValor > 8 ? `${localContent.pctIntlValor.toFixed(0)}%` : ""}
                    </div>
                    <div className="bg-warning flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${localContent.pctConsorcioValor}%` }}>
                      {localContent.pctConsorcioValor > 8 ? `${localContent.pctConsorcioValor.toFixed(0)}%` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-[10px]">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-success" />Angolano</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary" />Internacional</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-warning" />Consórcio Misto</span>
                  </div>
                </div>

                {/* Donut chart */}
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={localContent.pieData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={90}
                      dataKey="value" nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {localContent.pieData.map((entry, i) => (
                        <Cell key={i} fill={
                          entry.name === "Angolano" ? "hsl(152, 69%, 40%)" :
                          entry.name === "Internacional" ? "hsl(199, 89%, 48%)" :
                          "hsl(38, 92%, 50%)"
                        } />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtFull(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: By Bloco */}
        <TabsContent value="blocos" className="space-y-4">
          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Bloco</TableHead>
                    <TableHead className="text-xs text-right">Nº Processos</TableHead>
                    <TableHead className="text-xs text-right">Total Solicitado</TableHead>
                    <TableHead className="text-xs text-right">Total Aprovado</TableHead>
                    <TableHead className="text-xs text-right">Taxa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocoSummary.map(b => (
                    <>
                      <TableRow
                        key={b.bloco}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setExpandedBloco(expandedBloco === b.bloco ? null : b.bloco)}
                      >
                        <TableCell className="text-xs font-medium flex items-center gap-1">
                          {expandedBloco === b.bloco ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          {b.bloco}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">{b.count}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{fmt(b.solicitado)}</TableCell>
                        <TableCell className="text-xs text-right font-mono font-semibold">{fmt(b.aprovado)}</TableCell>
                        <TableCell className="text-xs text-right">
                          <Badge variant="outline" className={`text-[10px] ${b.taxa >= 95 ? "text-success" : b.taxa >= 80 ? "text-warning" : "text-danger"}`}>
                            {b.taxa.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {expandedBloco === b.bloco && data.filter(h => h.bloco === b.bloco).slice(0, 20).map((h, i) => (
                        <TableRow key={`${b.bloco}-${i}`} className="bg-muted/30">
                          <TableCell className="text-[10px] pl-8 text-muted-foreground" colSpan={1}>{h.fornecedor}</TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{h.mes} {h.ano}</TableCell>
                          <TableCell className="text-[10px] text-right font-mono text-muted-foreground">{fmt(h.montanteSolicitado)}</TableCell>
                          <TableCell className="text-[10px] text-right font-mono">{fmt(h.montanteAprovado)}</TableCell>
                          <TableCell className="text-[10px] text-right">
                            <Badge variant="outline" className={`text-[9px] ${h.decisao === "Aprovado" ? "text-success" : "text-danger"}`}>{h.decisao}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Fornecedores & Contratação */}
        <TabsContent value="fornecedores" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* By Modalidade */}
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Por Modalidade</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={byModalidade} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {byModalidade.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtFull(v)} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* By Regime */}
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Por Regime de Serviço</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={byRegime} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {byRegime.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtFull(v)} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* By Entidade */}
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Por Tipo de Entidade</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={byEntidade} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {byEntidade.map((_, i) => <Cell key={i} fill={COLORS[(i + 5) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtFull(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top fornecedores table */}
          <Card className="glass-card">
            <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Top 20 Fornecedores</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Fornecedor</TableHead>
                    <TableHead className="text-xs text-right">Nº Contratos</TableHead>
                    <TableHead className="text-xs text-right">Montante Aprovado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byFornecedor.slice(0, 20).map((f, i) => (
                    <TableRow key={f.nomeCompleto}>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="text-xs font-medium">{f.nomeCompleto}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{f.count}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold">{fmt(f.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Tabela Detalhada */}
        <TabsContent value="tabela" className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-xs">{data.length} registos</Badge>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportCsv}>
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </Button>
          </div>
          <Card className="glass-card">
            <CardContent className="p-0 overflow-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] sticky top-0 bg-card">Mês</TableHead>
                    <TableHead className="text-[10px] sticky top-0 bg-card">Ano</TableHead>
                    <TableHead className="text-[10px] sticky top-0 bg-card">Bloco</TableHead>
                    <TableHead className="text-[10px] sticky top-0 bg-card">Fornecedor</TableHead>
                    <TableHead className="text-[10px] sticky top-0 bg-card max-w-[200px]">Serviços</TableHead>
                    <TableHead className="text-[10px] sticky top-0 bg-card">Tipo Processo</TableHead>
                    <TableHead className="text-[10px] sticky top-0 bg-card text-right">Solicitado</TableHead>
                    <TableHead className="text-[10px] sticky top-0 bg-card text-right">Aprovado</TableHead>
                    <TableHead className="text-[10px] sticky top-0 bg-card">Modalidade</TableHead>
                    <TableHead className="text-[10px] sticky top-0 bg-card">Owner</TableHead>
                    <TableHead className="text-[10px] sticky top-0 bg-card">Decisão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 200).map((h, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-[10px]">{h.mes}</TableCell>
                      <TableCell className="text-[10px]">{h.ano}</TableCell>
                      <TableCell className="text-[10px] font-medium">{h.bloco}</TableCell>
                      <TableCell className="text-[10px] max-w-[150px] truncate">{h.fornecedor}</TableCell>
                      <TableCell className="text-[10px] max-w-[200px] truncate" title={h.servicos || ""}>{h.servicos}</TableCell>
                      <TableCell className="text-[10px]">{h.tipoProcesso}</TableCell>
                      <TableCell className="text-[10px] text-right font-mono">{fmt(h.montanteSolicitado)}</TableCell>
                      <TableCell className="text-[10px] text-right font-mono font-semibold">{fmt(h.montanteAprovado)}</TableCell>
                      <TableCell className="text-[10px]">{h.modalidade}</TableCell>
                      <TableCell className="text-[10px]">
                        <Badge variant="outline" className="text-[9px]">{h.owner}</Badge>
                      </TableCell>
                      <TableCell className="text-[10px]">
                        <Badge variant="outline" className={`text-[9px] ${h.decisao === "Aprovado" ? "text-success border-success/30" : "text-danger border-danger/30"}`}>{h.decisao}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.length > 200 && (
                <div className="p-3 text-center text-xs text-muted-foreground">Mostrando 200 de {data.length} registos. Use os filtros para refinar.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
