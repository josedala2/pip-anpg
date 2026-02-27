import { useState, useMemo } from "react";
import { type OilBlock, type BlockPhase } from "@/data/angolaBlocks";

interface ConcessionMapProps {
  blocks: OilBlock[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  onBlockClick: (block: OilBlock) => void;
  onBlockHover: (blockId: string | null) => void;
}

const phaseColorMap: Record<BlockPhase, string> = {
  Production: "hsl(var(--production))",
  Development: "hsl(var(--development))",
  Exploration: "hsl(var(--exploration))",
  Suspended: "hsl(var(--suspended))",
};

// Compute better map positions based on water depth zones
const getZonePosition = (block: OilBlock, index: number, total: number) => {
  // Use the block's mapPosition but remap into proper zones
  const pos = block.mapPosition;

  switch (block.waterDepth) {
    case "Onshore":
      // Right side of map, inland
      return { x: 52 + (pos.x % 20), y: 20 + ((index * 7) % 70) };
    case "Shallow Water":
      // Near coastline
      return { x: 28 + (pos.x % 12), y: 25 + ((index * 8) % 65) };
    case "Deep Water":
      // Middle offshore
      return { x: 14 + (pos.x % 10), y: 30 + ((index * 9) % 55) };
    case "Ultra-Deep Water":
      // Far offshore
      return { x: 4 + (pos.x % 8), y: 35 + ((index * 8) % 50) };
    default:
      return pos;
  }
};

export const ConcessionMap = ({
  blocks,
  selectedBlockId,
  hoveredBlockId,
  onBlockClick,
  onBlockHover,
}: ConcessionMapProps) => {
  const [tooltip, setTooltip] = useState<{ block: OilBlock; x: number; y: number } | null>(null);

  // Precompute positions
  const blockPositions = useMemo(() => {
    const depthGroups: Record<string, OilBlock[]> = {};
    blocks.forEach(b => {
      if (!depthGroups[b.waterDepth]) depthGroups[b.waterDepth] = [];
      depthGroups[b.waterDepth].push(b);
    });

    const positions: Record<string, { x: number; y: number }> = {};
    Object.entries(depthGroups).forEach(([depth, group]) => {
      group.forEach((b, i) => {
        positions[b.id] = getZonePosition(b, i, group.length);
      });
    });
    return positions;
  }, [blocks]);

  const handleMouseEnter = (block: OilBlock, svgX: number, svgY: number) => {
    onBlockHover(block.id);
    setTooltip({ block, x: svgX, y: svgY });
  };

  const handleMouseLeave = () => {
    onBlockHover(null);
    setTooltip(null);
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <svg viewBox="-5 0 110 105" className="w-full h-full" fill="none">
        {/* Ocean background */}
        <rect x="-5" y="0" width="50" height="105" fill="hsl(var(--primary) / 0.04)" />

        {/* Depth zone bands */}
        <rect x="-5" y="0" width="14" height="105" fill="hsl(var(--primary) / 0.08)" rx="1" />
        <rect x="9" y="0" width="14" height="105" fill="hsl(var(--primary) / 0.06)" rx="1" />
        <rect x="23" y="0" width="14" height="105" fill="hsl(var(--primary) / 0.03)" rx="1" />

        {/* Zone labels */}
        <text x="2" y="8" fill="hsl(var(--muted-foreground))" fontSize="2.5" fontWeight="600" opacity="0.5">ULTRA-PROFUNDAS</text>
        <text x="14" y="8" fill="hsl(var(--muted-foreground))" fontSize="2.5" fontWeight="600" opacity="0.5">PROFUNDAS</text>
        <text x="28" y="8" fill="hsl(var(--muted-foreground))" fontSize="2.5" fontWeight="600" opacity="0.5">ÁGUAS RASAS</text>
        <text x="55" y="8" fill="hsl(var(--muted-foreground))" fontSize="2.5" fontWeight="600" opacity="0.5">ONSHORE</text>

        {/* Angola coastline (simplified) */}
        <path
          d="M42 12 L44 15 L45 20 L46 28 L47 35 L48 42 L47 50 L46 58 L44 65 L42 72 L40 78 L38 84 L36 90 L34 95 L32 100"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.8"
          strokeDasharray="2 1"
          opacity="0.6"
        />

        {/* Angola landmass (simplified) */}
        <path
          d="M42 12 L55 10 L70 12 L80 15 L85 20 L88 30 L86 42 L82 55 L78 65 L72 75 L65 82 L58 88 L50 93 L42 96 L36 98 L34 95 L36 90 L38 84 L40 78 L42 72 L44 65 L46 58 L47 50 L48 42 L47 35 L46 28 L45 20 L44 15 Z"
          fill="hsl(var(--secondary) / 0.4)"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />

        {/* Cabinda enclave */}
        <path
          d="M44 12 L50 11 L52 14 L50 18 L46 19 L44 16 Z"
          fill="hsl(var(--secondary) / 0.5)"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />

        {/* Cabinda label */}
        <text x="47" y="16" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="2" opacity="0.6">Cabinda</text>

        {/* Province labels */}
        <text x="60" y="30" fill="hsl(var(--muted-foreground))" fontSize="2" opacity="0.4">Zaire</text>
        <text x="68" y="42" fill="hsl(var(--muted-foreground))" fontSize="2" opacity="0.4">Uíge</text>
        <text x="58" y="55" fill="hsl(var(--muted-foreground))" fontSize="2" opacity="0.4">Luanda</text>
        <text x="62" y="68" fill="hsl(var(--muted-foreground))" fontSize="2" opacity="0.4">Kwanza</text>
        <text x="55" y="82" fill="hsl(var(--muted-foreground))" fontSize="2" opacity="0.4">Benguela</text>
        <text x="48" y="95" fill="hsl(var(--muted-foreground))" fontSize="2" opacity="0.4">Namibe</text>

        {/* Basin labels */}
        <text x="20" y="22" fill="hsl(var(--primary))" fontSize="2.2" fontWeight="500" opacity="0.4">B. do Congo</text>
        <text x="16" y="55" fill="hsl(var(--primary))" fontSize="2.2" fontWeight="500" opacity="0.4">B. do Kwanza</text>
        <text x="12" y="88" fill="hsl(var(--primary))" fontSize="2.2" fontWeight="500" opacity="0.4">B. do Namibe</text>

        {/* Block dots */}
        {blocks.map((block) => {
          const pos = blockPositions[block.id];
          if (!pos) return null;

          const isSelected = selectedBlockId === block.id;
          const isHovered = hoveredBlockId === block.id;
          const isHighlighted = isSelected || isHovered;
          const r = isHighlighted ? 2.8 : block.dailyProduction > 0 ? 2.0 : 1.5;

          return (
            <g
              key={block.id}
              className="cursor-pointer"
              onClick={() => onBlockClick(block)}
              onMouseEnter={() => handleMouseEnter(block, pos.x, pos.y)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Hit area */}
              <circle cx={pos.x} cy={pos.y} r={r + 2} fill="transparent" />

              {/* Selection ring */}
              {isHighlighted && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r + 2}
                  fill="none"
                  stroke={phaseColorMap[block.phase]}
                  strokeWidth="0.4"
                  opacity="0.6"
                  className={isSelected ? "animate-pulse" : ""}
                />
              )}

              {/* Block dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill={phaseColorMap[block.phase]}
                opacity={isHighlighted ? 1 : 0.75}
                style={{
                  filter: isHighlighted
                    ? `drop-shadow(0 0 4px ${phaseColorMap[block.phase]})`
                    : "none",
                }}
                className="transition-all duration-200"
              />

              {/* Label (only for selected/hovered or large producers) */}
              {(isHighlighted || block.dailyProduction > 50000) && (
                <text
                  x={pos.x}
                  y={pos.y - r - 1.5}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize="2"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {block.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 glass-card p-2.5 rounded-lg shadow-lg border border-border/50 pointer-events-none min-w-[160px]"
          style={{
            left: `${(tooltip.x / 105) * 100}%`,
            top: `${(tooltip.y / 105) * 100 - 12}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-bold text-xs">{tooltip.block.name}</div>
          <div className="text-[10px] text-muted-foreground">{tooltip.block.operator}</div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: phaseColorMap[tooltip.block.phase] }}
            />
            <span className="text-[10px]">{tooltip.block.phase}</span>
            {tooltip.block.dailyProduction > 0 && (
              <span className="text-[10px] font-mono ml-auto">
                {(tooltip.block.dailyProduction / 1000).toFixed(0)}k BOPD
              </span>
            )}
          </div>
          {tooltip.block.concession.length > 0 && (
            <div className="mt-1 pt-1 border-t border-border/30">
              {tooltip.block.concession.slice(0, 3).map((p, i) => (
                <div key={i} className="text-[9px] text-muted-foreground flex justify-between">
                  <span>{p.name}{p.isOperator ? " (OP)" : ""}</span>
                  <span className="font-mono">{p.share.toFixed(0)}%</span>
                </div>
              ))}
              {tooltip.block.concession.length > 3 && (
                <div className="text-[9px] text-muted-foreground">+{tooltip.block.concession.length - 3} mais</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 glass-card p-2 rounded-lg">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {(["Production", "Development", "Exploration", "Suspended"] as BlockPhase[]).map(phase => (
            <div key={phase} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: phaseColorMap[phase] }} />
              <span className="text-[9px] text-muted-foreground">{phase}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
