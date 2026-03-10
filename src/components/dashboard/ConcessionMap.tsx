import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { type OilBlock, type BlockPhase } from "@/data/angolaBlocks";
import { Layers, Map, Satellite, Mountain, Waves, TreePine, ChevronDown, ChevronUp } from "lucide-react";
import angolaSatellite from "@/assets/angola-satellite.jpg";

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

// ── Bidding year color scheme matching PDF ──
type BiddingYear = 2019 | 2020 | 2021 | 2023 | 2025;
const biddingYearColors: Record<BiddingYear, string> = {
  2019: "#8fbc8f", // sage green (Licitação 2019)
  2020: "#d2b48c", // tan/sandy (Licitação 2020)
  2021: "#a9c8d8", // light steel blue (Licitação 2021)
  2023: "#c9a9d8", // light purple (Licitação 2023)
  2025: "#d8c9a9", // wheat (Licitação 2025)
};

// Bidding year mapping per block (from ANPG PDF table)
const blockBiddingYear: Record<string, BiddingYear> = {
  // Licitação 2019 — Benguela
  "block-10": 2019, "block-41": 2019, "block-11": 2019, "block-12": 2019, "block-13": 2019,
  // Licitação 2019 — Namibe
  "block-27": 2019, "block-28": 2019, "block-29": 2019, "block-42": 2019, "block-43": 2019,
  // Licitação 2019 — Baixo Congo onshore
  "block-con1": 2019, "block-con5": 2019, "block-con6": 2019,
  // Licitação 2020 — Kwanza onshore
  "block-kon5": 2020, "block-kon6": 2020, "block-kon8": 2020, "block-kon9": 2020,
  // Licitação 2021 — Baixo Congo deep
  "block-14": 2021, "block-31": 2021, "block-32": 2021,
  // Licitação 2021 — Kwanza
  "block-33": 2021, "block-34": 2021,
  // Licitação 2021 — BL7-9
  "block-7": 2021, "block-8": 2021, "block-9": 2021,
  // Licitação 2023 — Baixo Congo onshore
  "block-con2": 2023, "block-con3": 2023, "block-con4": 2023, "block-con8": 2023,
  // Licitação 2023 — Kwanza onshore
  "block-kon1": 2023, "block-kon3": 2023, "block-kon4": 2023, "block-kon10": 2023,
  "block-kon11": 2023, "block-kon14": 2023, "block-kon15": 2023,
  // Licitação 2025
  "block-22": 2025, "block-23": 2025, "block-25": 2025, "block-35": 2025, "block-36": 2025,
  "block-37": 2025, "block-38": 2025, "block-24": 2025, "block-26": 2025, "block-39": 2025, "block-40": 2025,
};

// ── Projection: WGS84 → SVG  ──
// Map covers 7°30'E–15°E, 4.5°S–17.5°S (matches PDF extent)
const LON_MIN = 7.5;
const LON_MAX = 15.0;
const LAT_MIN = -4.5;
const LAT_MAX = -17.5;
const VB_W = 300;
const VB_H = 400;

const geoToSvg = (lon: number, lat: number) => ({
  x: ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VB_W,
  y: ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * VB_H,
});

