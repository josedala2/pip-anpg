import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Bidding: "hsl(var(--bidding))",
};

// ── Real geographic coordinates for Angola oil blocks ──
// Based on ANPG concession map: lat ~4.5°S–17.5°S, lon ~8°E–24°E
// SVG viewBox: 0 0 200 250
// Projection: lon → x, lat → y (inverted, south = larger y)

const LON_MIN = 7.5;
const LON_MAX = 24.5;
const LAT_MIN = -4.0;  // northernmost (Cabinda)
const LAT_MAX = -17.5; // southernmost (Namibe)

const geoToSvg = (lon: number, lat: number) => ({
  x: ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 200,
  y: ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 250,
});

// Real approximate positions for each block (lon, lat)
const blockGeoPositions: Record<string, [number, number]> = {
  // Cabinda onshore
  "cabinda-norte":  [12.25, -5.1],
  "cabinda-centro": [12.30, -5.35],
  "cabinda-sul":    [12.28, -5.55],
  "fs-associacoes": [12.15, -5.2],
  "fst-associacoes":[12.18, -5.4],
  // Congo onshore (CON blocks)
  "block-con1":     [13.2, -6.0],
  "block-con2":     [13.5, -6.1],
  "block-con3":     [13.8, -6.2],
  "block-con4":     [13.3, -6.35],
  "block-con5":     [13.6, -6.4],
  "block-con6":     [13.9, -6.3],
  "block-con8":     [14.1, -6.15],
  // Kwanza onshore (KON blocks)
  "block-kon1":     [14.5, -8.3],
  "block-kon2":     [14.8, -8.5],
  "block-kon3":     [15.1, -8.7],
  "block-kon4":     [15.4, -8.9],
  "block-kon5":     [15.2, -8.8],
  "block-kon6":     [15.5, -9.0],
  "block-kon7":     [15.8, -9.1],
  "block-kon8":     [15.8, -9.2],
  "block-kon9":     [16.1, -9.4],
  "block-kon10":    [16.4, -9.6],
  "block-kon11":    [16.0, -9.8],
  "block-kon12":    [15.0, -9.5],
  "block-kon13":    [15.3, -10.0],
  "block-kon14":    [15.6, -10.2],
  "block-kon15":    [15.3, -9.8],
  "block-kon16":    [15.6, -10.0],
  "block-kon17":    [15.9, -10.2],
  "block-kon18":    [16.2, -10.4],
  "block-kon19":    [15.4, -10.5],
  "block-kon20":    [15.7, -10.7],
  // Shallow water
  "block-0":        [11.8, -5.8],
  "block-1":        [12.0, -6.5],  // Block 1/14
  "block-2-05":     [12.3, -7.0],
  "block-3":        [12.5, -6.3],  // Block 3/05
  "block-3-05a":    [12.7, -6.5],
  "block-3-24":     [12.6, -6.8],
  "block-3-15":     [12.4, -7.3],
  "block-2-15":     [12.1, -7.5],
  "block-4-05":     [13.0, -7.2],
  "block-5-06":     [12.8, -8.2],
  "block-6-24":     [12.6, -8.6],
  // Deep water
  "block-14":       [11.2, -6.0],
  "block-15":       [10.8, -6.5],
  "block-15-06":    [11.0, -6.8],
  "block-15-14":    [11.3, -6.3],
  "block-16":       [10.5, -7.5],
  "block-18":       [10.2, -7.0],
  "block-20":       [10.8, -8.5],
  "block-21":       [10.5, -9.0],
  // Ultra-deep water
  "block-17":       [9.5, -6.8],
  "block-31":       [9.0, -7.5],
  "block-31-21":    [9.2, -8.0],
  "block-32":       [9.5, -8.5],
  "block-48":       [9.0, -13.5],
  "block-44":       [8.8, -14.5],
  "block-45":       [9.0, -15.0],
  "block-46":       [8.5, -15.5],
  "block-47":       [8.8, -16.0],
  "block-49":       [8.2, -16.5],
  "block-50":       [8.5, -17.0],
  // Bidding blocks (22-30): Congo/Kwanza deep water
  "block-22":       [10.0, -7.0],
  "block-23":       [10.7, -7.4],
  "block-24":       [10.0, -7.8],
  "block-25":       [10.7, -8.2],
  "block-26":       [10.0, -8.6],
  "block-27":       [10.7, -9.0],
  "block-28":       [10.0, -9.4],
  "block-29":       [10.7, -9.8],
  "block-30":       [10.0, -10.2],
  // Bidding blocks (33-43): Namibe/Benguela
  "block-33":       [9.5, -11.0],
  "block-34":       [10.3, -11.5],
  "block-35":       [9.5, -12.0],
  "block-36":       [10.3, -12.5],
  "block-37":       [9.5, -13.0],
  "block-38":       [10.3, -13.5],
  "block-39":       [9.5, -14.0],
  "block-40":       [10.3, -14.5],
  "block-41":       [9.5, -15.0],
  "block-42":       [10.3, -15.5],
  "block-43":       [9.5, -16.0],
};

