import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, useMap, CircleMarker, Tooltip as LeafletTooltip, Rectangle } from "react-leaflet";
import L from "leaflet";
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

// ── Block positions (lon, lat) — WGS84 ──
const blockGeoPositions: Record<string, [number, number]> = {
  "cabinda-norte":  [12.40, -5.00],
  "cabinda-centro": [12.30, -5.20],
  "cabinda-sul":    [12.20, -5.40],
  "fs-associacoes": [12.15, -5.10],
  "fst-associacoes":[12.18, -5.30],
  "block-con1": [12.55, -5.80], "block-con2": [12.70, -5.80], "block-con3": [12.90, -5.80],
  "block-con4": [12.60, -6.00], "block-con5": [12.80, -5.80], "block-con6": [13.05, -6.10],
  "block-con7": [13.25, -6.10], "block-con8": [13.05, -6.30], "block-con9": [13.25, -6.30],
  "block-con10": [13.45, -7.20],
  "block-kon1": [13.40, -8.95], "block-kon2": [13.55, -8.95], "block-kon3": [13.70, -8.95],
  "block-kon4": [13.20, -9.15], "block-kon5": [13.35, -9.20], "block-kon6": [13.50, -9.20],
  "block-kon7": [13.65, -9.20], "block-kon8": [13.35, -9.42], "block-kon9": [13.50, -9.42],
  "block-kon10": [13.65, -9.42], "block-kon11": [13.25, -9.62], "block-kon12": [13.40, -9.62],
  "block-kon13": [13.55, -9.62], "block-kon14": [13.70, -9.62], "block-kon15": [13.15, -9.82],
  "block-kon16": [13.35, -9.92], "block-kon17": [13.55, -9.92], "block-kon18": [13.80, -10.00],
  "block-kon19": [13.35, -10.15], "block-kon20": [13.55, -10.15],
  "block-kon21": [13.80, -10.55], "block-kon22": [14.00, -10.55], "block-kon23": [14.25, -11.00],
  "block-0": [11.50, -5.85], "block-1": [12.05, -5.95],
  "block-2-05": [12.30, -6.45], "block-3": [12.20, -7.00],
  "block-3-05a": [12.10, -6.70], "block-3-24": [12.10, -7.30], "block-3-15": [12.05, -7.60],
  "block-2-15": [11.85, -7.20], "block-4-05": [12.30, -7.50],
  "block-5-06": [12.15, -8.70], "block-6-24": [12.05, -9.30],
  "block-7": [12.10, -9.95], "block-8": [12.30, -10.80], "block-9": [12.50, -11.30],
  "block-10": [12.15, -12.50], "block-11": [12.00, -14.00],
  "block-12": [11.60, -15.65], "block-13": [11.40, -16.30],
  "block-14": [10.90, -6.10], "block-15": [11.70, -5.95],
  "block-15-06": [11.25, -6.80], "block-15-14": [11.50, -6.45],
  "block-16": [10.70, -6.85], "block-17": [11.25, -7.30],
  "block-18": [10.85, -8.40], "block-19": [10.55, -9.30],
  "block-20": [11.05, -9.85], "block-21": [11.05, -10.55],
  "block-46": [8.30, -6.15], "block-31": [9.20, -6.50],
  "block-47": [8.55, -6.70], "block-48": [9.05, -7.20],
  "block-31-21": [9.35, -7.00], "block-32": [9.50, -7.15],
  "block-49": [9.00, -8.00], "block-50": [9.25, -8.90],
  "block-22": [11.05, -11.15], "block-23": [11.30, -11.55],
  "block-24": [11.45, -12.30], "block-25": [11.25, -12.75],
  "block-26": [11.00, -13.25], "block-27": [11.00, -14.05],
  "block-28": [11.15, -14.70], "block-29": [11.00, -15.20], "block-30": [10.80, -15.90],
  "block-33": [10.05, -8.50], "block-34": [10.45, -9.00],
  "block-35": [10.05, -9.65], "block-36": [10.05, -10.20],
  "block-37": [9.85, -10.70], "block-38": [10.05, -11.15],
  "block-39": [10.25, -11.75], "block-40": [10.75, -12.20],
  "block-41": [10.50, -13.00], "block-42": [10.35, -13.55],
  "block-43": [10.30, -14.35], "block-44": [10.50, -15.30], "block-45": [10.00, -16.20],
};

