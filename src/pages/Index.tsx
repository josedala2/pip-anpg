import { useState, useCallback, useEffect } from "react";
import { KPICards } from "@/components/dashboard/KPICards";
import { AngolaMap } from "@/components/dashboard/AngolaMap";
import { FilterBar, applyFilters, type FilterState } from "@/components/dashboard/FilterBar";
import { BlockDetail } from "@/components/dashboard/BlockDetail";
import { RiskPerformance } from "@/components/dashboard/RiskPerformance";
import { StrategicForecast } from "@/components/dashboard/StrategicForecast";
import { type OilBlock, oilBlocks } from "@/data/angolaBlocks";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from "lucide-react";

const panels = ["Overview", "Risk & Performance", "Strategic Forecast"];

const Index = () => {
  const [activePanel, setActivePanel] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<OilBlock | null>(null);
  const [filteredIds, setFilteredIds] = useState<string[]>(oilBlocks.map(b => b.id));
  const [isPresentation, setIsPresentation] = useState(false);

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
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">
              <span className="text-gradient">ANGOLA</span>
              <span className="text-muted-foreground font-light ml-2">Oil Concessions</span>
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground">Executive Intelligence Dashboard • Q4 2024</p>
          </div>
          <div className="flex items-center gap-2">
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
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="panel-transition">
          {activePanel === 0 && (
            <div className="space-y-6 animate-fade-in">
              <KPICards />
              <FilterBar onFilterChange={handleFilterChange} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AngolaMap
                  onBlockClick={setSelectedBlock}
                  selectedBlockId={selectedBlock?.id}
                  filteredBlockIds={filteredIds}
                />
                {/* Quick stats */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Blocks</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {oilBlocks.filter(b => filteredIds.includes(b.id)).map(block => (
                      <button
                        key={block.id}
                        onClick={() => setSelectedBlock(block)}
                        className={`w-full text-left glass-card p-3 rounded-lg transition-all hover:bg-secondary/50 ${
                          selectedBlock?.id === block.id ? "border-primary/50 glow-primary" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-sm">{block.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{block.operator}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: block.phase === "Production" ? "hsl(var(--success))"
                                  : block.phase === "Development" ? "hsl(var(--warning))"
                                  : block.phase === "Exploration" ? "hsl(var(--primary))"
                                  : "hsl(var(--danger))"
                              }}
                            />
                            <span className="text-xs font-mono text-muted-foreground">
                              {block.dailyProduction > 0 ? `${(block.dailyProduction / 1000).toFixed(0)}k` : "—"}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePanel === 1 && (
            <div className="animate-fade-in">
              <RiskPerformance />
            </div>
          )}

          {activePanel === 2 && (
            <div className="animate-fade-in">
              <StrategicForecast />
            </div>
          )}
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