// ── Corrected block positions matching ANPG PDF map ──
const blockGeoPositions: Record<string, [number, number]> = {
  // Cabinda onshore
  // Cabinda onshore
  "cabinda-norte":  [12.40, -5.10],
  "cabinda-centro": [12.35, -5.35],
  "cabinda-sul":    [12.25, -5.55],
  "fs-associacoes": [12.20, -5.20],
  "fst-associacoes":[12.22, -5.40],
  // Congo onshore (CON blocks) — near Soyo, per PDF grid
  "block-con1":     [12.65, -5.85],
  "block-con2":     [12.85, -5.85],
  "block-con3":     [13.05, -5.85],
  "block-con4":     [12.70, -6.05],
  "block-con5":     [12.90, -6.05],
  "block-con6":     [13.10, -6.10],
  "block-con7":     [13.25, -6.10],
  "block-con8":     [13.35, -6.25],
  "block-con9":     [13.50, -6.25],
  "block-con10":    [13.55, -7.20],
  // Kwanza onshore (KON blocks) — tight grid near Luanda/Dondo per PDF
  "block-kon1":     [13.45, -9.05],
  "block-kon2":     [13.60, -9.05],
  "block-kon3":     [13.75, -9.05],
  "block-kon4":     [13.25, -9.25],
  "block-kon5":     [13.42, -9.25],
  "block-kon6":     [13.58, -9.25],
  "block-kon7":     [13.75, -9.25],
  "block-kon8":     [13.42, -9.48],
  "block-kon9":     [13.58, -9.48],
  "block-kon10":    [13.75, -9.48],
  "block-kon11":    [13.30, -9.70],
  "block-kon12":    [13.47, -9.70],
  "block-kon13":    [13.63, -9.70],
  "block-kon14":    [13.80, -9.70],
  "block-kon15":    [13.25, -9.92],
  "block-kon16":    [13.42, -10.05],
  "block-kon17":    [13.62, -10.05],
  "block-kon18":    [13.85, -10.10],
  "block-kon19":    [13.42, -10.28],
  "block-kon20":    [13.62, -10.28],
  "block-kon21":    [13.95, -10.55],
  "block-kon22":    [14.15, -10.55],
  "block-kon23":    [14.35, -11.00],
  // Shallow water — along coast, matching PDF BL labels
  "block-0":        [11.50, -5.90],   // BL0
  "block-1":        [12.00, -6.05],   // BL1, next to BL15
  "block-2-05":     [12.20, -6.50],   // BL2
  "block-3":        [12.00, -7.00],   // BL3
  "block-3-05a":    [12.15, -7.20],
  "block-3-24":     [12.00, -7.40],
  "block-3-15":     [12.00, -7.70],
  "block-2-15":     [11.80, -7.30],
  "block-4-05":     [12.20, -7.50],   // BL4
  "block-5-06":     [12.10, -8.80],   // BL5
  "block-6-24":     [12.00, -9.30],   // BL6
  "block-7":        [12.05, -9.90],   // BL7
  "block-8":        [12.25, -10.80],  // BL8
  "block-9":        [12.45, -11.30],  // BL9
  "block-10":       [12.10, -12.50],  // BL10
  "block-11":       [12.00, -14.00],  // BL11
  "block-12":       [11.55, -15.55],  // BL12
  "block-13":       [11.35, -16.25],  // BL13
  // Deep water — per PDF positions
  "block-14":       [10.85, -6.20],   // BL14
  "block-15":       [11.75, -6.05],   // BL15, adjacent to BL1
  "block-15-06":    [11.20, -6.80],
  "block-15-14":    [11.50, -6.50],
  "block-16":       [10.75, -6.85],   // BL16
  "block-17":       [11.20, -7.35],   // BL17
  "block-18":       [10.80, -8.40],   // BL18
  "block-19":       [10.50, -9.35],   // BL19
  "block-20":       [11.00, -9.85],   // BL20
  "block-21":       [11.00, -10.55],  // BL21
  // Ultra-deep water — per PDF
  "block-31":       [9.25, -6.55],    // BL31
  "block-31-21":    [9.40, -7.10],
  "block-32":       [9.50, -7.30],    // BL32
  "block-46":       [8.35, -6.10],    // BL46
  "block-47":       [8.55, -6.80],    // BL47
  "block-48":       [8.90, -7.40],    // BL48
  "block-49":       [8.95, -8.10],    // BL49
  "block-50":       [9.20, -8.90],    // BL50
  // Bidding blocks — deep water column
  "block-22":       [11.00, -11.20],  // BL22
  "block-23":       [11.30, -11.70],  // BL23
  "block-24":       [11.50, -12.35],  // BL24
  "block-25":       [11.25, -12.85],  // BL25
  "block-26":       [11.00, -13.35],  // BL26
  "block-27":       [11.00, -14.10],  // BL27
  "block-28":       [11.15, -14.70],  // BL28
  "block-29":       [11.00, -15.25],  // BL29
  "block-30":       [10.80, -15.85],  // BL30
  // Bidding blocks — ultra-deep column
  "block-33":       [10.00, -8.50],   // BL33
  "block-34":       [10.50, -9.00],   // BL34
  "block-35":       [10.00, -9.70],   // BL35
  "block-36":       [10.00, -10.25],  // BL36
  "block-37":       [9.80, -10.75],   // BL37
  "block-38":       [10.00, -11.25],  // BL38
  "block-39":       [10.15, -11.85],  // BL39
  "block-40":       [10.75, -12.25],  // BL40
  "block-41":       [10.50, -13.05],  // BL41
  "block-42":       [10.30, -13.55],  // BL42
  "block-43":       [10.30, -14.40],  // BL43
  "block-44":       [10.50, -15.35],  // BL44
  "block-45":       [10.00, -16.25],  // BL45
};

