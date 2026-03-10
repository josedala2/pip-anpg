import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polygon, Polyline, Popup, CircleMarker, Tooltip as LeafletTooltip, Rectangle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { type OilBlock, type BlockPhase } from "@/data/angolaBlocks";
import { Layers, Map as MapIcon, Satellite, Mountain, Waves, TreePine, ChevronDown, ChevronUp } from "lucide-react";

interface ConcessionMapProps {
  blocks: OilBlock[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  onBlockClick: (block: OilBlock) => void;
  onBlockHover: (blockId: string | null) => void;
}

const phaseColors: Record<BlockPhase, string> = {
  Production: "#22c55e",
  Development: "#3b82f6",
  Exploration: "#f59e0b",
  Suspended: "#6b7280",
  Bidding: "#a855f7",
};

type BiddingYear = 2019 | 2020 | 2021 | 2023 | 2025;
const biddingYearColors: Record<BiddingYear, string> = {
  2019: "#8fbc8f",
  2020: "#d2b48c",
  2021: "#a9c8d8",
  2023: "#c9a9d8",
  2025: "#d8c9a9",
};

const blockBiddingYear: Record<string, BiddingYear> = {
  "block-10": 2019, "block-41": 2019, "block-11": 2019, "block-12": 2019, "block-13": 2019,
  "block-27": 2019, "block-28": 2019, "block-29": 2019, "block-42": 2019, "block-43": 2019,
  "block-con1": 2019, "block-con5": 2019, "block-con6": 2019,
  "block-kon5": 2020, "block-kon6": 2020, "block-kon8": 2020, "block-kon9": 2020,
  "block-14": 2021, "block-31": 2021, "block-32": 2021,
  "block-33": 2021, "block-34": 2021,
  "block-7": 2021, "block-8": 2021, "block-9": 2021,
  "block-con2": 2023, "block-con3": 2023, "block-con4": 2023, "block-con8": 2023,
  "block-kon1": 2023, "block-kon3": 2023, "block-kon4": 2023, "block-kon10": 2023,
  "block-kon11": 2023, "block-kon14": 2023, "block-kon15": 2023,
  "block-22": 2025, "block-23": 2025, "block-25": 2025, "block-35": 2025, "block-36": 2025,
  "block-37": 2025, "block-38": 2025, "block-24": 2025, "block-26": 2025, "block-39": 2025, "block-40": 2025,
};

// ── Area-based polygon generation using real ANPG concession areas (km²) ──
// center: [lat, lon], area: km², aspect: width/height ratio
const blockGeoData: Record<string, { center: [number, number]; area: number; aspect?: number }> = {
  // Cabinda onshore
  "cabinda-norte":   { center: [-4.725, 12.30], area: 1800, aspect: 1.15 },
  "cabinda-centro":  { center: [-5.025, 12.225], area: 1600, aspect: 1.20 },
  "cabinda-sul":     { center: [-5.30, 12.125], area: 1500, aspect: 1.15 },
  "fs-associacoes":  { center: [-4.80, 12.175], area: 800, aspect: 1.25 },
  "fst-associacoes": { center: [-5.10, 12.125], area: 700, aspect: 1.25 },

  // Baixo Congo onshore (CON) — ~600-710 km² each (from PDF)
  "block-con1":  { center: [-5.75, 12.50], area: 700 },
  "block-con2":  { center: [-5.75, 12.70], area: 690 },
  "block-con3":  { center: [-5.95, 12.70], area: 680 },
  "block-con4":  { center: [-5.75, 12.90], area: 710 },
  "block-con5":  { center: [-5.95, 12.90], area: 683 },
  "block-con6":  { center: [-5.97, 13.10], area: 709 },
  "block-con7":  { center: [-5.97, 13.32], area: 720 },
  "block-con8":  { center: [-6.22, 13.10], area: 700 },
  "block-con9":  { center: [-6.22, 13.32], area: 710 },
  "block-con10": { center: [-7.075, 13.375], area: 1200, aspect: 1.0 },

  // Kwanza onshore (KON) — ~1,024 km² each (from PDF)
  "block-kon1":  { center: [-8.925, 13.375], area: 1024 },
  "block-kon2":  { center: [-8.925, 13.525], area: 1024 },
  "block-kon3":  { center: [-8.925, 13.675], area: 1024 },
  "block-kon4":  { center: [-9.075, 13.225], area: 1024 },
  "block-kon5":  { center: [-9.175, 13.325], area: 1024 },
  "block-kon6":  { center: [-9.175, 13.475], area: 1024 },
  "block-kon7":  { center: [-9.175, 13.625], area: 1024 },
  "block-kon8":  { center: [-9.375, 13.325], area: 1024 },
  "block-kon9":  { center: [-9.375, 13.475], area: 1024 },
  "block-kon10": { center: [-9.375, 13.625], area: 1024 },
  "block-kon11": { center: [-9.575, 13.225], area: 1024 },
  "block-kon12": { center: [-9.575, 13.375], area: 1024 },
  "block-kon13": { center: [-9.575, 13.525], area: 1024 },
  "block-kon14": { center: [-9.575, 13.675], area: 1024 },
  "block-kon15": { center: [-9.775, 13.125], area: 1024 },
  "block-kon16": { center: [-9.875, 13.325], area: 1024 },
  "block-kon17": { center: [-9.875, 13.525], area: 1024 },
  "block-kon18": { center: [-9.95, 13.80], area: 1024 },
  "block-kon19": { center: [-10.125, 13.35], area: 1024 },
  "block-kon20": { center: [-10.125, 13.55], area: 1024 },
  "block-kon21": { center: [-10.50, 13.80], area: 1024 },
  "block-kon22": { center: [-10.50, 14.00], area: 1024 },
  "block-kon23": { center: [-10.95, 14.25], area: 1024 },

  // Shallow water — coastal
  "block-0":     { center: [-5.85, 11.50], area: 5200, aspect: 0.85 },
  "block-1":     { center: [-5.95, 12.20], area: 2500, aspect: 0.80 },
  "block-2-05":  { center: [-6.425, 12.35], area: 2800, aspect: 0.90 },
  "block-3-05a": { center: [-6.575, 12.075], area: 2200, aspect: 0.95 },
  "block-3":     { center: [-6.875, 12.275], area: 3200, aspect: 0.90 },
  "block-3-24":  { center: [-7.30, 12.10], area: 2400, aspect: 1.00 },
  "block-3-15":  { center: [-7.60, 12.00], area: 2200, aspect: 1.00 },
  "block-2-15":  { center: [-7.225, 11.80], area: 2600, aspect: 0.90 },
  "block-4-05":  { center: [-7.425, 12.35], area: 3800, aspect: 0.90 },
  "block-5-06":  { center: [-8.65, 12.15], area: 4200, aspect: 1.40 },
  "block-6-24":  { center: [-9.30, 12.05], area: 3800, aspect: 1.20 },
  "block-7":     { center: [-9.95, 12.10], area: 4500, aspect: 1.15 },
  "block-8":     { center: [-10.75, 12.30], area: 4800, aspect: 1.15 },
  "block-9":     { center: [-11.30, 12.50], area: 4600, aspect: 1.10 },
  "block-10":    { center: [-12.475, 12.15], area: 4780, aspect: 1.05 },
  "block-11":    { center: [-13.95, 11.95], area: 5074, aspect: 1.30 },
  "block-12":    { center: [-15.55, 11.60], area: 4219, aspect: 1.15 },
  "block-13":    { center: [-16.25, 11.40], area: 4513, aspect: 1.15 },

  // Deep water
  "block-14":    { center: [-5.90, 10.85], area: 5500, aspect: 0.90 },
  "block-15":    { center: [-5.75, 11.70], area: 4000, aspect: 1.20 },
  "block-15-06": { center: [-6.65, 11.20], area: 4200, aspect: 0.85 },
  "block-15-14": { center: [-6.40, 11.475], area: 2200, aspect: 1.40 },
  "block-16":    { center: [-6.75, 10.60], area: 6500, aspect: 0.85 },
  "block-17":    { center: [-7.40, 11.25], area: 5000, aspect: 0.85 },
  "block-18":    { center: [-8.35, 10.85], area: 6500, aspect: 1.00 },
  "block-19":    { center: [-9.30, 10.55], area: 5800, aspect: 1.10 },
  "block-20":    { center: [-9.85, 11.05], area: 5200, aspect: 1.00 },
  "block-21":    { center: [-10.55, 11.05], area: 5200, aspect: 1.00 },

  // Ultra-deep water
  "block-46":    { center: [-5.95, 8.30], area: 7500, aspect: 1.10 },
  "block-31":    { center: [-6.15, 9.20], area: 5500, aspect: 1.15 },
  "block-47":    { center: [-6.65, 8.55], area: 6500, aspect: 1.00 },
  "block-48":    { center: [-7.15, 9.05], area: 6200, aspect: 1.05 },
  "block-31-21": { center: [-6.85, 9.375], area: 3000, aspect: 1.10 },
  "block-32":    { center: [-6.85, 9.50], area: 4200, aspect: 1.05 },
  "block-49":    { center: [-7.95, 9.00], area: 7200, aspect: 1.05 },
  "block-50":    { center: [-8.80, 9.25], area: 6500, aspect: 1.05 },

  // Bidding — deep south (from PDF)
  "block-22":    { center: [-11.15, 11.05], area: 5000, aspect: 1.00 },
  "block-23":    { center: [-11.50, 11.325], area: 4500, aspect: 1.10 },
  "block-24":    { center: [-12.225, 11.45], area: 5200, aspect: 1.05 },
  "block-25":    { center: [-12.675, 11.225], area: 4600, aspect: 1.05 },
  "block-26":    { center: [-13.225, 10.975], area: 4800, aspect: 1.05 },
  "block-27":    { center: [-13.95, 10.95], area: 4909, aspect: 1.00 },
  "block-28":    { center: [-14.625, 11.15], area: 4848, aspect: 1.05 },
  "block-29":    { center: [-15.15, 10.975], area: 5700, aspect: 1.00 },
  "block-30":    { center: [-15.85, 10.80], area: 5400, aspect: 1.00 },

  // Bidding — Kwanza/Benguela ultra-deep (from PDF)
  "block-33":    { center: [-8.50, 10.05], area: 6000, aspect: 1.05 },
  "block-34":    { center: [-8.95, 10.40], area: 5500, aspect: 1.10 },
  "block-35":    { center: [-9.60, 10.05], area: 5800, aspect: 1.05 },
  "block-36":    { center: [-10.15, 10.05], area: 5800, aspect: 1.05 },
  "block-37":    { center: [-10.65, 9.85], area: 5600, aspect: 1.00 },
  "block-38":    { center: [-11.10, 10.05], area: 5800, aspect: 1.05 },
  "block-39":    { center: [-11.70, 10.25], area: 5600, aspect: 1.05 },
  "block-40":    { center: [-12.175, 10.725], area: 5500, aspect: 1.05 },
  "block-41":    { center: [-12.925, 10.50], area: 6775, aspect: 1.05 },
  "block-42":    { center: [-13.475, 10.35], area: 7502, aspect: 1.05 },
  "block-43":    { center: [-14.30, 10.30], area: 7067, aspect: 1.00 },
  "block-44":    { center: [-15.275, 10.50], area: 6200, aspect: 1.05 },
  "block-45":    { center: [-16.10, 10.00], area: 7500, aspect: 1.10 },
};

// Convert area (km²) + center to polygon corners [lat, lon][]
const areaToPolygon = (
  center: [number, number],
  areaKm2: number,
  aspect = 1.0
): [number, number][] => {
  const [lat, lon] = center;
  const kmPerDegLat = 111.0;
  const kmPerDegLon = 111.0 * Math.cos((lat * Math.PI) / 180);
  const sideKm = Math.sqrt(areaKm2);
  const heightKm = sideKm / Math.sqrt(aspect);
  const widthKm = sideKm * Math.sqrt(aspect);
  const hh = heightKm / kmPerDegLat / 2;
  const hw = widthKm / kmPerDegLon / 2;
  return [
    [lat - hh, lon - hw],
    [lat - hh, lon + hw],
    [lat + hh, lon + hw],
    [lat + hh, lon - hw],
  ];
};

// Pre-compute all block polygons
const blockPolygons: Record<string, [number, number][]> = {};
for (const [id, data] of Object.entries(blockGeoData)) {
  blockPolygons[id] = areaToPolygon(data.center, data.area, data.aspect);
}

// Center of polygon for labels
const getPolygonCenter = (coords: [number, number][]): [number, number] => {
  const latSum = coords.reduce((s, c) => s + c[0], 0);
  const lonSum = coords.reduce((s, c) => s + c[1], 0);
  return [latSum / coords.length, lonSum / coords.length];
};

// ── Angola land border (simplified WGS84) ──
const angolaBorder: [number, number][] = [
  // Northern border (Congo/DRC)
  [-4.38, 12.20], [-4.43, 12.58], [-4.80, 12.80], [-5.00, 12.85], [-5.10, 12.88],
  [-5.25, 12.18], [-5.50, 12.20], [-5.80, 12.10], [-5.85, 12.35],
  // Coast down to Soyo, then inland border with DRC
  [-5.80, 13.07], [-5.90, 13.35], [-6.10, 13.50], [-6.30, 14.00], [-6.00, 14.50],
  [-5.85, 15.00], [-5.85, 16.00], [-5.90, 16.50], [-5.98, 17.10],
  [-6.20, 17.40], [-6.50, 17.70], [-7.00, 17.90], [-7.30, 18.00],
  [-7.50, 18.50], [-7.80, 19.00], [-8.00, 19.50], [-8.20, 19.80],
  [-7.90, 20.50], [-7.50, 21.00], [-7.30, 21.50], [-7.00, 21.80],
  [-6.50, 22.00], [-6.20, 22.20], [-6.00, 22.50], [-5.90, 23.00],
  [-5.90, 23.50], [-6.00, 24.00], [-6.30, 24.00],
  // Eastern border with Zambia
  [-7.00, 24.00], [-8.00, 24.00], [-8.50, 24.00], [-9.00, 24.00],
  [-10.00, 24.00], [-11.00, 24.00], [-12.00, 24.00], [-13.00, 24.00],
  // Southern border with Namibia
  [-13.00, 23.50], [-13.00, 22.50], [-13.50, 21.00], [-14.50, 19.00],
  [-16.00, 17.50], [-17.00, 16.50], [-17.26, 15.70], [-17.39, 14.50],
  [-17.35, 13.50], [-17.26, 12.30], [-17.25, 11.75],
  // Coast northward
  [-16.50, 12.00], [-15.80, 11.80], [-15.20, 11.75], [-14.50, 12.10],
  [-14.00, 12.30], [-13.50, 12.60], [-13.00, 12.90], [-12.50, 13.35],
  [-12.00, 13.50], [-11.20, 13.20], [-10.50, 12.90], [-9.80, 13.10],
  [-9.20, 13.35], [-8.80, 13.50], [-8.50, 13.30], [-8.00, 13.15],
  [-7.50, 13.00], [-7.00, 12.80], [-6.50, 12.60], [-6.15, 12.85],
  [-5.80, 13.07],
];

// Cabinda exclave border
const cabindaBorder: [number, number][] = [
  [-4.38, 12.20], [-4.30, 12.50], [-4.30, 12.85], [-4.38, 13.10],
  [-4.55, 13.20], [-4.80, 13.10], [-5.00, 12.85], [-5.10, 12.88],
  [-5.25, 12.18], [-4.80, 12.15], [-4.55, 12.10], [-4.38, 12.20],
];

// ── Maritime limits (offset from coastline) ──
const coastlineCoords: [number, number][] = [
  [-4.45, 12.35], [-4.55, 12.50], [-5.00, 12.45], [-5.50, 12.25], [-5.80, 12.10],
  [-5.85, 12.35], [-5.80, 13.00], [-6.15, 12.85], [-6.50, 12.60], [-7.00, 12.80],
  [-7.50, 13.00], [-8.00, 13.15], [-8.50, 13.30], [-8.80, 13.50], [-9.20, 13.35],
  [-9.80, 13.10], [-10.50, 12.90], [-11.20, 13.20], [-12.00, 13.50], [-12.50, 13.35],
  [-13.00, 12.90], [-13.50, 12.60], [-14.00, 12.30], [-14.50, 12.10], [-15.00, 11.90],
  [-15.50, 11.80], [-16.00, 11.90], [-16.50, 12.10], [-17.00, 12.30], [-17.30, 12.50],
];

const makeOffsetLine = (offsetDeg: number): [number, number][] =>
  coastlineCoords.map(([lat, lon]) => [lat, lon - offsetDeg]);

const limit12M = makeOffsetLine(0.2);
const limit24M = makeOffsetLine(0.4);
const limit200M = makeOffsetLine(3.4);
const limit350M = makeOffsetLine(5.8);

// Cities from PDF
const cities: { name: string; lat: number; lon: number; major?: boolean }[] = [
  { name: "Cabinda", lat: -5.00, lon: 12.55, major: true },
  { name: "Soyo", lat: -6.00, lon: 12.80, major: true },
  { name: "M'banza Congo", lat: -6.25, lon: 14.25 },
  { name: "Ambriz", lat: -7.80, lon: 13.30 },
  { name: "Songo", lat: -7.40, lon: 14.50 },
  { name: "Uíge", lat: -7.60, lon: 14.85 },
  { name: "Luanda", lat: -8.85, lon: 13.30, major: true },
  { name: "Caxito", lat: -8.55, lon: 13.65 },
  { name: "Dondo", lat: -9.70, lon: 14.50 },
  { name: "Calulo", lat: -9.90, lon: 14.90 },
  { name: "Sumbe", lat: -11.20, lon: 13.85 },
  { name: "Quibala", lat: -10.70, lon: 14.85 },
  { name: "Waku Kungo", lat: -11.35, lon: 15.10 },
  { name: "Lobito", lat: -12.35, lon: 13.65, major: true },
  { name: "Benguela", lat: -12.60, lon: 13.45, major: true },
  { name: "Cubal", lat: -13.00, lon: 14.30 },
  { name: "Lubango", lat: -14.90, lon: 13.50 },
  { name: "Chibia", lat: -15.10, lon: 13.85 },
  { name: "Quipungo", lat: -14.80, lon: 14.50 },
  { name: "Namibe", lat: -15.20, lon: 12.20, major: true },
  { name: "Tombua", lat: -15.80, lon: 12.00 },
  { name: "Chibemba", lat: -15.30, lon: 14.80 },
  { name: "Xangongo", lat: -16.50, lon: 14.90 },
];

// Basin labels
const basins = [
  { name: "Bacia Terrestre do Baixo Congo", lat: -5.95, lon: 13.30 },
  { name: "Bacia do Kwanza", lat: -9.10, lon: 14.20 },
  { name: "Bacia do Namibe", lat: -14.50, lon: 11.80 },
  { name: "Bacia de Benguela", lat: -12.00, lon: 12.20 },
];

// Depth zone labels
const depthZones = [
  { name: "Ultra Deep Water", lat: -8.5, lon: 9.0 },
  { name: "Deep Water", lat: -8.5, lon: 10.5 },
];

// Natural reserves from PDF
const naturalReserves = [
  { name: "Reserva Parcial de Búfalo", lat: -12.80, lon: 14.00, w: 0.8, h: 0.5 },
  { name: "R.N. de Chimaulero", lat: -13.20, lon: 14.40, w: 0.6, h: 0.4 },
  { name: "Parque N. do Namibe", lat: -15.20, lon: 13.30, w: 1.2, h: 0.8 },
  { name: "Parque N. de Iona", lat: -16.20, lon: 12.60, w: 1.5, h: 1.0 },
];

// Tile layer switcher
const TileSwitch = ({ showSatellite }: { showSatellite: boolean }) => {
  return showSatellite ? (
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      attribution="Tiles &copy; Esri"
      maxZoom={18}
    />
  ) : (
    <TileLayer
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      maxZoom={19}
    />
  );
};

export const ConcessionMap = ({
  blocks,
  selectedBlockId,
  hoveredBlockId,
  onBlockClick,
  onBlockHover,
}: ConcessionMapProps) => {
  const navigate = useNavigate();
  const [showLimits, setShowLimits] = useState(true);
  const [showReserves, setShowReserves] = useState(true);
  const [showCities, setShowCities] = useState(true);
  const [showBasins, setShowBasins] = useState(true);
  const [showBlocks, setShowBlocks] = useState(true);
  const [showConcessions, setShowConcessions] = useState(true);
  const [showSatellite, setShowSatellite] = useState(true);
  const [colorMode, setColorMode] = useState<"phase" | "bidding">("phase");
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);

