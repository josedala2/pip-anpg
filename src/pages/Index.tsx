import { useState, useCallback, useEffect, useMemo } from "react";
import { Separator } from "@/components/ui/separator";

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
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [isTransitioning, setIsTransitioning] = useState(false);
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
        <div className="flex items-center justify-between px-4 md:px-6 3xl:px-8 py-3 3xl:py-4">
          <div className="flex items-center gap-3 3xl:gap-4">
            <img
              src={theme === "dark" ? anpgLogoWhite : anpgLogoColor}
              alt="ANPG Logo"
              className="h-8 md:h-10 3xl:h-12"
            />
            <div>
            <h1 className="text-lg md:text-xl 2xl:text-2xl 3xl:text-3xl font-bold tracking-tight">
                <span className="text-gradient">ANGOLA</span>
                <span className="text-muted-foreground font-light ml-2">Oil Concessions</span>
              </h1>
              <p className="text-[10px] md:text-xs 2xl:text-sm 3xl:text-base text-muted-foreground">Executive Intelligence Dashboard • Q4 2024</p>
            </div>
          </div>
          <div className="flex items-center gap-2 3xl:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 3xl:p-2.5 rounded-lg hover:bg-secondary transition-colors"
              title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 3xl:w-5 3xl:h-5" /> : <Moon className="w-4 h-4 3xl:w-5 3xl:h-5" />}
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

        <Separator className="mx-4 md:mx-6" />

        {/* Panel Tabs */}
        <div className="flex items-center px-4 md:px-6 3xl:px-8 py-2 3xl:py-3 gap-1 3xl:gap-2">
          {panels.map((panel, i) => (
            <button
              key={panel}
              onClick={() => switchPanel(i)}
              className={`relative px-3 py-1.5 2xl:px-4 2xl:py-2 3xl:px-5 3xl:py-2.5 rounded-lg text-xs 2xl:text-sm 3xl:text-base font-medium transition-all group ${
                activePanel === i
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {panel}
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                  activePanel === i ? "w-3/4 opacity-100" : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50"
                }`}
              />
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="overflow-hidden">
        <div
          className={`transition-all duration-300 ease-out ${
            isTransitioning
              ? slideDirection === "right"
                ? "opacity-0 translate-x-8"
                : "opacity-0 -translate-x-8"
              : "opacity-100 translate-x-0"
          }`}
        >
          {activePanel === 0 && (
            <div className="relative" style={{ height: "calc(100vh - 110px)" }}>
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

          <div className="p-4 md:p-6 2xl:p-8 3xl:p-10 max-w-[1920px] 3xl:max-w-[2400px] mx-auto">
          {activePanel === 1 && <BlocksPanel />}
          {activePanel === 2 && <ExplorationPanel />}
          {activePanel === 3 && <RiskPerformance />}
          {activePanel === 4 && <StrategicForecast />}
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
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[101] flex items-center gap-3 glass-card px-4 py-2.5 rounded-full">
            <span className="text-[10px] text-muted-foreground font-mono mr-1">
              {activePanel + 1}/{panels.length}
            </span>
            {panels.map((label, i) => (
              <button
                key={i}
                onClick={() => switchPanel(i)}
                title={label}
                className="relative group"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    i === activePanel
                      ? "w-8 h-2 bg-primary"
                      : i < activePanel
                        ? "w-2 h-2 bg-primary/50"
                        : "w-2 h-2 bg-muted-foreground/30"
                  }`}
                />
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] text-foreground bg-popover px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border">
                  {label}
                </span>
              </button>
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
