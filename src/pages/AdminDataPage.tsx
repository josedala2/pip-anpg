import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { oilBlocks, type OilBlock } from "@/data/angolaBlocks";
import { InstitutionalFooter } from "@/components/InstitutionalFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Search, Database, BarChart3, Users2, FileText,
  Sun, Moon, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockDetailRow } from "@/components/admin/BlockDetailRow";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";

const phaseColors: Record<string, string> = {
  Production: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Exploration: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  Development: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Suspended: "bg-red-500/15 text-red-400 border-red-500/30",
  Bidding: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

const AdminDataPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { role, roleLabel } = useUserRole();

  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [basinFilter, setBasinFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof OilBlock>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const basins = useMemo(() => [...new Set(oilBlocks.map(b => b.basin))].sort(), []);
  const phases = useMemo(() => [...new Set(oilBlocks.map(b => b.phase))].sort(), []);

  const filtered = useMemo(() => {
    let list = oilBlocks.filter(b => {
      const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.operator.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase());
      const matchPhase = phaseFilter === "all" || b.phase === phaseFilter;
      const matchBasin = basinFilter === "all" || b.basin === basinFilter;
      return matchSearch && matchPhase && matchBasin;
    });

    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return list;
  }, [search, phaseFilter, basinFilter, sortField, sortDir]);

  // Reset page when filters change
  const filteredLen = filtered.length;
  const totalPages = Math.max(1, Math.ceil(filteredLen / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedBlocks = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage, pageSize]);
  const productionBlocks = useMemo(() => filtered.filter(b => b.dailyProduction > 0).sort((a, b) => b.dailyProduction - a.dailyProduction), [filtered]);
  const prodTotalPages = Math.max(1, Math.ceil(productionBlocks.length / pageSize));
  const prodPage = Math.min(page, prodTotalPages);
  const paginatedProdBlocks = useMemo(() => productionBlocks.slice((prodPage - 1) * pageSize, prodPage * pageSize), [productionBlocks, prodPage, pageSize]);
  const concTotalPages = totalPages;
  const paginatedConcBlocks = paginatedBlocks;

  const toggleSort = (field: keyof OilBlock) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: keyof OilBlock }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  const totalProduction = useMemo(() => filtered.reduce((s, b) => s + b.dailyProduction, 0), [filtered]);
  const totalReserves = useMemo(() => filtered.reduce((s, b) => s + b.estimatedReserves, 0), [filtered]);
  const totalInvestment = useMemo(() => filtered.reduce((s, b) => s + b.accumulatedInvestment, 0), [filtered]);

  const canAccess = role === "admin" || role === "conselho" || role === "tecnico_dpro" || role === "tecnico_dex" || role === "tecnico_dneg" || role === "tecnico_dec";

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Sem permissão para aceder a esta página.</p>
          <Link to="/" className="text-primary hover:underline">Voltar ao Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 border-t-4 border-t-primary">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Voltar">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <img
              src={theme === "dark" ? anpgLogoWhite : anpgLogoColor}
              alt="ANPG Logo"
              className="h-8 md:h-10"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight">
                <span className="text-primary">Gestão de Dados</span>
              </h1>
              <p className="text-xs text-muted-foreground">Painel de administração de blocos e concessões</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-6 py-6 max-w-[1920px] mx-auto w-full">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard icon={Database} label="Blocos" value={filtered.length.toString()} sub={`de ${oilBlocks.length} total`} />
          <SummaryCard icon={BarChart3} label="Produção Total" value={`${(totalProduction / 1000).toFixed(0)}K`} sub="BOPD" />
          <SummaryCard icon={FileText} label="Reservas" value={`${totalReserves.toLocaleString()}`} sub="MMbbl" />
          <SummaryCard icon={Users2} label="Investimento" value={`${(totalInvestment / 1000).toFixed(1)}B`} sub="USD acumulado" />
        </div>

        <Tabs defaultValue="blocks" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="blocks" className="gap-2"><Database className="w-3.5 h-3.5" /> Blocos</TabsTrigger>
            <TabsTrigger value="production" className="gap-2"><BarChart3 className="w-3.5 h-3.5" /> Produção</TabsTrigger>
            <TabsTrigger value="concessions" className="gap-2"><Users2 className="w-3.5 h-3.5" /> Concessões</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar bloco, operador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-muted/30"
              />
            </div>
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-[160px] h-9 bg-muted/30">
                <SelectValue placeholder="Fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fases</SelectItem>
                {phases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={basinFilter} onValueChange={setBasinFilter}>
              <SelectTrigger className="w-[180px] h-9 bg-muted/30">
                <SelectValue placeholder="Bacia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as bacias</SelectItem>
                {basins.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} resultados</span>
          </div>

          {/* Blocks Tab */}
          <TabsContent value="blocks" className="mt-0">
            <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>Bloco <SortIcon field="name" /></TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("operator")}>Operador <SortIcon field="operator" /></TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("basin")}>Bacia <SortIcon field="basin" /></TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("phase")}>Fase <SortIcon field="phase" /></TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("waterDepth")}>Profundidade <SortIcon field="waterDepth" /></TableHead>
                      <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("areaKm2")}>Área (km²) <SortIcon field="areaKm2" /></TableHead>
                      <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("riskScore")}>Risco <SortIcon field="riskScore" /></TableHead>
                      <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("complianceScore")}>Compliance <SortIcon field="complianceScore" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBlocks.map(block => (
                      <>
                        <TableRow
                          key={block.id}
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                        >
                          <TableCell className="font-medium">
                            <span className="flex items-center gap-1.5">
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedBlock === block.id ? "rotate-90" : ""}`} />
                              {block.name}
                            </span>
                          </TableCell>
                          <TableCell>{block.operator}</TableCell>
                          <TableCell>{block.basin}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={phaseColors[block.phase] || ""}>{block.phase}</Badge>
                          </TableCell>
                          <TableCell>{block.waterDepth}</TableCell>
                          <TableCell className="text-right">{block.areaKm2?.toLocaleString() ?? "—"}</TableCell>
                          <TableCell className="text-right">{block.riskScore}/10</TableCell>
                          <TableCell className="text-right">{block.complianceScore}%</TableCell>
                        </TableRow>
                        {expandedBlock === block.id && (
                          <BlockDetailRow block={block} colSpan={8} />
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <PaginationBar current={safePage} total={totalPages} count={filteredLen} onPage={setPage} />
          </TabsContent>

          {/* Production Tab */}
          <TabsContent value="production" className="mt-0">
            <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>Bloco <SortIcon field="name" /></TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Fase</TableHead>
                      <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("dailyProduction")}>Produção (BOPD) <SortIcon field="dailyProduction" /></TableHead>
                      <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("estimatedReserves")}>Reservas (MMbbl) <SortIcon field="estimatedReserves" /></TableHead>
                      <TableHead className="text-right">Campos</TableHead>
                      <TableHead className="text-right">Eficiência Fac.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProdBlocks.map(block => (
                      <>
                        <TableRow key={block.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}>
                          <TableCell className="font-medium">
                            <span className="flex items-center gap-1.5">
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedBlock === block.id ? "rotate-90" : ""}`} />
                              {block.name}
                            </span>
                          </TableCell>
                          <TableCell>{block.operator}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={phaseColors[block.phase] || ""}>{block.phase}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">{block.dailyProduction.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono">{block.estimatedReserves.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{block.fields?.filter(f => f.status === "Producing").length ?? 0}</TableCell>
                          <TableCell className="text-right">
                            {block.facilityData?.overallEfficiency
                              ? `${block.facilityData.overallEfficiency}%`
                              : "—"}
                          </TableCell>
                        </TableRow>
                        {expandedBlock === block.id && (
                          <BlockDetailRow block={block} colSpan={7} />
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <PaginationBar current={prodPage} total={prodTotalPages} count={productionBlocks.length} onPage={setPage} />
          </TabsContent>

          {/* Concessions Tab */}
          <TabsContent value="concessions" className="mt-0">
            <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>Bloco <SortIcon field="name" /></TableHead>
                      <TableHead>Tipo Contrato</TableHead>
                      <TableHead>Data Contrato</TableHead>
                      <TableHead>Consórcio</TableHead>
                      <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("accumulatedInvestment")}>Invest. Acum. (MMUSD) <SortIcon field="accumulatedInvestment" /></TableHead>
                      <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("executionRate")}>Execução <SortIcon field="executionRate" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(block => (
                      <>
                        <TableRow key={block.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}>
                          <TableCell className="font-medium">
                            <span className="flex items-center gap-1.5">
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedBlock === block.id ? "rotate-90" : ""}`} />
                              {block.name}
                            </span>
                          </TableCell>
                          <TableCell>{block.contractInfo?.contractType ?? "—"}</TableCell>
                          <TableCell>{block.contractDate}</TableCell>
                          <TableCell className="max-w-[300px]">
                            <div className="flex flex-wrap gap-1">
                              {block.concession.slice(0, 3).map(p => (
                                <Badge key={p.name} variant="outline" className="text-[10px] py-0">
                                  {p.name} ({p.share}%){p.isOperator ? " ★" : ""}
                                </Badge>
                              ))}
                              {block.concession.length > 3 && (
                                <Badge variant="outline" className="text-[10px] py-0 text-muted-foreground">
                                  +{block.concession.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">{block.accumulatedInvestment.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{block.executionRate}%</TableCell>
                        </TableRow>
                        {expandedBlock === block.id && (
                          <BlockDetailRow block={block} colSpan={6} />
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <InstitutionalFooter />
    </div>
  );
};

function SummaryCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export default AdminDataPage;