// Block size in degrees (half-width, half-height)
const getBlockSize = (block: OilBlock): [number, number] => {
  const isKon = block.id.startsWith("block-kon");
  const isCon = block.id.startsWith("block-con");
  const isCabinda = block.id.startsWith("cabinda") || block.id.startsWith("fs");
  if (isKon) return [0.07, 0.08];
  if (isCon) return [0.08, 0.07];
  if (isCabinda) return [0.07, 0.09];
  if (block.areaKm2 && block.areaKm2 > 6000) return [0.45, 0.45];
  if (block.areaKm2 && block.areaKm2 > 4000) return [0.38, 0.38];
  if (block.waterDepth !== "Onshore") return [0.32, 0.35];
  return [0.22, 0.25];
};

// ── Maritime limit lines ──
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
const limit200M = makeOffsetLine(3.4);

// Cities
const cities: { name: string; lat: number; lon: number; major?: boolean }[] = [
  { name: "Cabinda", lat: -5.00, lon: 12.55, major: true },
  { name: "Soyo", lat: -6.00, lon: 12.80, major: true },
  { name: "M'banza Congo", lat: -6.25, lon: 14.25 },
  { name: "Ambriz", lat: -7.80, lon: 13.30 },
  { name: "Luanda", lat: -8.85, lon: 13.30, major: true },
  { name: "Caxito", lat: -8.55, lon: 13.65 },
  { name: "Dondo", lat: -9.70, lon: 14.50 },
  { name: "Sumbe", lat: -11.20, lon: 13.85 },
  { name: "Lobito", lat: -12.35, lon: 13.65, major: true },
  { name: "Benguela", lat: -12.60, lon: 13.45, major: true },
  { name: "Lubango", lat: -14.90, lon: 13.50 },
  { name: "Namibe", lat: -15.20, lon: 12.20, major: true },
  { name: "Tombua", lat: -15.80, lon: 12.00 },
];

// Basin labels
const basins = [
  { name: "Bacia do Baixo Congo", lat: -5.95, lon: 13.30 },
  { name: "Bacia do Kwanza", lat: -8.80, lon: 14.20 },
  { name: "Bacia do Namibe", lat: -14.50, lon: 11.80 },
  { name: "Bacia de Benguela", lat: -12.00, lon: 12.20 },
];

// Natural reserves
const naturalReserves = [
  { name: "Reserva de Búfalo", lat: -12.80, lon: 14.00, w: 0.8, h: 0.5 },
  { name: "Parque N. do Namibe", lat: -15.40, lon: 13.50, w: 1.2, h: 0.8 },
  { name: "Parque N. de Iona", lat: -16.50, lon: 13.00, w: 1.5, h: 1.0 },
];

// ── Tile layer switcher ──
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

