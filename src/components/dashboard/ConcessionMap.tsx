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

// ── Block polygon corners [lat, lon][] — traced from ANPG PDF (DATUM WGS84) ──
const blockPolygons: Record<string, [number, number][]> = {
  // Cabinda onshore
  "cabinda-norte":  [[-4.55, 12.10], [-4.55, 12.50], [-4.90, 12.50], [-4.90, 12.10]],
  "cabinda-centro": [[-4.90, 12.00], [-4.90, 12.45], [-5.15, 12.45], [-5.15, 12.00]],
  "cabinda-sul":    [[-5.15, 11.90], [-5.15, 12.35], [-5.45, 12.35], [-5.45, 11.90]],
  "fs-associacoes": [[-4.70, 12.05], [-4.70, 12.30], [-4.90, 12.30], [-4.90, 12.05]],
  "fst-associacoes":[[-5.00, 12.00], [-5.00, 12.25], [-5.20, 12.25], [-5.20, 12.00]],

  // Baixo Congo onshore (CON)
  "block-con1": [[-5.65, 12.40], [-5.65, 12.60], [-5.85, 12.60], [-5.85, 12.40]],
  "block-con2": [[-5.65, 12.60], [-5.65, 12.80], [-5.85, 12.80], [-5.85, 12.60]],
  "block-con3": [[-5.85, 12.60], [-5.85, 12.80], [-6.05, 12.80], [-6.05, 12.60]],
  "block-con4": [[-5.65, 12.80], [-5.65, 13.00], [-5.85, 13.00], [-5.85, 12.80]],
  "block-con5": [[-5.85, 12.80], [-5.85, 13.00], [-6.05, 13.00], [-6.05, 12.80]],
  "block-con6": [[-5.85, 13.00], [-5.85, 13.20], [-6.10, 13.20], [-6.10, 13.00]],
  "block-con7": [[-5.85, 13.20], [-5.85, 13.45], [-6.10, 13.45], [-6.10, 13.20]],
  "block-con8": [[-6.10, 13.00], [-6.10, 13.20], [-6.35, 13.20], [-6.35, 13.00]],
  "block-con9": [[-6.10, 13.20], [-6.10, 13.45], [-6.35, 13.45], [-6.35, 13.20]],
  "block-con10":[[-6.90, 13.20], [-6.90, 13.55], [-7.25, 13.55], [-7.25, 13.20]],

  // Kwanza onshore (KON) — regular grid
  "block-kon1": [[-8.85, 13.30], [-8.85, 13.45], [-9.00, 13.45], [-9.00, 13.30]],
  "block-kon2": [[-8.85, 13.45], [-8.85, 13.60], [-9.00, 13.60], [-9.00, 13.45]],
  "block-kon3": [[-8.85, 13.60], [-8.85, 13.75], [-9.00, 13.75], [-9.00, 13.60]],
  "block-kon4": [[-9.00, 13.15], [-9.00, 13.30], [-9.15, 13.30], [-9.15, 13.15]],
  "block-kon5": [[-9.10, 13.25], [-9.10, 13.40], [-9.25, 13.40], [-9.25, 13.25]],
  "block-kon6": [[-9.10, 13.40], [-9.10, 13.55], [-9.25, 13.55], [-9.25, 13.40]],
  "block-kon7": [[-9.10, 13.55], [-9.10, 13.70], [-9.25, 13.70], [-9.25, 13.55]],
  "block-kon8": [[-9.30, 13.25], [-9.30, 13.40], [-9.45, 13.40], [-9.45, 13.25]],
  "block-kon9": [[-9.30, 13.40], [-9.30, 13.55], [-9.45, 13.55], [-9.45, 13.40]],
  "block-kon10":[[-9.30, 13.55], [-9.30, 13.70], [-9.45, 13.70], [-9.45, 13.55]],
  "block-kon11":[[-9.50, 13.15], [-9.50, 13.30], [-9.65, 13.30], [-9.65, 13.15]],
  "block-kon12":[[-9.50, 13.30], [-9.50, 13.45], [-9.65, 13.45], [-9.65, 13.30]],
  "block-kon13":[[-9.50, 13.45], [-9.50, 13.60], [-9.65, 13.60], [-9.65, 13.45]],
  "block-kon14":[[-9.50, 13.60], [-9.50, 13.75], [-9.65, 13.75], [-9.65, 13.60]],
  "block-kon15":[[-9.70, 13.05], [-9.70, 13.20], [-9.85, 13.20], [-9.85, 13.05]],
  "block-kon16":[[-9.80, 13.25], [-9.80, 13.40], [-9.95, 13.40], [-9.95, 13.25]],
  "block-kon17":[[-9.80, 13.45], [-9.80, 13.60], [-9.95, 13.60], [-9.95, 13.45]],
  "block-kon18":[[-9.85, 13.70], [-9.85, 13.90], [-10.05, 13.90], [-10.05, 13.70]],
  "block-kon19":[[-10.05, 13.25], [-10.05, 13.45], [-10.20, 13.45], [-10.20, 13.25]],
  "block-kon20":[[-10.05, 13.45], [-10.05, 13.65], [-10.20, 13.65], [-10.20, 13.45]],
  "block-kon21":[[-10.40, 13.70], [-10.40, 13.90], [-10.60, 13.90], [-10.60, 13.70]],
  "block-kon22":[[-10.40, 13.90], [-10.40, 14.10], [-10.60, 14.10], [-10.60, 13.90]],
  "block-kon23":[[-10.85, 14.15], [-10.85, 14.35], [-11.05, 14.35], [-11.05, 14.15]],

  // Shallow water — coastal
  "block-0":    [[-5.50, 11.20], [-5.50, 11.80], [-6.20, 11.80], [-6.20, 11.20]],
  "block-1":    [[-5.70, 12.00], [-5.70, 12.40], [-6.20, 12.40], [-6.20, 12.00]],
  "block-2-05": [[-6.20, 12.15], [-6.20, 12.55], [-6.65, 12.55], [-6.65, 12.15]],
  "block-3-05a":[[-6.40, 11.90], [-6.40, 12.25], [-6.75, 12.25], [-6.75, 11.90]],
  "block-3":    [[-6.65, 12.05], [-6.65, 12.50], [-7.10, 12.50], [-7.10, 12.05]],
  "block-3-24": [[-7.10, 11.90], [-7.10, 12.30], [-7.50, 12.30], [-7.50, 11.90]],
  "block-3-15": [[-7.40, 11.80], [-7.40, 12.20], [-7.80, 12.20], [-7.80, 11.80]],
  "block-2-15": [[-7.00, 11.60], [-7.00, 12.00], [-7.45, 12.00], [-7.45, 11.60]],
  "block-4-05": [[-7.15, 12.10], [-7.15, 12.60], [-7.70, 12.60], [-7.70, 12.10]],
  "block-5-06": [[-8.30, 11.90], [-8.30, 12.40], [-9.00, 12.40], [-9.00, 11.90]],
  "block-6-24": [[-9.00, 11.80], [-9.00, 12.30], [-9.60, 12.30], [-9.60, 11.80]],
  "block-7":    [[-9.60, 11.80], [-9.60, 12.40], [-10.30, 12.40], [-10.30, 11.80]],
  "block-8":    [[-10.40, 12.00], [-10.40, 12.60], [-11.10, 12.60], [-11.10, 12.00]],
  "block-9":    [[-11.00, 12.20], [-11.00, 12.80], [-11.60, 12.80], [-11.60, 12.20]],
  "block-10":   [[-12.10, 11.80], [-12.10, 12.50], [-12.85, 12.50], [-12.85, 11.80]],
  "block-11":   [[-13.50, 11.60], [-13.50, 12.30], [-14.40, 12.30], [-14.40, 11.60]],
  "block-12":   [[-15.20, 11.30], [-15.20, 11.90], [-15.90, 11.90], [-15.90, 11.30]],
  "block-13":   [[-15.90, 11.10], [-15.90, 11.70], [-16.60, 11.70], [-16.60, 11.10]],

  // Deep water
  "block-14":   [[-5.50, 10.50], [-5.50, 11.20], [-6.30, 11.20], [-6.30, 10.50]],
  "block-15":   [[-5.50, 11.40], [-5.50, 12.00], [-6.00, 12.00], [-6.00, 11.40]],
  "block-15-06":[[-6.30, 10.90], [-6.30, 11.50], [-7.00, 11.50], [-7.00, 10.90]],
  "block-15-14":[[-6.20, 11.20], [-6.20, 11.75], [-6.60, 11.75], [-6.60, 11.20]],
  "block-16":   [[-6.30, 10.20], [-6.30, 11.00], [-7.20, 11.00], [-7.20, 10.20]],
  "block-17":   [[-7.00, 10.90], [-7.00, 11.60], [-7.80, 11.60], [-7.80, 10.90]],
  "block-18":   [[-7.90, 10.40], [-7.90, 11.30], [-8.80, 11.30], [-8.80, 10.40]],
  "block-19":   [[-8.90, 10.10], [-8.90, 11.00], [-9.70, 11.00], [-9.70, 10.10]],
  "block-20":   [[-9.50, 10.70], [-9.50, 11.40], [-10.20, 11.40], [-10.20, 10.70]],
  "block-21":   [[-10.20, 10.70], [-10.20, 11.40], [-10.90, 11.40], [-10.90, 10.70]],

  // Ultra-deep water
  "block-46":   [[-5.50, 7.80], [-5.50, 8.80], [-6.40, 8.80], [-6.40, 7.80]],
  "block-31":   [[-5.80, 8.80], [-5.80, 9.60], [-6.50, 9.60], [-6.50, 8.80]],
  "block-47":   [[-6.30, 8.10], [-6.30, 9.00], [-7.00, 9.00], [-7.00, 8.10]],
  "block-48":   [[-6.80, 8.60], [-6.80, 9.50], [-7.50, 9.50], [-7.50, 8.60]],
  "block-31-21":[[-6.60, 9.10], [-6.60, 9.65], [-7.10, 9.65], [-7.10, 9.10]],
  "block-32":   [[-6.50, 9.20], [-6.50, 9.80], [-7.20, 9.80], [-7.20, 9.20]],
  "block-49":   [[-7.50, 8.50], [-7.50, 9.50], [-8.40, 9.50], [-8.40, 8.50]],
  "block-50":   [[-8.40, 8.80], [-8.40, 9.70], [-9.20, 9.70], [-9.20, 8.80]],

  // Bidding — deep south
  "block-22":   [[-10.80, 10.70], [-10.80, 11.40], [-11.50, 11.40], [-11.50, 10.70]],
  "block-23":   [[-11.20, 11.00], [-11.20, 11.65], [-11.80, 11.65], [-11.80, 11.00]],
  "block-24":   [[-11.90, 11.10], [-11.90, 11.80], [-12.55, 11.80], [-12.55, 11.10]],
  "block-25":   [[-12.40, 10.90], [-12.40, 11.55], [-12.95, 11.55], [-12.95, 10.90]],
  "block-26":   [[-12.90, 10.65], [-12.90, 11.30], [-13.55, 11.30], [-13.55, 10.65]],
  "block-27":   [[-13.60, 10.60], [-13.60, 11.30], [-14.30, 11.30], [-14.30, 10.60]],
  "block-28":   [[-14.30, 10.80], [-14.30, 11.50], [-14.95, 11.50], [-14.95, 10.80]],
  "block-29":   [[-14.80, 10.60], [-14.80, 11.35], [-15.50, 11.35], [-15.50, 10.60]],
  "block-30":   [[-15.50, 10.40], [-15.50, 11.20], [-16.20, 11.20], [-16.20, 10.40]],

  // Bidding — Kwanza/Benguela ultra-deep
  "block-33":   [[-8.10, 9.60], [-8.10, 10.50], [-8.90, 10.50], [-8.90, 9.60]],
  "block-34":   [[-8.60, 10.00], [-8.60, 10.80], [-9.30, 10.80], [-9.30, 10.00]],
  "block-35":   [[-9.25, 9.60], [-9.25, 10.50], [-9.95, 10.50], [-9.95, 9.60]],
  "block-36":   [[-9.80, 9.60], [-9.80, 10.50], [-10.50, 10.50], [-10.50, 9.60]],
  "block-37":   [[-10.30, 9.40], [-10.30, 10.30], [-11.00, 10.30], [-11.00, 9.40]],
  "block-38":   [[-10.75, 9.60], [-10.75, 10.50], [-11.45, 10.50], [-11.45, 9.60]],
  "block-39":   [[-11.35, 9.80], [-11.35, 10.70], [-12.05, 10.70], [-12.05, 9.80]],
  "block-40":   [[-11.85, 10.35], [-11.85, 11.10], [-12.50, 11.10], [-12.50, 10.35]],
  "block-41":   [[-12.55, 10.10], [-12.55, 10.90], [-13.30, 10.90], [-13.30, 10.10]],
  "block-42":   [[-13.15, 9.95], [-13.15, 10.75], [-13.80, 10.75], [-13.80, 9.95]],
  "block-43":   [[-13.90, 9.90], [-13.90, 10.70], [-14.70, 10.70], [-14.70, 9.90]],
  "block-44":   [[-14.90, 10.10], [-14.90, 10.90], [-15.65, 10.90], [-15.65, 10.10]],
  "block-45":   [[-15.70, 9.50], [-15.70, 10.50], [-16.50, 10.50], [-16.50, 9.50]],
};

// Center of polygon for labels
const getPolygonCenter = (coords: [number, number][]): [number, number] => {
  const latSum = coords.reduce((s, c) => s + c[0], 0);
  const lonSum = coords.reduce((s, c) => s + c[1], 0);
  return [latSum / coords.length, lonSum / coords.length];
};

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

        {/* Maritime limits — 12M, 24M, 200M (ZEE), 350M */}
        {showLimits && (
          <>
            <Polyline positions={limit12M} pathOptions={{ color: "#94a3b8", weight: 0.8, dashArray: "2 3", opacity: 0.4 }} />
            <Polyline positions={limit24M} pathOptions={{ color: "#94a3b8", weight: 0.8, dashArray: "4 3", opacity: 0.4 }} />
            <Polyline positions={limit200M} pathOptions={{ color: "#f4323f", weight: 1.5, dashArray: "8 4", opacity: 0.5 }} />
            <Polyline positions={limit350M} pathOptions={{ color: "#64748b", weight: 1, dashArray: "10 5", opacity: 0.3 }} />
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