const getBlockSvgPos = (block: OilBlock) => {
  const geo = blockGeoPositions[block.id];
  if (geo) return geoToSvg(geo[0], geo[1]);
  // Fallback: use mapPosition scaled
  return { x: block.mapPosition.x * 2, y: block.mapPosition.y * 2.5 };
};

// Angola coastline as real coordinates → SVG path
const coastlinePoints: [number, number][] = [
  [12.3, -4.4],   // Cabinda north
  [12.5, -4.5],
  [12.4, -5.0],
  [12.2, -5.5],
  [12.0, -5.8],   // Cabinda south / Congo river
  [12.3, -5.9],   // North of mainland
  [13.0, -5.8],
  [12.8, -6.2],
  [12.5, -6.5],
  [12.8, -7.0],
  [13.0, -7.5],
  [13.2, -8.0],
  [13.3, -8.5],
  [13.5, -8.8],   // Luanda area
  [13.3, -9.2],
  [13.0, -9.8],
  [12.8, -10.5],
  [13.2, -11.2],
  [13.5, -12.0],
  [13.3, -12.5],  // Lobito / Benguela
  [12.8, -13.0],
  [12.5, -13.5],
  [12.2, -14.0],
  [12.0, -14.5],
  [11.8, -15.0],  // Namibe
  [11.7, -15.5],
  [11.8, -16.0],
  [12.0, -16.5],
  [12.2, -17.0],
  [12.5, -17.3],
];

const coastlineSvg = coastlinePoints.map(([lon, lat]) => {
  const p = geoToSvg(lon, lat);
  return `${p.x},${p.y}`;
}).join(" L");

// Simplified Angola border (inland)
const borderPoints: [number, number][] = [
  [12.3, -4.4],
  [13.5, -4.3],
  [16.0, -4.4],
  [18.5, -4.5],
  [21.0, -5.5],
  [22.5, -6.0],
  [24.0, -6.5],
  [24.0, -8.0],
  [23.5, -9.0],
  [22.0, -10.0],
  [22.0, -11.0],
  [24.0, -11.5],
  [24.0, -13.0],
  [23.0, -13.5],
  [22.0, -14.0],
  [21.0, -15.0],
  [20.0, -16.0],
  [18.0, -17.0],
  [15.0, -17.3],
  [12.5, -17.3],
];

const borderSvg = borderPoints.map(([lon, lat]) => {
  const p = geoToSvg(lon, lat);
  return `${p.x},${p.y}`;
}).join(" L");

// Cabinda enclave
const cabindaPoints: [number, number][] = [
  [12.1, -4.4], [12.8, -4.3], [13.1, -4.5], [13.0, -5.0],
  [12.5, -5.3], [12.2, -5.6], [12.0, -5.8], [11.8, -5.3], [12.0, -4.8], [12.1, -4.4],
];
const cabindaSvg = cabindaPoints.map(([lon, lat]) => {
  const p = geoToSvg(lon, lat);
  return `${p.x},${p.y}`;
}).join(" L");