  const getBlockColor = useCallback((block: OilBlock) => {
    if (colorMode === "bidding") {
      const year = blockBiddingYear[block.id];
      if (year) return biddingYearColors[year];
    }
    return phaseColors[block.phase];
  }, [colorMode]);

  const center: [number, number] = [-10.5, 11.5];

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <MapContainer
        center={center}
        zoom={5}
        minZoom={4}
        maxZoom={12}
        className="w-full h-full z-0"
        style={{ background: "#0a1628" }}
        zoomControl={false}
        attributionControl={false}
        maxBounds={[[-20, 5], [-2, 18]]}
      >
        <TileSwitch showSatellite={showSatellite} />

        {/* Angola land borders */}
        <Polyline
          positions={angolaBorder}
          pathOptions={{ color: "#fbbf24", weight: 2, opacity: 0.8, dashArray: undefined }}
        />
        <Polyline
          positions={cabindaBorder}
          pathOptions={{ color: "#fbbf24", weight: 2, opacity: 0.8, dashArray: undefined }}
        />

        {/* Maritime limits — 12M, 24M, 200M (ZEE), 350M */}
        {showLimits && (
          <>
            <Polyline positions={limit12M} pathOptions={{ color: "#e2e8f0", weight: 1.2, dashArray: "4 4", opacity: 0.6 }}>
              <LeafletTooltip sticky className="leaflet-depth-label"><span className="text-[9px]">12 M.N.</span></LeafletTooltip>
            </Polyline>
            <Polyline positions={limit24M} pathOptions={{ color: "#cbd5e1", weight: 1.5, dashArray: "6 4", opacity: 0.65 }}>
              <LeafletTooltip sticky className="leaflet-depth-label"><span className="text-[9px]">24 M.N.</span></LeafletTooltip>
            </Polyline>
            <Polyline positions={limit200M} pathOptions={{ color: "#ef4444", weight: 2.5, dashArray: "10 5", opacity: 0.75 }}>
              <LeafletTooltip sticky className="leaflet-depth-label"><span className="text-[9px] font-bold">ZEE (200 M.N.)</span></LeafletTooltip>
            </Polyline>
            <Polyline positions={limit350M} pathOptions={{ color: "#a78bfa", weight: 1.8, dashArray: "12 6", opacity: 0.55 }}>
              <LeafletTooltip sticky className="leaflet-depth-label"><span className="text-[9px]">350 M.N.</span></LeafletTooltip>
            </Polyline>
          </>
        )}