// ── Custom SVG block marker ──
const createBlockIcon = (
  block: OilBlock,
  color: string,
  isHighlighted: boolean,
  isExistingConcession: boolean,
  showConcessions: boolean
) => {
  const isSmall = block.id.startsWith("block-kon") || block.id.startsWith("block-con") ||
    block.id.startsWith("cabinda") || block.id.startsWith("fs");
  const size = isSmall ? 28 : (block.areaKm2 && block.areaKm2 > 4000) ? 48 : 40;
  const hatchId = `hatch-${block.id.replace(/[^a-z0-9]/g, "")}`;

  const hatchPattern = isExistingConcession && showConcessions
    ? `<defs><pattern id="${hatchId}" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="rgba(0,0,0,0.4)" stroke-width="1"/></pattern></defs>
       <rect x="2" y="2" width="${size - 4}" height="${size - 4}" fill="url(#${hatchId})" rx="3"/>`
    : "";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      ${isHighlighted ? `<rect x="0" y="0" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2.5" rx="4" opacity="0.7"/>` : ""}
      <rect x="2" y="2" width="${size - 4}" height="${size - 4}" fill="${color}" opacity="${isHighlighted ? 0.85 : 0.65}" stroke="${isHighlighted ? color : 'rgba(255,255,255,0.5)'}" stroke-width="${isHighlighted ? '1.5' : '0.8'}" rx="3"
        ${isHighlighted ? `filter="drop-shadow(0 0 6px ${color})"` : ""}/>
      ${hatchPattern}
      <text x="${size / 2}" y="${size / 2 + (isSmall ? 3 : 4)}" text-anchor="middle" fill="white" font-size="${isSmall ? 7 : 10}" font-weight="700" font-family="Inter, sans-serif" style="text-shadow: 0 1px 3px rgba(0,0,0,0.8)">${block.name}</text>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "leaflet-block-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
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
        {/* Tile layer */}
        <TileSwitch showSatellite={showSatellite} />

        {/* Maritime limits */}
        {showLimits && (
          <>
            <Polyline positions={limit12M} pathOptions={{ color: "#94a3b8", weight: 1, dashArray: "4 4", opacity: 0.5 }} />
            <Polyline positions={limit200M} pathOptions={{ color: "#f4323f", weight: 1.5, dashArray: "8 4", opacity: 0.5 }} />
          </>
        )}

        {/* Natural reserves */}
        {showReserves && naturalReserves.map(r => (
          <Rectangle
            key={r.name}
            bounds={[[r.lat, r.lon], [r.lat - r.h, r.lon + r.w]]}
            pathOptions={{
              color: "#6b7280",
              weight: 1,
              fillColor: "#22c55e",
              fillOpacity: 0.08,
              dashArray: "3 3",
            }}
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
          <CircleMarker
            key={b.name}
            center={[b.lat, b.lon]}
            radius={0}
            pathOptions={{ opacity: 0 }}
          >
            <LeafletTooltip permanent direction="center" className="leaflet-basin-label">
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-50">{b.name}</span>
            </LeafletTooltip>
          </CircleMarker>
        ))}

        {/* Block markers */}
        {showBlocks && blocks.map(block => {
          const geo = blockGeoPositions[block.id];
          if (!geo) return null;
          const [lon, lat] = geo;
          const isSelected = selectedBlockId === block.id;
          const isHovered = hoveredBlockId === block.id;
          const isHighlighted = isSelected || isHovered;
          const color = getBlockColor(block);
          const hasBiddingYear = !!blockBiddingYear[block.id];
          const isExistingConcession = !hasBiddingYear && (block.phase === "Production" || block.phase === "Development");

          const icon = createBlockIcon(block, color, isHighlighted, isExistingConcession, showConcessions);

          return (
            <Marker
              key={block.id}
              position={[lat, lon]}
              icon={icon}
              eventHandlers={{
                click: () => onBlockClick(block),
                mouseover: () => onBlockHover(block.id),
                mouseout: () => onBlockHover(null),
              }}
            >
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
            </Marker>
          );
        })}
      </MapContainer>

      {/* Layers Panel — floating over map */}
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
                  Oceânico
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
                  { key: "basins", label: "Bacias", icon: <Mountain className="w-3 h-3" />, checked: showBasins, set: setShowBasins },
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
                    <div className="w-4 h-0 border-t border-dashed border-gray-400" />
                    <span className="text-[9px] text-foreground/60">12 M.N.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0 border-t-2 border-dashed border-red-400" />
                    <span className="text-[9px] text-foreground/60">ZEE (200 M.N.)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Attribution badge */}
      <div className="absolute bottom-2 right-2 z-[1000] bg-background/70 backdrop-blur-sm px-2 py-1 rounded text-[9px] text-muted-foreground border border-border/30">
        DATUM WGS84 · ANPG · Esri
      </div>
    </div>
  );
};