const getBlockSvgPos = (block: OilBlock) => {
  const geo = blockGeoPositions[block.id];
  if (geo) return geoToSvg(geo[0], geo[1]);
  return { x: block.mapPosition.x * 3, y: block.mapPosition.y * 4 };
};

// ── Angola coastline (refined from PDF) ──
const coastlinePoints: [number, number][] = [
  [12.35, -4.45],
  [12.50, -4.55],
  [12.45, -5.00],
  [12.25, -5.50],
  [12.10, -5.80],
  [12.35, -5.85],
  [13.00, -5.80],
  [12.85, -6.15],
  [12.60, -6.50],
  [12.80, -7.00],
  [13.00, -7.50],
  [13.15, -8.00],
  [13.30, -8.50],
  [13.50, -8.80],
  [13.35, -9.20],
  [13.10, -9.80],
  [12.90, -10.50],
  [13.20, -11.20],
  [13.50, -12.00],
  [13.35, -12.50],
  [12.90, -13.00],
  [12.60, -13.50],
  [12.30, -14.00],
  [12.10, -14.50],
  [11.90, -15.00],
  [11.80, -15.50],
  [11.90, -16.00],
  [12.10, -16.50],
  [12.30, -17.00],
  [12.50, -17.30],
];

const toSvgPath = (pts: [number, number][]) =>
  pts.map(([lon, lat], i) => {
    const p = geoToSvg(lon, lat);
    return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");

// Inland border
const borderPoints: [number, number][] = [
  [12.35, -4.45], [13.50, -4.35], [15.00, -4.40],
  [15.00, -5.00], [15.00, -6.00], [15.00, -7.50],
  [15.00, -8.00], [15.00, -9.00], [15.00, -10.00],
  [15.00, -11.00], [15.00, -12.00], [15.00, -13.00],
  [15.00, -14.00], [15.00, -15.00], [15.00, -16.00],
  [15.00, -17.00], [14.00, -17.30], [12.50, -17.30],
];

// Cabinda enclave
const cabindaPoints: [number, number][] = [
  [12.15, -4.45], [12.80, -4.35], [13.10, -4.50], [13.05, -5.00],
  [12.55, -5.30], [12.25, -5.60], [12.10, -5.80], [11.90, -5.30], [12.05, -4.80], [12.15, -4.45],
];

// ── Offshore maritime limits ──
const makeOffsetLine = (offsetDeg: number): [number, number][] =>
  coastlinePoints.map(([lon, lat]) => [lon - offsetDeg, lat]);

const limit12M = makeOffsetLine(0.2);
const limit24M = makeOffsetLine(0.4);
const limit200M = makeOffsetLine(3.4);
const limit350M = makeOffsetLine(5.8);

// ── Cities from PDF ──
const cities: { name: string; lon: number; lat: number; size?: "major" | "minor" }[] = [
  { name: "Cabinda", lon: 12.55, lat: -5.00, size: "major" },
  { name: "Soyo", lon: 12.80, lat: -6.00, size: "major" },
  { name: "M'banza Congo", lon: 14.25, lat: -6.25 },
  { name: "Ambriz", lon: 13.30, lat: -7.80 },
  { name: "Songo", lon: 14.50, lat: -7.40 },
  { name: "Uíge", lon: 14.85, lat: -7.60 },
  { name: "Luanda", lon: 13.30, lat: -8.85, size: "major" },
  { name: "Caxito", lon: 13.65, lat: -8.55 },
  { name: "Dondo", lon: 14.50, lat: -9.70 },
  { name: "Calulo", lon: 14.90, lat: -9.90 },
  { name: "Sumbe", lon: 13.85, lat: -11.20 },
  { name: "Quibala", lon: 14.85, lat: -10.70 },
  { name: "Waku Kungo", lon: 15.10, lat: -11.30 },
  { name: "Lobito", lon: 13.65, lat: -12.35, size: "major" },
  { name: "Benguela", lon: 13.45, lat: -12.60, size: "major" },
  { name: "Cubal", lon: 14.30, lat: -13.00 },
  { name: "Lubango", lon: 13.50, lat: -14.90 },
  { name: "Chibia", lon: 13.85, lat: -15.10 },
  { name: "Quipungo", lon: 14.50, lat: -14.80 },
  { name: "Tombua", lon: 12.00, lat: -15.80 },
  { name: "Namibe", lon: 12.20, lat: -15.20, size: "major" },
  { name: "Chibemba", lon: 14.80, lat: -15.30 },
  { name: "Cunene", lon: 15.00, lat: -16.00 },
  { name: "Xangongo", lon: 14.90, lat: -16.50 },
];

// ── Natural reserves from PDF ──
const naturalReserves: { name: string; lon: number; lat: number; w: number; h: number }[] = [
  { name: "Reserva Parcial de Búfalo", lon: 14.00, lat: -12.80, w: 0.8, h: 0.5 },
  { name: "R.N. de Chimaulero", lon: 14.40, lat: -13.20, w: 0.6, h: 0.4 },
  { name: "Parque N. do Namibe", lon: 13.50, lat: -15.40, w: 1.2, h: 0.8 },
  { name: "Parque N. de Iona", lon: 13.00, lat: -16.50, w: 1.5, h: 1.0 },
];

// Basin labels
const basins = [
  { name: "Bacia Terrestre\ndo Baixo Congo", lon: 13.30, lat: -5.95 },
  { name: "Bacia do Kwanza", lon: 14.20, lat: -8.80 },
  { name: "Bacia do Namibe", lon: 11.80, lat: -14.50 },
  { name: "Bacia de Benguela", lon: 12.20, lat: -12.00 },
];

// Depth zone labels
const depthZones = [
  { name: "Ultra Deep Water", lon: 8.5, lat: -8.5 },
  { name: "Deep Water", lon: 10.0, lat: -8.5 },
];

export const ConcessionMap = ({
  blocks,
  selectedBlockId,
  hoveredBlockId,
  onBlockClick,
  onBlockHover,
}: ConcessionMapProps) => {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<{ block: OilBlock; x: number; y: number } | null>(null);
  const [showLimits, setShowLimits] = useState(true);
  const [showReserves, setShowReserves] = useState(true);
  const [showCities, setShowCities] = useState(true);
  const [showBasins, setShowBasins] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showBlocks, setShowBlocks] = useState(true);
  const [showSatellite, setShowSatellite] = useState(false);
  const [colorMode, setColorMode] = useState<"phase" | "bidding">("phase");
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);

  const blockPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    blocks.forEach(b => { positions[b.id] = getBlockSvgPos(b); });
    return positions;
  }, [blocks]);

  const handleClick = useCallback((block: OilBlock, svgX: number, svgY: number) => {
    onBlockClick(block);
    setTooltip(prev => prev?.block.id === block.id ? null : { block, x: svgX, y: svgY });
  }, [onBlockClick]);

  const getBlockColor = useCallback((block: OilBlock) => {
    if (colorMode === "bidding") {
      const year = blockBiddingYear[block.id];
      if (year) return biddingYearColors[year];
      return phaseColorMap[block.phase];
    }
    return phaseColorMap[block.phase];
  }, [colorMode]);



  return (
    <div className="relative w-full h-full min-h-[500px]">
      <svg viewBox={`-10 -5 ${VB_W + 20} ${VB_H + 10}`} className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="ocean-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          <pattern id="reserve-hatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M0,4 l4,-4" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect x="-10" y="-5" width={VB_W + 20} height={VB_H + 10} fill="url(#ocean-grad)" />

        {/* Maritime limits */}
        {showLimits && (
          <>
            <path d={toSvgPath(limit350M)} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" strokeDasharray="6 3" opacity="0.25" />
            <path d={toSvgPath(limit200M)} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.4" strokeDasharray="4 2" opacity="0.3" />
            <path d={toSvgPath(limit24M)} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" strokeDasharray="2 2" opacity="0.35" />
            <path d={toSvgPath(limit12M)} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" opacity="0.35" />
            {/* Limit labels */}
            {([
              { label: "350M", pts: limit350M, idx: 4 },
              { label: "200M", pts: limit200M, idx: 6 },
              { label: "24M", pts: limit24M, idx: 8 },
              { label: "12M", pts: limit12M, idx: 8 },
            ] as const).map(({ label, pts, idx }) => {
              const p = geoToSvg(pts[idx][0], pts[idx][1]);
              return (
                <text key={label} x={p.x} y={p.y - 2} fill="hsl(var(--muted-foreground))" fontSize="3" opacity="0.4" textAnchor="middle">{label}</text>
              );
            })}
          </>
        )}

        {/* Landmass */}
        <path
          d={`${toSvgPath(coastlinePoints)} ${toSvgPath(borderPoints.slice().reverse())} Z`}
          fill="hsl(var(--secondary) / 0.3)"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />

        {/* Cabinda enclave */}
        <path d={toSvgPath(cabindaPoints)} fill="hsl(var(--secondary) / 0.35)" stroke="hsl(var(--border))" strokeWidth="0.4" />

        {/* Coastline highlight */}
        <path d={toSvgPath(coastlinePoints)} fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.7" />

        {/* Natural reserves */}
        {showReserves && naturalReserves.map(r => {
          const tl = geoToSvg(r.lon, r.lat);
          const br = geoToSvg(r.lon + r.w, r.lat - r.h);
          return (
            <g key={r.name}>
              <rect x={tl.x} y={tl.y} width={br.x - tl.x} height={br.y - tl.y}
                fill="url(#reserve-hatch)" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" opacity="0.4" rx="1" />
              <text x={tl.x + (br.x - tl.x) / 2} y={tl.y + (br.y - tl.y) / 2 + 1}
                fill="hsl(var(--muted-foreground))" fontSize="2.5" textAnchor="middle" opacity="0.5" fontStyle="italic">
                {r.name}
              </text>
            </g>
          );
        })}

        {/* Cities */}
        {cities.map(city => {
          const p = geoToSvg(city.lon, city.lat);
          const isMajor = city.size === "major";
          return (
            <g key={city.name}>
              <circle cx={p.x} cy={p.y} r={isMajor ? 1.5 : 0.8} fill="hsl(var(--foreground))" opacity={isMajor ? 0.5 : 0.3} />
              <text x={p.x + 2.5} y={p.y + 1} fill="hsl(var(--foreground))" fontSize={isMajor ? 4.5 : 3} fontWeight={isMajor ? "600" : "400"} opacity={isMajor ? 0.6 : 0.4}>
                {city.name}
              </text>
            </g>
          );
        })}

        {/* Basin labels */}
        {basins.map(b => {
          const p = geoToSvg(b.lon, b.lat);
          return b.name.split("\n").map((line, i) => (
            <text key={`${b.name}-${i}`} x={p.x} y={p.y + i * 5} fill="hsl(var(--primary))" fontSize="4" fontWeight="600" opacity="0.2" textAnchor="middle">
              {line}
            </text>
          ));
        })}

        {/* Depth zone labels */}
        {depthZones.map(z => {
          const p = geoToSvg(z.lon, z.lat);
          return (
            <text key={z.name} x={p.x} y={p.y} fill="hsl(var(--muted-foreground))" fontSize="3.5" fontWeight="500" opacity="0.2" textAnchor="middle"
              transform={`rotate(-90, ${p.x}, ${p.y})`}>{z.name}</text>
          );
        })}

        {/* Block markers — all rendered as rectangles matching PDF */}
        {blocks.map((block) => {
          const pos = blockPositions[block.id];
          if (!pos) return null;

          const isSelected = selectedBlockId === block.id;
          const isHovered = hoveredBlockId === block.id;
          const isHighlighted = isSelected || isHovered;
          const color = getBlockColor(block);

          // Size blocks based on type (matching PDF proportions)
          const isKon = block.id.startsWith("block-kon");
          const isCon = block.id.startsWith("block-con");
          const isCabinda = block.id.startsWith("cabinda") || block.id.startsWith("fs");
          const isLargeOffshore = !isKon && !isCon && !isCabinda && block.waterDepth !== "Onshore";

          let w: number, h: number;
          if (isKon) { w = 5; h = 5.5; }
          else if (isCon) { w = 5.5; h = 5; }
          else if (isCabinda) { w = 5; h = 6; }
          else if (block.areaKm2 && block.areaKm2 > 6000) { w = 14; h = 14; }
          else if (block.areaKm2 && block.areaKm2 > 4000) { w = 12; h = 12; }
          else if (isLargeOffshore) { w = 10; h = 11; }
          else { w = 7; h = 8; }

          const hasBiddingYear = !!blockBiddingYear[block.id];
          const isExistingConcession = !hasBiddingYear && (block.phase === "Production" || block.phase === "Development");

          return (
            <g
              key={block.id}
              className="cursor-pointer"
              onClick={() => handleClick(block, pos.x, pos.y)}
              onMouseEnter={() => onBlockHover(block.id)}
              onMouseLeave={() => onBlockHover(null)}
            >
              {/* Hit area */}
              <rect x={pos.x - w - 1} y={pos.y - h - 1} width={(w + 1) * 2} height={(h + 1) * 2} fill="transparent" />

              {/* Selection ring */}
              {isHighlighted && (
                <rect
                  x={pos.x - w - 1.5} y={pos.y - h - 1.5}
                  width={(w + 1.5) * 2} height={(h + 1.5) * 2}
                  fill="none" stroke={color} strokeWidth="0.6" opacity="0.6" rx="0.5"
                  className={isSelected ? "animate-pulse" : ""}
                />
              )}

              {/* Block rectangle */}
              <rect
                x={pos.x - w} y={pos.y - h}
                width={w * 2} height={h * 2}
                fill={color}
                opacity={isHighlighted ? 0.75 : isExistingConcession ? 0.45 : 0.5}
                stroke={isHighlighted ? color : "hsl(var(--border))"}
                strokeWidth={isHighlighted ? "0.6" : "0.3"}
                rx="0.3"
                style={{ filter: isHighlighted ? `drop-shadow(0 0 4px ${color})` : "none" }}
                className="transition-all duration-200"
              />

              {/* Hatching for existing concessions */}
              {isExistingConcession && colorMode === "bidding" && (
                <rect
                  x={pos.x - w} y={pos.y - h}
                  width={w * 2} height={h * 2}
                  fill="url(#reserve-hatch)" opacity="0.3" rx="0.3"
                />
              )}

              {/* Block label inside */}
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize={isKon || isCon || isCabinda ? "2.5" : isHighlighted ? "3.5" : "3"}
                fontWeight={isHighlighted ? "700" : "600"}
                opacity={isHighlighted ? 1 : 0.75}
                className="pointer-events-none"
              >
                {block.name}
              </text>
            </g>
          );
        })}

        {/* Grid lines (graticule) */}
        {[8, 9, 10, 11, 12, 13, 14, 15].map(lon => {
          const p1 = geoToSvg(lon, LAT_MIN);
          const p2 = geoToSvg(lon, LAT_MAX);
          return <line key={`lon-${lon}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="hsl(var(--border))" strokeWidth="0.15" opacity="0.3" />;
        })}
        {[-5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15, -16, -17].map(lat => {
          const p1 = geoToSvg(LON_MIN, lat);
          const p2 = geoToSvg(LON_MAX, lat);
          return <line key={`lat-${lat}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="hsl(var(--border))" strokeWidth="0.15" opacity="0.3" />;
        })}

        {/* Coordinate labels */}
        {[8, 10, 12, 14].map(lon => {
          const p = geoToSvg(lon, LAT_MIN);
          return <text key={`lon-l-${lon}`} x={p.x} y={-1} fill="hsl(var(--muted-foreground))" fontSize="3" textAnchor="middle" opacity="0.4">{lon}°E</text>;
        })}
        {[-5, -7.5, -10, -12.5, -15, -17].map(lat => {
          const p = geoToSvg(LON_MAX, lat);
          return <text key={`lat-l-${lat}`} x={p.x + 8} y={p.y + 1} fill="hsl(var(--muted-foreground))" fontSize="3" opacity="0.4">{Math.abs(lat)}°S</text>;
        })}

        {/* Scale bar */}
        {(() => {
          const p1 = geoToSvg(10, -17);
          const p2 = geoToSvg(12, -17);
          return (
            <g>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.4" />
              <text x={(p1.x + p2.x) / 2} y={p1.y + 5} fill="hsl(var(--muted-foreground))" fontSize="3" textAnchor="middle" opacity="0.4">~220 km</text>
            </g>
          );
        })()}

        {/* North arrow */}
        <g transform={`translate(15, 15)`}>
          <line x1="0" y1="8" x2="0" y2="0" stroke="hsl(var(--foreground))" strokeWidth="0.6" opacity="0.4" />
          <polygon points="-2,3 0,0 2,3" fill="hsl(var(--foreground))" opacity="0.4" />
          <text x="0" y="-2" fill="hsl(var(--foreground))" fontSize="4" fontWeight="700" textAnchor="middle" opacity="0.4">N</text>
        </g>
      </svg>

      {/* Tooltip popup */}
      {tooltip && (
        <div
          className="absolute z-50 glass-card p-2.5 rounded-lg shadow-lg border border-border/50 min-w-[160px]"
          style={{
            left: `${Math.min(85, Math.max(15, (tooltip.x / (VB_W + 10)) * 100))}%`,
            top: `${Math.max(5, (tooltip.y / (VB_H + 5)) * 100 - 10)}%`,
            transform: "translateX(-50%)",
          }}
          onMouseLeave={() => setTooltip(null)}
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
          {blockBiddingYear[tooltip.block.id] && (
            <div className="text-[10px] mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: biddingYearColors[blockBiddingYear[tooltip.block.id]] }} />
              <span className="text-muted-foreground">Licitação {blockBiddingYear[tooltip.block.id]}</span>
            </div>
          )}
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
      <div className="absolute top-3 left-3 3xl:top-4 3xl:left-4 glass-card p-2.5 3xl:p-3 rounded-lg z-20 max-w-[220px]">
        {/* Color mode toggle */}
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => setColorMode("phase")}
            className={`text-[8px] px-1.5 py-0.5 rounded transition-colors ${colorMode === "phase" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
          >
            Fase
          </button>
          <button
            onClick={() => setColorMode("bidding")}
            className={`text-[8px] px-1.5 py-0.5 rounded transition-colors ${colorMode === "bidding" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
          >
            Licitação
          </button>
        </div>

        {colorMode === "phase" ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {(["Production", "Development", "Exploration", "Bidding", "Suspended"] as BlockPhase[]).map(phase => (
              <div key={phase} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: phaseColorMap[phase] }} />
                <span className="text-[9px] text-muted-foreground">{phase}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {([2019, 2020, 2021, 2023, 2025] as BiddingYear[]).map(year => (
              <div key={year} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: biddingYearColors[year] }} />
                <span className="text-[9px] text-muted-foreground">{year}</span>
              </div>
            ))}
          </div>
        )}

        {/* Layer toggles */}
        <div className="mt-2 pt-1.5 border-t border-border/30 flex flex-col gap-1">
          <label className="flex items-center gap-1.5 text-[9px] text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={showLimits} onChange={e => setShowLimits(e.target.checked)} className="w-2.5 h-2.5 rounded" />
            Limites Offshore
          </label>
          <label className="flex items-center gap-1.5 text-[9px] text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={showReserves} onChange={e => setShowReserves(e.target.checked)} className="w-2.5 h-2.5 rounded" />
            Reservas Naturais
          </label>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 text-[8px] text-muted-foreground opacity-40">
        DATUM WGS84 · ANPG
      </div>
    </div>
  );
};