        {/* Natural reserves */}
        {showReserves && naturalReserves.map(r => (
          <Rectangle
            key={r.name}
            bounds={[[r.lat, r.lon], [r.lat - r.h, r.lon + r.w]]}
            pathOptions={{ color: "#6b7280", weight: 1, fillColor: "#22c55e", fillOpacity: 0.08, dashArray: "3 3" }}
          >
            <LeafletTooltip permanent direction="center" className="leaflet-reserve-label">
              <span className="text-[9px] italic opacity-70">{r.name}</span>
            </LeafletTooltip>
          </Rectangle>
        ))}

        {/* City markers */}
        {showCities && cities.map(city => (
          <CircleMarker
            key={city.name}
            center={[city.lat, city.lon]}
            radius={city.major ? 5 : 3}
            pathOptions={{
              color: "white",
              weight: city.major ? 2 : 1,
              fillColor: city.major ? "#f4323f" : "#e2e8f0",
              fillOpacity: city.major ? 0.9 : 0.7,
            }}
          >
            <LeafletTooltip permanent direction="right" offset={[8, 0]} className="leaflet-city-label">
              <span className={`font-semibold ${city.major ? "text-[11px]" : "text-[9px] opacity-80"}`}>
                {city.name}
              </span>
            </LeafletTooltip>
          </CircleMarker>
        ))}

