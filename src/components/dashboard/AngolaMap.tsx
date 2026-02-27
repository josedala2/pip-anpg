import { oilBlocks, type OilBlock, type BlockPhase } from "@/data/angolaBlocks";

interface AngolaMapProps {
  onBlockClick: (block: OilBlock) => void;
  selectedBlockId?: string | null;
  filteredBlockIds?: string[];
}

const phaseColorMap: Record<BlockPhase, string> = {
  Production: "hsl(var(--production))",
  Development: "hsl(var(--development))",
  Exploration: "hsl(var(--exploration))",
  Suspended: "hsl(var(--suspended))",
};

const phaseGlowMap: Record<BlockPhase, string> = {
  Production: "drop-shadow(0 0 6px hsl(var(--production) / 0.6))",
  Development: "drop-shadow(0 0 6px hsl(var(--development) / 0.6))",
  Exploration: "drop-shadow(0 0 6px hsl(var(--exploration) / 0.6))",
  Suspended: "drop-shadow(0 0 4px hsl(var(--suspended) / 0.4))",
};

export const AngolaMap = ({ onBlockClick, selectedBlockId, filteredBlockIds }: AngolaMapProps) => {
  const visibleBlocks = filteredBlockIds
    ? oilBlocks.filter(b => filteredBlockIds.includes(b.id))
    : oilBlocks;

  return (
    <div className="relative w-full aspect-[3/4] md:aspect-[2/3] max-w-md mx-auto">
      {/* Angola outline */}
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        {/* Simplified Angola shape */}
        <path
          d="M15 30 L30 28 L40 30 L48 32 L52 35 L55 40 L52 48 L48 55 L42 60 L38 65 L35 70 L30 75 L25 80 L20 85 L15 88 L10 90 L5 85 L3 78 L5 70 L8 62 L10 55 L8 48 L10 42 L12 36 Z"
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
          className="opacity-60"
        />
        {/* Cabinda */}
        <path
          d="M18 56 L22 55 L24 58 L22 62 L18 62 Z"
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
          className="opacity-60"
        />
        {/* Coastline highlight */}
        <path
          d="M15 30 L10 42 L8 48 L10 55 L8 62 L5 70 L3 78 L5 85 L10 90 L15 88"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="1"
        />

        {/* Offshore blocks */}
        {visibleBlocks.map((block) => {
          const isSelected = selectedBlockId === block.id;
          const r = isSelected ? 3.5 : 2.5;

          return (
            <g key={block.id} className="cursor-pointer" onClick={() => onBlockClick(block)}>
              <circle
                cx={block.mapPosition.x}
                cy={block.mapPosition.y}
                r={r + 1.5}
                fill="transparent"
              />
              <circle
                cx={block.mapPosition.x}
                cy={block.mapPosition.y}
                r={r}
                fill={phaseColorMap[block.phase]}
                opacity={isSelected ? 1 : 0.8}
                style={{ filter: isSelected ? phaseGlowMap[block.phase] : "none" }}
                className="transition-all duration-300"
              />
              {isSelected && (
                <circle
                  cx={block.mapPosition.x}
                  cy={block.mapPosition.y}
                  r={r + 2}
                  fill="none"
                  stroke={phaseColorMap[block.phase]}
                  strokeWidth="0.5"
                  opacity="0.5"
                  className="animate-pulse"
                />
              )}
              <text
                x={block.mapPosition.x}
                y={block.mapPosition.y - r - 2}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize="2.2"
                fontWeight="600"
                className="pointer-events-none"
              >
                {block.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-col gap-1.5 glass-card p-2.5 text-[10px] md:text-xs">
        {(["Production", "Development", "Exploration", "Suspended"] as BlockPhase[]).map(phase => (
          <div key={phase} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: phaseColorMap[phase] }} />
            <span className="text-muted-foreground">{phase}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
