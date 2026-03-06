import { useState, useCallback, useMemo } from "react";
import { ConcessionMap } from "@/components/dashboard/ConcessionMap";
import { applyFilters, type FilterState } from "@/components/dashboard/FilterBar";
import { BlockDetail } from "@/components/dashboard/BlockDetail";
import { OverviewSidebar } from "@/components/dashboard/OverviewSidebar";
import { type OilBlock, oilBlocks } from "@/data/angolaBlocks";

const ProducaoPage = () => {
  const [selectedBlock, setSelectedBlock] = useState<OilBlock | null>(null);
  const [filteredIds, setFilteredIds] = useState<string[]>(oilBlocks.map(b => b.id));
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  const filteredBlocks = useMemo(() =>
    oilBlocks.filter(b => filteredIds.includes(b.id)),
    [filteredIds]
  );

  const handleFilterChange = useCallback((filters: FilterState) => {
    const filtered = applyFilters(filters);
    setFilteredIds(filtered.map(b => b.id));
  }, []);

  return (
    <div className="flex flex-col md:flex-row" style={{ height: "calc(100vh - 56px)" }}>
      <div className="flex-1 md:flex-[6] min-w-0 relative h-[45vh] md:h-full">
        <ConcessionMap
          blocks={filteredBlocks}
          selectedBlockId={selectedBlock?.id ?? null}
          hoveredBlockId={hoveredBlockId}
          onBlockClick={() => {}}
          onBlockHover={setHoveredBlockId}
        />
      </div>
      <div className="flex-1 md:flex-[4] md:min-w-[340px] md:max-w-[520px] h-[55vh] md:h-full overflow-hidden">
        <OverviewSidebar
          filteredIds={filteredIds}
          selectedBlock={selectedBlock}
          onBlockSelect={setSelectedBlock}
          onFilterChange={handleFilterChange}
        />
      </div>
      {selectedBlock && <BlockDetail block={selectedBlock} onClose={() => setSelectedBlock(null)} />}
    </div>
  );
};

export default ProducaoPage;