// Depth contour lines (approximate bathymetry)
const makeContour = (offsetLon: number, points: [number, number][]) =>
  points.map(([lon, lat]) => {
    const p = geoToSvg(lon - offsetLon, lat);
    return `${p.x},${p.y}`;
  }).join(" L");

const shallowContour = makeContour(0.8, coastlinePoints);
const deepContour = makeContour(2.0, coastlinePoints);
const ultraDeepContour = makeContour(3.5, coastlinePoints);

export const ConcessionMap = ({
  blocks,
  selectedBlockId,
  hoveredBlockId,
  onBlockClick,
  onBlockHover,
}: ConcessionMapProps) => {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<{ block: OilBlock; x: number; y: number } | null>(null);

  const blockPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    blocks.forEach(b => { positions[b.id] = getBlockSvgPos(b); });
    return positions;
  }, [blocks]);

  const handleClick = (block: OilBlock, svgX: number, svgY: number) => {
    onBlockClick(block);
    setTooltip(prev => prev?.block.id === block.id ? null : { block, x: svgX, y: svgY });
  };

  const handleCloseTooltip = () => {
    setTooltip(null);
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <svg viewBox="-10 -5 220 260" className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet">
        {/* Ocean background gradient */}
        <defs>
          <linearGradient id="ocean-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="-10" y="-5" width="220" height="260" fill="url(#ocean-grad)" />

        {/* Bathymetry contours */}
        <path d={`M${ultraDeepContour}`} fill="none" stroke="hsl(var(--primary) / 0.12)" strokeWidth="0.3" />
        <path d={`M${deepContour}`} fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="0.3" />
        <path d={`M${shallowContour}`} fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="0.4" />

        {/* Landmass */}
        <path
          d={`M${coastlineSvg} L${borderSvg} Z`}
          fill="hsl(var(--secondary) / 0.35)"
          stroke="hsl(var(--border))"
          strokeWidth="0.6"
        />

        {/* Cabinda enclave */}
        <path
          d={`M${cabindaSvg}`}
          fill="hsl(var(--secondary) / 0.4)"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />

        {/* Coastline overlay */}
        <path d={`M${coastlineSvg}`} fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.8" />

        {/* Province/City labels */}
        {[
          { name: "Cabinda", lon: 12.5, lat: -4.7 },
          { name: "Soyo", lon: 13.2, lat: -5.9 },
          { name: "Luanda", lon: 13.8, lat: -8.8 },
          { name: "Lobito", lon: 13.8, lat: -12.3 },
          { name: "Benguela", lon: 14.0, lat: -12.6 },
          { name: "Namibe", lon: 12.5, lat: -15.2 },
        ].map(city => {
          const p = geoToSvg(city.lon, city.lat);
          return (
            <g key={city.name}>
              <circle cx={p.x} cy={p.y} r="1" fill="hsl(var(--foreground))" opacity="0.3" />
              <text x={p.x + 3} y={p.y + 1} fill="hsl(var(--muted-foreground))" fontSize="4" opacity="0.5" fontWeight="500">{city.name}</text>
            </g>
          );
        })}

        {/* Basin labels */}
        {[
          { name: "Bacia do Congo", lon: 10.0, lat: -5.5 },
          { name: "Bacia do Kwanza", lon: 10.5, lat: -9.5 },
          { name: "Bacia do Namibe", lon: 9.5, lat: -14.5 },
        ].map(basin => {
          const p = geoToSvg(basin.lon, basin.lat);
          return (
            <text key={basin.name} x={p.x} y={p.y} fill="hsl(var(--primary))" fontSize="4.5" fontWeight="600" opacity="0.25" textAnchor="middle">{basin.name}</text>
          );
        })}

        {/* Depth zone labels along left edge */}
        {[
          { name: "Ultra-Profundas", lon: 8.2, lat: -5.0 },
          { name: "Profundas", lon: 9.8, lat: -5.0 },
          { name: "Águas Rasas", lon: 11.5, lat: -5.0 },
        ].map(z => {
          const p = geoToSvg(z.lon, z.lat);
          return (
            <text key={z.name} x={p.x} y={p.y} fill="hsl(var(--muted-foreground))" fontSize="3" fontWeight="600" opacity="0.3" textAnchor="middle"
              transform={`rotate(-90, ${p.x}, ${p.y})`}>{z.name}</text>
          );
        })}

        {/* Block dots */}
        {blocks.map((block) => {
          const pos = blockPositions[block.id];
          if (!pos) return null;

          const isSelected = selectedBlockId === block.id;
          const isHovered = hoveredBlockId === block.id;
          const isHighlighted = isSelected || isHovered;
          const baseR = block.dailyProduction > 100000 ? 3.5 : block.dailyProduction > 0 ? 2.5 : 1.8;
          const r = isHighlighted ? baseR + 1.2 : baseR;

          return (
            <g
              key={block.id}
              className="cursor-pointer"
              onClick={() => handleClick(block, pos.x, pos.y)}
              onMouseEnter={() => onBlockHover(block.id)}
              onMouseLeave={() => onBlockHover(null)}
            >
              <circle cx={pos.x} cy={pos.y} r={r + 3} fill="transparent" />

              {isHighlighted && (
                <circle
                  cx={pos.x} cy={pos.y} r={r + 2.5}
                  fill="none"
                  stroke={phaseColorMap[block.phase]}
                  strokeWidth="0.5"
                  opacity="0.5"
                  className={isSelected ? "animate-pulse" : ""}
                />
              )}

              <circle
                cx={pos.x} cy={pos.y} r={r}
                fill={phaseColorMap[block.phase]}
                opacity={isHighlighted ? 1 : 0.7}
                style={{
                  filter: isHighlighted ? `drop-shadow(0 0 5px ${phaseColorMap[block.phase]})` : "none",
                }}
                className="transition-all duration-200"
              />

              {(isHighlighted || block.dailyProduction > 100000) && (
                <text
                  x={pos.x}
                  y={pos.y - r - 2}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize="3.5"
                  fontWeight="700"
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
          className="absolute z-50 glass-card p-2.5 rounded-lg shadow-lg border border-border/50 min-w-[160px]"
          style={{
            left: `${Math.min(85, Math.max(15, (tooltip.x / 210) * 100))}%`,
            top: `${Math.max(5, (tooltip.y / 255) * 100 - 10)}%`,
            transform: "translateX(-50%)",
          }}
          onMouseLeave={handleCloseTooltip}
        >
          <div className="font-bold text-xs">{tooltip.block.name}</div>
          <div className="text-[10px] text-muted-foreground">{tooltip.block.operator}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: phaseColorMap[tooltip.block.phase] }} />
            <span className="text-[10px]">{tooltip.block.phase} · {tooltip.block.waterDepth}</span>
            {tooltip.block.dailyProduction > 0 && (
              <span className="text-[10px] font-mono ml-auto">{(tooltip.block.dailyProduction / 1000).toFixed(0)}k BOPD</span>
            )}
          </div>
          {tooltip.block.concession.length > 0 && (
            <div className="mt-1 pt-1 border-t border-border/30">
              {tooltip.block.concession.slice(0, 3).map((p, i) => (
                <div key={i} className="text-[9px] text-muted-foreground flex justify-between gap-3">
                  <span className="truncate">{p.name}{p.isOperator ? " (OP)" : ""}</span>
                  <span className="font-mono shrink-0">{p.share.toFixed(0)}%</span>
                </div>
              ))}
              {tooltip.block.concession.length > 3 && (
                <div className="text-[9px] text-muted-foreground">+{tooltip.block.concession.length - 3} mais</div>
              )}
            </div>
          )}
          <button
            className="mt-2 w-full text-[10px] text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1 py-1 border border-primary/30 rounded hover:bg-primary/10 transition-colors"
            onClick={() => navigate(`/block/${tooltip.block.id}`)}
          >
            Mais Detalhes →
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 left-3 3xl:top-4 3xl:left-4 glass-card p-2 3xl:p-3 rounded-lg z-20 max-w-[calc(100%-1.5rem)]">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {(["Production", "Development", "Exploration", "Bidding", "Suspended"] as BlockPhase[]).map(phase => (
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
