import { useState, useCallback, useEffect, useMemo } from "react";

import { ConcessionMap } from "@/components/dashboard/ConcessionMap";
import { applyFilters, type FilterState } from "@/components/dashboard/FilterBar";
import { BlockDetail } from "@/components/dashboard/BlockDetail";
import { OverviewSidebar } from "@/components/dashboard/OverviewSidebar";
import { RiskPerformance } from "@/components/dashboard/RiskPerformance";
import { StrategicForecast } from "@/components/dashboard/StrategicForecast";
import { BlocksPanel } from "@/components/dashboard/BlocksPanel";
import { ExplorationPanel } from "@/components/dashboard/ExplorationPanel";
import { type OilBlock, oilBlocks } from "@/data/angolaBlocks";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";

const panels = ["Overview", "Blocos & Concessões", "Exploração & Sísmica", "Risk & Performance", "Strategic Forecast"];

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const [activePanel, setActivePanel] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<OilBlock | null>(null);
  const [filteredIds, setFilteredIds] = useState<string[]>(oilBlocks.map(b => b.id));
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [isPresentation, setIsPresentation] = useState(false);

  const filteredBlocks = useMemo(() =>
    oilBlocks.filter(b => filteredIds.includes(b.id)),
    [filteredIds]
  );

  const handleFilterChange = useCallback((filters: FilterState) => {
    const filtered = applyFilters(filters);
    setFilteredIds(filtered.map(b => b.id));
  }, []);

  const nextPanel = () => setActivePanel(p => Math.min(p + 1, panels.length - 1));
  const prevPanel = () => setActivePanel(p => Math.max(p - 1, 0));

  // Keyboard nav for presentation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPanel();
      if (e.key === "ArrowLeft") prevPanel();
      if (e.key === "Escape") setIsPresentation(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Touch swipe
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
    <div className={`min-h-screen bg-background text-foreground ${isPresentation ? "fixed inset-0 z-[100]" : ""}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <img
              src={theme === "dark" ? anpgLogoWhite : anpgLogoColor}
              alt="ANPG Logo"
              className="h-8 md:h-10"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight">
                <span className="text-gradient">ANGOLA</span>
                <span className="text-muted-foreground font-light ml-2">Oil Concessions</span>
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground">Executive Intelligence Dashboard • Q4 2024</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsPresentation(!isPresentation)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title={isPresentation ? "Exit Presentation" : "Presentation Mode"}
            >
              {isPresentation ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Panel Tabs */}
        <div className="flex items-center px-4 md:px-6 pb-2 gap-1">
          {panels.map((panel, i) => (
            <button
              key={panel}
              onClick={() => setActivePanel(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activePanel === i
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {panel}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main>
        <div className="panel-transition">
          {activePanel === 0 && (
            <div className="animate-fade-in relative" style={{ height: "calc(100vh - 110px)" }}>
              <ConcessionMap
                blocks={filteredBlocks}
                selectedBlockId={selectedBlock?.id ?? null}
                hoveredBlockId={hoveredBlockId}
                onBlockClick={() => {}}
                onBlockHover={setHoveredBlockId}
              />
              <OverviewSidebar
                filteredIds={filteredIds}
                selectedBlock={selectedBlock}
                onBlockSelect={setSelectedBlock}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}

          <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {activePanel === 1 && (
            <div className="animate-fade-in">
              <BlocksPanel />
            </div>
          )}

          {activePanel === 2 && (
            <div className="animate-fade-in">
              <ExplorationPanel />
            </div>
          )}

          {activePanel === 3 && (
            <div className="animate-fade-in">
              <RiskPerformance />
            </div>
          )}

          {activePanel === 4 && (
            <div className="animate-fade-in">
              <StrategicForecast />
            </div>
          )}
          </div>
        </div>
      </main>

      {/* Presentation nav arrows */}
      {isPresentation && (
        <>
          <button onClick={prevPanel} disabled={activePanel === 0} className="fixed left-4 top-1/2 -translate-y-1/2 z-[101] p-3 glass-card rounded-full disabled:opacity-20">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextPanel} disabled={activePanel === panels.length - 1} className="fixed right-4 top-1/2 -translate-y-1/2 z-[101] p-3 glass-card rounded-full disabled:opacity-20">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[101] flex gap-2">
            {panels.map((_, i) => (
              <button key={i} onClick={() => setActivePanel(i)} className={`w-2 h-2 rounded-full transition-all ${i === activePanel ? "bg-primary w-6" : "bg-muted-foreground/40"}`} />
            ))}
          </div>
        </>
      )}

      {/* Block Detail Slide-in */}
      {selectedBlock && <BlockDetail block={selectedBlock} onClose={() => setSelectedBlock(null)} />}
    </div>
  );
};

export default Index;
