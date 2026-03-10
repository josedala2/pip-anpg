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

// ── Corrected block positions matching ANPG PDF map (WGS84) ──
// Calibrated against grid: 7°30'E–15°E, 5°S–17°S
const blockGeoPositions: Record<string, [number, number]> = {
  // Cabinda onshore — clustered near 12.3°E, 5.0-5.5°S
  "cabinda-norte":  [12.40, -5.00],
  "cabinda-centro": [12.30, -5.20],
  "cabinda-sul":    [12.20, -5.40],
  "fs-associacoes": [12.15, -5.10],
  "fst-associacoes":[12.18, -5.30],

  // Congo onshore (CON blocks) — east of Soyo, ~12.5-13.5°E
  "block-con1":     [12.55, -5.80],
  "block-con2":     [12.70, -5.80],
  "block-con3":     [12.90, -5.80],
  "block-con4":     [12.60, -6.00],
  "block-con5":     [12.80, -5.80],
  "block-con6":     [13.05, -6.10],
  "block-con7":     [13.25, -6.10],
  "block-con8":     [13.05, -6.30],
  "block-con9":     [13.25, -6.30],
  "block-con10":    [13.45, -7.20],

  // Kwanza onshore (KON blocks) — grid near Luanda/Dondo, ~9-10.5°S
  "block-kon1":     [13.40, -8.95],
  "block-kon2":     [13.55, -8.95],
  "block-kon3":     [13.70, -8.95],
  "block-kon4":     [13.20, -9.15],
  "block-kon5":     [13.35, -9.20],
  "block-kon6":     [13.50, -9.20],
  "block-kon7":     [13.65, -9.20],
  "block-kon8":     [13.35, -9.42],
  "block-kon9":     [13.50, -9.42],
  "block-kon10":    [13.65, -9.42],
  "block-kon11":    [13.25, -9.62],
  "block-kon12":    [13.40, -9.62],
  "block-kon13":    [13.55, -9.62],
  "block-kon14":    [13.70, -9.62],
  "block-kon15":    [13.15, -9.82],
  "block-kon16":    [13.35, -9.92],
  "block-kon17":    [13.55, -9.92],
  "block-kon18":    [13.80, -10.00],
  "block-kon19":    [13.35, -10.15],
  "block-kon20":    [13.55, -10.15],
  "block-kon21":    [13.80, -10.55],
  "block-kon22":    [14.00, -10.55],
  "block-kon23":    [14.25, -11.00],

  // Shallow water — coastal strip, matching PDF block adjacencies
  "block-0":        [11.50, -5.85],   // BL0 — north of BL15, west of Soyo
  "block-1":        [12.05, -5.95],   // BL1 — adjacent east of BL15
  "block-2-05":     [12.30, -6.45],   // BL2
  "block-3":        [12.20, -7.00],   // BL3
  "block-3-05a":    [12.10, -6.70],   // Between BL2 and BL3
  "block-3-24":     [12.10, -7.30],
  "block-3-15":     [12.05, -7.60],
  "block-2-15":     [11.85, -7.20],
  "block-4-05":     [12.30, -7.50],   // BL4
  "block-5-06":     [12.15, -8.70],   // BL5
  "block-6-24":     [12.05, -9.30],   // BL6
  "block-7":        [12.10, -9.95],   // BL7
  "block-8":        [12.30, -10.80],  // BL8
  "block-9":        [12.50, -11.30],  // BL9
  "block-10":       [12.15, -12.50],  // BL10
  "block-11":       [12.00, -14.00],  // BL11
  "block-12":       [11.60, -15.65],  // BL12
  "block-13":       [11.40, -16.30],  // BL13

  // Deep water — second column from coast
  "block-14":       [10.90, -6.10],   // BL14 — west of BL0
  "block-15":       [11.70, -5.95],   // BL15 — between BL14 and BL1
  "block-15-06":    [11.25, -6.80],   // BL15/06
  "block-15-14":    [11.50, -6.45],   // BL15/14
  "block-16":       [10.70, -6.85],   // BL16
  "block-17":       [11.25, -7.30],   // BL17
  "block-18":       [10.85, -8.40],   // BL18
  "block-19":       [10.55, -9.30],   // BL19
  "block-20":       [11.05, -9.85],   // BL20
  "block-21":       [11.05, -10.55],  // BL21

  // Ultra-deep water — western column
  "block-46":       [8.30, -6.15],    // BL46 — far west
  "block-31":       [9.20, -6.50],    // BL31
  "block-47":       [8.55, -6.70],    // BL47
  "block-48":       [9.05, -7.20],    // BL48
  "block-31-21":    [9.35, -7.00],    // BL31/21
  "block-32":       [9.50, -7.15],    // BL32
  "block-49":       [9.00, -8.00],    // BL49
  "block-50":       [9.25, -8.90],    // BL50

  // Bidding — deep water column (east of ultra-deep)
  "block-22":       [11.05, -11.15],  // BL22
  "block-23":       [11.30, -11.55],  // BL23
  "block-24":       [11.45, -12.30],  // BL24
  "block-25":       [11.25, -12.75],  // BL25
  "block-26":       [11.00, -13.25],  // BL26
  "block-27":       [11.00, -14.05],  // BL27
  "block-28":       [11.15, -14.70],  // BL28
  "block-29":       [11.00, -15.20],  // BL29
  "block-30":       [10.80, -15.90],  // BL30

  // Bidding — ultra-deep column (Namibe/Benguela)
  "block-33":       [10.05, -8.50],   // BL33
  "block-34":       [10.45, -9.00],   // BL34
  "block-35":       [10.05, -9.65],   // BL35
  "block-36":       [10.05, -10.20],  // BL36
  "block-37":       [9.85, -10.70],   // BL37
  "block-38":       [10.05, -11.15],  // BL38
  "block-39":       [10.25, -11.75],  // BL39
  "block-40":       [10.75, -12.20],  // BL40
  "block-41":       [10.50, -13.00],  // BL41
  "block-42":       [10.35, -13.55],  // BL42
  "block-43":       [10.30, -14.35],  // BL43
  "block-44":       [10.50, -15.30],  // BL44
  "block-45":       [10.00, -16.20],  // BL45
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
  const [showConcessions, setShowConcessions] = useState(true);
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
          {/* Concession hatching — diagonal lines matching PDF legend */}
          <pattern id="concession-hatch" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="3" stroke="hsl(var(--foreground))" strokeWidth="0.6" opacity="0.35" />
          </pattern>
          <pattern id="concession-hatch-cross" patternUnits="userSpaceOnUse" width="3" height="3">
            <line x1="0" y1="0" x2="3" y2="3" stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.3" />
            <line x1="3" y1="0" x2="0" y2="3" stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.15" />
          </pattern>
          <clipPath id="map-clip">
            <rect x="-10" y="-5" width={VB_W + 20} height={VB_H + 10} />
          </clipPath>
        </defs>

        {/* Background: satellite or gradient */}
        {showSatellite ? (
          <image
            href={angolaSatellite}
            x="-10" y="-5"
            width={VB_W + 20} height={VB_H + 10}
            preserveAspectRatio="xMidYMid slice"
            opacity="0.85"
            clipPath="url(#map-clip)"
          />
        ) : (
          <rect x="-10" y="-5" width={VB_W + 20} height={VB_H + 10} fill="url(#ocean-grad)" />
        )}

        {/* Maritime limits */}
        {showLimits && (
          <>
            <path d={toSvgPath(limit350M)} fill="none" stroke={showSatellite ? "rgba(255,255,255,0.35)" : "hsl(var(--muted-foreground))"} strokeWidth="0.5" strokeDasharray="6 3" opacity="0.5" />
            <path d={toSvgPath(limit200M)} fill="none" stroke={showSatellite ? "rgba(255,255,255,0.45)" : "hsl(var(--primary))"} strokeWidth="0.6" strokeDasharray="4 2" opacity="0.45" />
            <path d={toSvgPath(limit24M)} fill="none" stroke={showSatellite ? "rgba(255,255,255,0.4)" : "hsl(var(--muted-foreground))"} strokeWidth="0.45" strokeDasharray="2 2" opacity="0.5" />
            <path d={toSvgPath(limit12M)} fill="none" stroke={showSatellite ? "rgba(255,255,255,0.4)" : "hsl(var(--muted-foreground))"} strokeWidth="0.4" opacity="0.5" />
            {/* Limit labels with background for readability */}
            {([
              { label: "350 M.N.", pts: limit350M, idx: 4 },
              { label: "ZEE (200 M.N.)", pts: limit200M, idx: 6 },
              { label: "24 M.N.", pts: limit24M, idx: 8 },
              { label: "12 M.N.", pts: limit12M, idx: 8 },
            ] as const).map(({ label, pts, idx }) => {
              const p = geoToSvg(pts[idx][0], pts[idx][1]);
              const textW = label.length * 1.8;
              return (
                <g key={label}>
                  <rect x={p.x - textW / 2 - 1} y={p.y - 6} width={textW + 2} height={5} rx="1"
                    fill={showSatellite ? "rgba(0,0,0,0.5)" : "hsl(var(--background))"} opacity="0.7" />
                  <text x={p.x} y={p.y - 2.5} fill={showSatellite ? "white" : "hsl(var(--foreground))"} fontSize="3.2" opacity="0.8" textAnchor="middle" fontWeight="500">{label}</text>
                </g>
              );
            })}
          </>
        )}

        {/* Landmass */}
        {!showSatellite && (
          <>
            <path
              d={`${toSvgPath(coastlinePoints)} ${toSvgPath(borderPoints.slice().reverse())} Z`}
              fill="hsl(var(--secondary) / 0.4)"
              stroke="hsl(var(--foreground))"
              strokeWidth="0.7"
              opacity="0.9"
            />
            <path d={toSvgPath(cabindaPoints)} fill="hsl(var(--secondary) / 0.45)" stroke="hsl(var(--foreground))" strokeWidth="0.6" opacity="0.9" />
            <path d={toSvgPath(coastlinePoints)} fill="none" stroke="hsl(var(--primary))" strokeWidth="0.9" opacity="0.5" />
          </>
        )}
        {showSatellite && (
          <path d={toSvgPath(coastlinePoints)} fill="none" stroke="white" strokeWidth="0.8" opacity="0.6" />
        )}

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
        {showCities && cities.map(city => {
          const p = geoToSvg(city.lon, city.lat);
          const isMajor = city.size === "major";
          const textColor = showSatellite ? "white" : "hsl(var(--foreground))";
          return (
            <g key={city.name}>
              {/* Background halo for readability */}
              <circle cx={p.x} cy={p.y} r={isMajor ? 2.5 : 1.5} fill={showSatellite ? "rgba(0,0,0,0.4)" : "hsl(var(--background))"} opacity="0.5" />
              <circle cx={p.x} cy={p.y} r={isMajor ? 1.8 : 1} fill={textColor} opacity={isMajor ? 0.85 : 0.65} />
              {/* Text shadow/outline for contrast */}
              {showSatellite && (
                <text x={p.x + 3} y={p.y + 1.2} fill="black" fontSize={isMajor ? 5 : 3.5} fontWeight={isMajor ? "700" : "500"} opacity="0.5"
                  stroke="black" strokeWidth="0.8" strokeLinejoin="round">{city.name}</text>
              )}
              <text x={p.x + 3} y={p.y + 1.2} fill={textColor} fontSize={isMajor ? 5 : 3.5} fontWeight={isMajor ? "700" : "500"} opacity={isMajor ? 0.95 : 0.8}>
                {city.name}
              </text>
            </g>
          );
        })}

        {/* Basin labels */}
        {showBasins && basins.map(b => {
          const p = geoToSvg(b.lon, b.lat);
          return b.name.split("\n").map((line, i) => (
            <g key={`${b.name}-${i}`}>
              {showSatellite && (
                <text x={p.x} y={p.y + i * 5.5} fill="black" fontSize="4.5" fontWeight="700" opacity="0.4" textAnchor="middle"
                  stroke="black" strokeWidth="0.6" strokeLinejoin="round">{line}</text>
              )}
              <text x={p.x} y={p.y + i * 5.5} fill={showSatellite ? "white" : "hsl(var(--primary))"} fontSize="4.5" fontWeight="700" opacity={showSatellite ? 0.7 : 0.35} textAnchor="middle"
                letterSpacing="0.5">
                {line}
              </text>
            </g>
          ));
        })}

        {/* Depth zone labels */}
        {showBasins && depthZones.map(z => {
          const p = geoToSvg(z.lon, z.lat);
          return (
            <text key={z.name} x={p.x} y={p.y} fill={showSatellite ? "white" : "hsl(var(--muted-foreground))"} fontSize="3.5" fontWeight="500" opacity={showSatellite ? 0.4 : 0.2} textAnchor="middle"
              transform={`rotate(-90, ${p.x}, ${p.y})`}>{z.name}</text>
          );
        })}

        {/* Block markers — all rendered as rectangles matching PDF */}
        {showBlocks && blocks.map((block) => {
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

              {/* Hatching overlay for existing concessions (Concessões Petrolíferas) */}
              {isExistingConcession && showConcessions && (
                <rect
                  x={pos.x - w} y={pos.y - h}
                  width={w * 2} height={h * 2}
                  fill="url(#concession-hatch)" opacity="0.7" rx="0.3"
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
        {showGrid && (
          <>
            {[8, 9, 10, 11, 12, 13, 14, 15].map(lon => {
              const p1 = geoToSvg(lon, LAT_MIN);
              const p2 = geoToSvg(lon, LAT_MAX);
              return <line key={`lon-${lon}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={showSatellite ? "rgba(255,255,255,0.3)" : "hsl(var(--border))"} strokeWidth="0.2" opacity="0.35" />;
            })}
            {[-5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15, -16, -17].map(lat => {
              const p1 = geoToSvg(LON_MIN, lat);
              const p2 = geoToSvg(LON_MAX, lat);
              return <line key={`lat-${lat}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={showSatellite ? "rgba(255,255,255,0.3)" : "hsl(var(--border))"} strokeWidth="0.2" opacity="0.35" />;
            })}

            {/* Coordinate labels — with background pill */}
            {[8, 9, 10, 11, 12, 13, 14].map(lon => {
              const p = geoToSvg(lon, LAT_MIN);
              return (
                <g key={`lon-l-${lon}`}>
                  <rect x={p.x - 5} y={-4.5} width={10} height={4.5} rx="1" fill={showSatellite ? "rgba(0,0,0,0.45)" : "hsl(var(--background))"} opacity="0.6" />
                  <text x={p.x} y={-1} fill={showSatellite ? "white" : "hsl(var(--foreground))"} fontSize="3.2" textAnchor="middle" opacity="0.75" fontWeight="500">{lon}°E</text>
                </g>
              );
            })}
            {[-5, -7, -9, -11, -13, -15, -17].map(lat => {
              const p = geoToSvg(LON_MAX, lat);
              return (
                <g key={`lat-l-${lat}`}>
                  <rect x={p.x + 2} y={p.y - 2.5} width={14} height={4.5} rx="1" fill={showSatellite ? "rgba(0,0,0,0.45)" : "hsl(var(--background))"} opacity="0.6" />
                  <text x={p.x + 9} y={p.y + 1} fill={showSatellite ? "white" : "hsl(var(--foreground))"} fontSize="3.2" opacity="0.75" textAnchor="middle" fontWeight="500">{Math.abs(lat)}°S</text>
                </g>
              );
            })}
          </>
        )}

        {/* Scale bar */}
        {(() => {
          const p1 = geoToSvg(10, -17);
          const p2 = geoToSvg(12, -17);
          return (
            <g>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="hsl(var(--foreground))" strokeWidth="0.7" opacity="0.5" />
              <line x1={p1.x} y1={p1.y - 1.5} x2={p1.x} y2={p1.y + 1.5} stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.5" />
              <line x1={p2.x} y1={p2.y - 1.5} x2={p2.x} y2={p2.y + 1.5} stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.5" />
              <text x={(p1.x + p2.x) / 2} y={p1.y + 5} fill="hsl(var(--foreground))" fontSize="3.2" textAnchor="middle" opacity="0.55" fontWeight="500">~220 km</text>
            </g>
          );
        })()}

        {/* North arrow */}
        <g transform={`translate(15, 15)`}>
          <line x1="0" y1="8" x2="0" y2="0" stroke="hsl(var(--foreground))" strokeWidth="0.8" opacity="0.6" />
          <polygon points="-2.5,3.5 0,-0.5 2.5,3.5" fill="hsl(var(--primary))" opacity="0.7" />
          <text x="0" y="-3" fill="hsl(var(--foreground))" fontSize="4.5" fontWeight="800" textAnchor="middle" opacity="0.6">N</text>
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

      {/* Layers Panel */}
      <div className="absolute top-3 left-3 3xl:top-4 3xl:left-4 z-20 flex flex-col gap-2">
        {/* Layer toggle button */}
        <button
          onClick={() => setLayersPanelOpen(!layersPanelOpen)}
          className="glass-card p-2 rounded-lg flex items-center gap-1.5 hover:bg-secondary/60 transition-colors"
          title="Camadas"
        >
          <Layers className="w-4 h-4 text-foreground" />
          <span className="text-[10px] font-semibold text-foreground">Camadas</span>
          {layersPanelOpen ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </button>

        {layersPanelOpen && (
          <div className="glass-card p-3 rounded-lg min-w-[200px] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Base map */}
            <div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Mapa Base</div>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowSatellite(false)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] transition-colors ${!showSatellite ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  <Map className="w-3 h-3" />
                  Vectorial
                </button>
                <button
                  onClick={() => setShowSatellite(true)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] transition-colors ${showSatellite ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  <Satellite className="w-3 h-3" />
                  Satélite
                </button>
              </div>
            </div>

            {/* Color mode */}
            <div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Coloração</div>
              <div className="flex gap-1">
                <button
                  onClick={() => setColorMode("phase")}
                  className={`text-[10px] px-2 py-1 rounded transition-colors ${colorMode === "phase" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  Fase
                </button>
                <button
                  onClick={() => setColorMode("bidding")}
                  className={`text-[10px] px-2 py-1 rounded transition-colors ${colorMode === "bidding" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  Licitação
                </button>
              </div>
            </div>

            {/* Layer toggles */}
            <div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Camadas</div>
              <div className="flex flex-col gap-1.5">
                {([
                  { key: "blocks", label: "Blocos", icon: <Mountain className="w-3 h-3" />, checked: showBlocks, set: setShowBlocks },
                  { key: "concessions", label: "Concessões Petrolíferas", icon: <Layers className="w-3 h-3" />, checked: showConcessions, set: setShowConcessions },
                  { key: "limits", label: "Limites Offshore", icon: <Waves className="w-3 h-3" />, checked: showLimits, set: setShowLimits },
                  { key: "cities", label: "Cidades", icon: <Map className="w-3 h-3" />, checked: showCities, set: setShowCities },
                  { key: "basins", label: "Bacias & Zonas", icon: <Mountain className="w-3 h-3" />, checked: showBasins, set: setShowBasins },
                  { key: "reserves", label: "Reservas Naturais", icon: <TreePine className="w-3 h-3" />, checked: showReserves, set: setShowReserves },
                  { key: "grid", label: "Grelha (Graticule)", icon: <Layers className="w-3 h-3" />, checked: showGrid, set: setShowGrid },
                ] as const).map(layer => (
                  <label key={layer.key} className="flex items-center gap-2 text-[10px] text-foreground cursor-pointer hover:bg-secondary/40 rounded px-1 py-0.5 transition-colors">
                    <input
                      type="checkbox"
                      checked={layer.checked}
                      onChange={e => layer.set(e.target.checked)}
                      className="w-3 h-3 rounded accent-primary"
                    />
                    {layer.icon}
                    <span>{layer.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-border/40">
              <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2">Legenda</div>
              {colorMode === "phase" ? (
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {(["Production", "Development", "Exploration", "Bidding", "Suspended"] as BlockPhase[]).map(phase => (
                    <div key={phase} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm border border-border/30" style={{ backgroundColor: phaseColorMap[phase] }} />
                      <span className="text-[10px] text-foreground/80 font-medium">{phase}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {([2019, 2020, 2021, 2023, 2025] as BiddingYear[]).map(year => (
                    <div key={year} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm border border-border/30" style={{ backgroundColor: biddingYearColors[year] }} />
                      <span className="text-[10px] text-foreground/80 font-medium">{year}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Concession hatch legend */}
              <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-border/20">
                <svg width="14" height="14" className="shrink-0">
                  <defs>
                    <pattern id="legend-hatch" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
                    </pattern>
                  </defs>
                  <rect width="14" height="14" fill="hsl(var(--muted-foreground) / 0.15)" rx="1.5" stroke="hsl(var(--border))" strokeWidth="0.5" />
                  <rect width="14" height="14" fill="url(#legend-hatch)" rx="1.5" className="text-foreground" />
                </svg>
                <span className="text-[10px] text-foreground/80 font-medium">Concessão Petrolífera Existente</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 text-[8px] text-muted-foreground opacity-40">
        DATUM WGS84 · ANPG
      </div>
    </div>
  );
};