        {/* Basin labels */}
        {showBasins && basins.map(b => (
          <CircleMarker key={b.name} center={[b.lat, b.lon]} radius={0} pathOptions={{ opacity: 0 }}>
            <LeafletTooltip permanent direction="center" className="leaflet-basin-label">
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-50">{b.name}</span>
            </LeafletTooltip>
          </CircleMarker>
        ))}

        {/* Depth zone labels */}
        {showBasins && depthZones.map(z => (
          <CircleMarker key={z.name} center={[z.lat, z.lon]} radius={0} pathOptions={{ opacity: 0 }}>
            <LeafletTooltip permanent direction="center" className="leaflet-depth-label">
              <span className="text-[9px] font-medium tracking-widest uppercase opacity-40">{z.name}</span>
            </LeafletTooltip>
          </CircleMarker>
        ))}

        {/* Block polygons */}
        {showBlocks && blocks.map(block => {
          const polygon = blockPolygons[block.id];
          if (!polygon) return null;
          const center = getPolygonCenter(polygon);
          const isSelected = selectedBlockId === block.id;
          const isHovered = hoveredBlockId === block.id;
          const isHighlighted = isSelected || isHovered;
          const color = getBlockColor(block);
          const hasBiddingYear = !!blockBiddingYear[block.id];
          const isExistingConcession = !hasBiddingYear && (block.phase === "Production" || block.phase === "Development");

          return (
            <Polygon
              key={block.id}
              positions={polygon}
              pathOptions={{
                color: isHighlighted ? "white" : color,
                weight: isHighlighted ? 2.5 : 1,
                fillColor: color,
                fillOpacity: isHighlighted ? 0.7 : isExistingConcession ? 0.35 : 0.5,
                dashArray: isExistingConcession && showConcessions ? "4 3" : undefined,
              }}
              eventHandlers={{
                click: () => onBlockClick(block),
                mouseover: () => onBlockHover(block.id),
                mouseout: () => onBlockHover(null),
              }}
            >
              <LeafletTooltip permanent direction="center" className="leaflet-block-label">
                <span className="font-bold">{block.name}</span>
              </LeafletTooltip>
              <Popup className="leaflet-block-popup" maxWidth={280} minWidth={200}>
                <div className="p-1">
                  <div className="font-bold text-sm mb-0.5">{block.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{block.operator}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: phaseColors[block.phase] }} />
                    <span className="text-xs">{block.phase} · {block.waterDepth}</span>
                    {block.dailyProduction > 0 && (
                      <span className="text-xs font-mono ml-auto font-semibold">{(block.dailyProduction / 1000).toFixed(0)}k BOPD</span>
                    )}
                  </div>
                  {blockBiddingYear[block.id] && (
                    <div className="text-xs flex items-center gap-1.5 mb-1">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: biddingYearColors[blockBiddingYear[block.id]] }} />
                      <span className="text-gray-500">Licitação {blockBiddingYear[block.id]}</span>
                    </div>
                  )}
                  {block.concession.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-200">
                      {block.concession.slice(0, 4).map((p, i) => (
                        <div key={i} className="text-[10px] text-gray-500 flex justify-between gap-3">
                          <span className="truncate">{p.name}{p.isOperator ? " (OP)" : ""}</span>
                          <span className="font-mono shrink-0">{p.share.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    className="mt-2 w-full text-xs text-red-600 hover:text-red-500 font-semibold flex items-center justify-center gap-1 py-1.5 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                    onClick={() => navigate(`/block/${block.id}`)}
                  >
                    Mais Detalhes →
                  </button>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>

      {/* Layers Panel */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setLayersPanelOpen(!layersPanelOpen)}
          className="bg-background/90 backdrop-blur-lg border border-border shadow-lg p-2.5 rounded-lg flex items-center gap-1.5 hover:bg-secondary/60 transition-colors"
          title="Camadas"
        >
          <Layers className="w-4 h-4 text-foreground" />
          <span className="text-[11px] font-semibold text-foreground">Camadas</span>
          {layersPanelOpen ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </button>

        {layersPanelOpen && (
          <div className="bg-background/95 backdrop-blur-xl border border-border shadow-xl p-3.5 rounded-lg min-w-[220px] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Base map */}
            <div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Mapa Base</div>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowSatellite(false)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors ${!showSatellite ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  <MapIcon className="w-3 h-3" />
                  OpenStreetMap
                </button>
                <button
                  onClick={() => setShowSatellite(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors ${showSatellite ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
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
                  className={`text-[10px] px-2.5 py-1.5 rounded-md font-medium transition-colors ${colorMode === "phase" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  Fase
                </button>
                <button
                  onClick={() => setColorMode("bidding")}
                  className={`text-[10px] px-2.5 py-1.5 rounded-md font-medium transition-colors ${colorMode === "bidding" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  Licitação
                </button>
              </div>
            </div>

            {/* Layer toggles */}
            <div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Camadas</div>
              <div className="flex flex-col gap-1">
                {([
                  { key: "blocks", label: "Blocos", icon: <Mountain className="w-3 h-3" />, checked: showBlocks, set: setShowBlocks },
                  { key: "concessions", label: "Concessões Petrolíferas", icon: <Layers className="w-3 h-3" />, checked: showConcessions, set: setShowConcessions },
                  { key: "limits", label: "Limites Marítimos", icon: <Waves className="w-3 h-3" />, checked: showLimits, set: setShowLimits },
                  { key: "cities", label: "Cidades", icon: <MapIcon className="w-3 h-3" />, checked: showCities, set: setShowCities },
                  { key: "basins", label: "Bacias & Zonas", icon: <Mountain className="w-3 h-3" />, checked: showBasins, set: setShowBasins },
                  { key: "reserves", label: "Reservas Naturais", icon: <TreePine className="w-3 h-3" />, checked: showReserves, set: setShowReserves },
                ] as const).map(layer => (
                  <label key={layer.key} className="flex items-center gap-2 text-[10px] text-foreground cursor-pointer hover:bg-secondary/40 rounded px-1.5 py-1 transition-colors">
                    <input
                      type="checkbox"
                      checked={layer.checked}
                      onChange={e => layer.set(e.target.checked)}
                      className="w-3 h-3 rounded accent-primary"
                    />
                    {layer.icon}
                    <span className="font-medium">{layer.label}</span>
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
                      <span className="w-3 h-3 rounded-sm border border-border/30" style={{ backgroundColor: phaseColors[phase] }} />
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
                <span className="text-[10px] text-foreground/80 font-medium">Concessão Existente</span>
              </div>
              {/* Maritime limits legend */}
              {showLimits && (
                <div className="mt-2 pt-1.5 border-t border-border/20 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-0 border-t border-dashed border-gray-400" />
                    <span className="text-[9px] text-foreground/60">12 M.N.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-0 border-t border-dashed border-gray-500" />
                    <span className="text-[9px] text-foreground/60">24 M.N.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-0 border-t-2 border-dashed border-red-400" />
                    <span className="text-[9px] text-foreground/60">ZEE (200 M.N.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-0 border-t border-dashed border-slate-500" />
                    <span className="text-[9px] text-foreground/60">350 M.N.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 z-[1000] bg-background/70 backdrop-blur-sm px-2 py-1 rounded text-[9px] text-muted-foreground border border-border/30">
        DATUM WGS84 · ANPG · 3371-NOV-19-GIS-GAD
      </div>
    </div>
  );
};
