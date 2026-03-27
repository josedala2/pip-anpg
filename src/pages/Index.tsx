import { useState, useCallback, useEffect, useMemo } from "react";
import { Separator } from "@/components/ui/separator";

import { ExecutiveHome } from "@/components/dashboard/ExecutiveHome";
import { BlockDetail } from "@/components/dashboard/BlockDetail";
import { BlocksPanel } from "@/components/dashboard/BlocksPanel";
import { ExplorationPanel } from "@/components/dashboard/ExplorationPanel";
import { ProductionPanel } from "@/components/dashboard/ProductionPanel";
import { ContractCompliancePanel } from "@/components/dashboard/ContractCompliancePanel";
import { FacilitiesIntegrityPanel } from "@/components/dashboard/FacilitiesIntegrityPanel";
import { StrategicForecast } from "@/components/dashboard/StrategicForecast";
import { EconomicFinancialPanel } from "@/components/dashboard/EconomicFinancialPanel";
import { GeneralForecastPanel } from "@/components/dashboard/GeneralForecastPanel";
import { OperatorsPanel } from "@/components/dashboard/OperatorsPanel";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { CouncilRecommendationsPanel } from "@/components/dashboard/CouncilRecommendationsPanel";
import { HomologacoesPanel } from "@/components/dashboard/HomologacoesPanel";
import { ConselhoPanel } from "@/components/dashboard/ConselhoPanel";
import { RiskPerformance } from "@/components/dashboard/RiskPerformance";
import { SobaChat } from "@/components/dashboard/SobaChat";
import { NationalForecastPanel } from "@/components/dashboard/NationalForecastPanel";
import { GasUtilizationPanel } from "@/components/dashboard/GasUtilizationPanel";
import { CumulativeLiftingsPanel } from "@/components/dashboard/CumulativeLiftingsPanel";
import { type OilBlock, oilBlocks } from "@/data/angolaBlocks";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, Sun, Moon, FileText, LogOut, User, Users, Database, Bell, Clock, Signal, Sparkles, PanelLeft } from "lucide-react";
import { evaluateAlerts, evaluateForecastAlerts } from "@/lib/alertsEngine";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";
import { InstitutionalFooter } from "@/components/InstitutionalFooter";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const allPanels = [
  "Home Executiva",
  "CA",
  "Concessões",
  "Produção",
  "Exploração",
  "Instalações",
  "Contratos",
  "Homologações",
  "Económico",
  "Cenários",
  "Previsão Geral",
  "Previsão Nacional",
  "Gás Natural",
  "Levantamentos",
  "Soba",
];

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { role, roleLabel, loading: roleLoading } = useUserRole();

  const panels = allPanels;
  const [activePanel, setActivePanel] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<OilBlock | null>(null);
  const [isPresentation, setIsPresentation] = useState(false);
  const [analysisPeriod, setAnalysisPeriod] = useState<string>("actual");
  const [homeDrillDown, setHomeDrillDown] = useState<"operadores" | "alertas" | "recomendacoes" | null>(null);

  const alertsSummary = useMemo(() => {
    const verifiedBlocks = oilBlocks.filter(b => !b.pendingRealData);
    const operational = evaluateAlerts(verifiedBlocks);
    const forecast = evaluateForecastAlerts();
    const verifiedBlockIds = new Set(verifiedBlocks.map(b => b.id));
    const filteredForecast = forecast.filter(a => !a.blockId || verifiedBlockIds.has(a.blockId));
    const all = [...operational, ...filteredForecast];
    return {
      total: all.length,
      critical: all.filter(a => a.severity === "critical").length,
      forecast: filteredForecast.length,
      forecastCritical: filteredForecast.filter(a => a.severity === "critical").length,
    };
  }, []);

  // Simulated last update timestamp
  const lastUpdate = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() - 2);
    return d.toLocaleString("pt-AO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }, []);

  const switchPanel = useCallback((newPanel: number) => {
    if (newPanel === activePanel || isTransitioning) return;
    setSlideDirection(newPanel > activePanel ? "right" : "left");
    setIsTransitioning(true);
    setTimeout(() => {
      setActivePanel(newPanel);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  }, [activePanel, isTransitioning]);

  const nextPanel = () => switchPanel(Math.min(activePanel + 1, panels.length - 1));
  const prevPanel = () => switchPanel(Math.max(activePanel - 1, 0));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPanel();
      if (e.key === "ArrowLeft") prevPanel();
      if (e.key === "Escape") setIsPresentation(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 60) {
        if (diff > 0) nextPanel();
        else prevPanel();
      }
    };
    window.addEventListener("touchstart", onStart);
    window.addEventListener("touchend", onEnd);
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, []);

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full bg-background text-foreground ${isPresentation ? "fixed inset-0 z-[100]" : ""}`}>
        {/* Sidebar — hidden in presentation mode */}
        {!isPresentation && (
          <AppSidebar activePanel={activePanel} onPanelChange={switchPanel} panels={panels} />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header — Zone A: Strategic Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/60 border-t-[3px] border-t-primary">
            <div className="flex items-center justify-between px-4 md:px-6 3xl:px-8 py-2.5 3xl:py-3">
              {/* Left: Sidebar trigger + Logo + Title */}
              <div className="flex items-center gap-3 3xl:gap-4">
                {!isPresentation && (
                  <SidebarTrigger className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <PanelLeft className="w-4 h-4" />
                  </SidebarTrigger>
                )}
                <img
                  src={theme === "dark" ? anpgLogoWhite : anpgLogoColor}
                  alt="ANPG Logo"
                  className="h-8 md:h-10 3xl:h-12"
                />
                <div>
                  <h1 className="text-base md:text-lg 2xl:text-xl 3xl:text-2xl font-bold tracking-tight text-foreground">
                    Plataforma de Inteligência e Análise Petrolífera
                  </h1>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Última actualização: {lastUpdate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Signal className="w-3 h-3 text-success" />
                      <span>Qualidade dados: 94%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Period selector */}
              <div className="hidden md:flex items-center gap-1 bg-muted/60 rounded-lg p-0.5">
                {[
                  { value: "actual", label: "Actual" },
                  { value: "6m", label: "6M" },
                  { value: "12m", label: "12M" },
                  { value: "24m", label: "24M" },
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setAnalysisPeriod(period.value)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                      analysisPeriod === period.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 3xl:gap-2">
                {role === "admin" && (
                  <Link to="/admin/users" className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Gestão de Utilizadores">
                    <Users className="w-4 h-4" />
                  </Link>
                )}
                {(role === "admin" || role === "conselho" || role === "tecnico_dpro" || role === "tecnico_dex" || role === "tecnico_dneg" || role === "tecnico_dec") && (
                  <Link to="/admin/data" className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Gestão de Dados">
                    <Database className="w-4 h-4" />
                  </Link>
                )}
                <button
                  className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
                  title="Alertas"
                  onClick={() => {
                    if (activePanel !== 0) {
                      setActivePanel(0);
                    }
                    setHomeDrillDown(prev => prev === "alertas" ? null : "alertas");
                  }}
                >
                  <Bell className="w-4 h-4" />
                  {alertsSummary.total > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      alertsSummary.critical > 0 ? "bg-danger text-white animate-pulse-subtle" : "bg-warning text-warning-foreground"
                    }`}>
                      {alertsSummary.total}
                    </span>
                  )}
                </button>
                <Link to="/reports" className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Relatórios">
                  <FileText className="w-4 h-4" />
                </Link>
                <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary transition-colors" title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}>
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsPresentation(!isPresentation)} className="p-2 rounded-lg hover:bg-secondary transition-colors" title={isPresentation ? "Sair" : "Apresentação"}>
                  {isPresentation ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Conta">
                      <User className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2 text-xs text-muted-foreground truncate border-b border-border">
                      <div>{user?.email}</div>
                      {roleLabel && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-primary/10 text-primary">
                          {roleLabel}
                        </span>
                      )}
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/compare" className="gap-2 cursor-pointer">
                        Comparar Blocos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="gap-2 text-danger cursor-pointer">
                      <LogOut className="w-4 h-4" /> Terminar sessão
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="overflow-hidden flex-1">
            <div
              className={`transition-all duration-300 ease-out ${
                isTransitioning
                  ? slideDirection === "right"
                    ? "opacity-0 translate-x-8"
                    : "opacity-0 -translate-x-8"
                  : "opacity-100 translate-x-0"
              }`}
            >
              {panels[activePanel] === "Home Executiva" && <ExecutiveHome initialDrillDown={homeDrillDown} />}

              <div className="p-4 md:p-6 2xl:p-8 3xl:p-10 max-w-[1920px] 3xl:max-w-[2400px] mx-auto">
                {panels[activePanel] === "CA" && <ConselhoPanel />}
                {panels[activePanel] === "Concessões" && <BlocksPanel />}
                {panels[activePanel] === "Produção" && <ProductionPanel />}
                {panels[activePanel] === "Exploração" && <ExplorationPanel />}
                {panels[activePanel] === "Instalações" && <FacilitiesIntegrityPanel />}
                {panels[activePanel] === "Contratos" && <ContractCompliancePanel />}
                {panels[activePanel] === "Homologações" && <HomologacoesPanel />}
                {panels[activePanel] === "Económico" && <EconomicFinancialPanel />}
                {panels[activePanel] === "Cenários" && <StrategicForecast />}
                {panels[activePanel] === "Previsão Geral" && <GeneralForecastPanel />}
                {panels[activePanel] === "Previsão Nacional" && <NationalForecastPanel />}
                {panels[activePanel] === "Gás Natural" && <GasUtilizationPanel />}
                {panels[activePanel] === "Levantamentos" && <CumulativeLiftingsPanel />}
                {panels[activePanel] === "Soba" && <SobaChat />}
              </div>
            </div>
          </main>

          {/* Presentation nav */}
          {isPresentation && (
            <>
              <button onClick={prevPanel} disabled={activePanel === 0} className="fixed left-4 top-1/2 -translate-y-1/2 z-[101] p-3 glass-card rounded-full disabled:opacity-20">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={nextPanel} disabled={activePanel === panels.length - 1} className="fixed right-4 top-1/2 -translate-y-1/2 z-[101] p-3 glass-card rounded-full disabled:opacity-20">
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[101] flex items-center gap-3 glass-card px-4 py-2.5 rounded-full">
                <span className="text-[10px] text-muted-foreground font-mono mr-1">
                  {activePanel + 1}/{panels.length}
                </span>
                {panels.map((label, i) => (
                  <button key={i} onClick={() => switchPanel(i)} title={label} className="relative group">
                    <span className={`block rounded-full transition-all duration-300 ${
                      i === activePanel ? "w-8 h-2 bg-primary" : i < activePanel ? "w-2 h-2 bg-primary/50" : "w-2 h-2 bg-muted-foreground/30"
                    }`} />
                  </button>
                ))}
              </div>
            </>
          )}

          {selectedBlock && <BlockDetail block={selectedBlock} onClose={() => setSelectedBlock(null)} />}
          {!isPresentation && activePanel !== 0 && <InstitutionalFooter />}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
