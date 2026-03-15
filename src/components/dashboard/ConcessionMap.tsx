import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polygon, Polyline, Popup, CircleMarker, Tooltip as LeafletTooltip, Rectangle, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type OilBlock, type BlockPhase } from "@/data/angolaBlocks";
import { calculateStrategicScore } from "@/lib/strategicScoring";
import { loadBlockPolygons, type BlockPolygonMap } from "@/data/blockPolygonsLoader";
import { Layers, Map as MapIcon, Satellite, Mountain, Waves, TreePine, ChevronDown, ChevronUp, Droplets } from "lucide-react";

interface ConcessionMapProps {
  blocks: OilBlock[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  onBlockClick: (block: OilBlock) => void;
  onBlockHover: (blockId: string | null) => void;
  highlightOperator?: string;
  disablePopup?: boolean;
  autoFitBounds?: boolean;
}

// Auto-fit map bounds to visible blocks
function FitBounds({ blocks, polygons }: { blocks: OilBlock[]; polygons: Record<string, [number, number][]> }) {
  const map = useMap();
  const bounds = useMemo(() => {
    const allCoords: [number, number][] = [];
    for (const block of blocks) {
      const polygon = polygons[block.id];
      if (polygon) allCoords.push(...polygon);
    }
    if (allCoords.length === 0) return null;
    return L.latLngBounds(allCoords.map(([lat, lng]) => L.latLng(lat, lng)));
  }, [blocks, polygons]);

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 });
    }
  }, [map, bounds]);

  return null;
}

// Hook to track current zoom level
function useZoom() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    return () => { map.off('zoomend', onZoom); };
  }, [map]);
  return zoom;
}

// Zoom-responsive production indicators
function ProductionIndicators({ blocks, blockPolygons }: { blocks: OilBlock[]; blockPolygons: Record<string, [number, number][]> }) {
  const zoom = useZoom();
  const showProdLabels = zoom >= 6;

  return (
    <>
      {blocks.filter(b => b.dailyProduction > 0).map(block => {
        const polygon = blockPolygons[block.id];
        if (!polygon) return null;
        const center = getPolygonCenter(polygon);
        const radius = Math.max(6, Math.min(18, Math.sqrt(block.dailyProduction / 1000) * 4));
        return (
          <CircleMarker
            key={`prod-${block.id}`}
            center={center}
            radius={radius}
            pathOptions={{
              color: "#22c55e",
              weight: 1.5,
              fillColor: "#22c55e",
              fillOpacity: 0.8,
            }}
          >
            {showProdLabels && (
              <LeafletTooltip permanent direction="center" className="leaflet-production-label">
                <span className="text-[8px] font-bold text-white drop-shadow-md">
                  {(block.dailyProduction / 1000).toFixed(0)}k
                </span>
              </LeafletTooltip>
            )}
          </CircleMarker>
        );
      })}
    </>
  );
}

// Zoom-responsive block labels
function BlockLabels({ blocks, blockPolygons, showBlocks }: { blocks: OilBlock[]; blockPolygons: Record<string, [number, number][]>; showBlocks: boolean }) {
  const zoom = useZoom();

  const fontSize = zoom <= 4 ? 7 : zoom <= 5 ? 8 : zoom <= 6 ? 9 : zoom <= 7 ? 10 : zoom <= 8 ? 11 : 12;
  const showLabels = zoom >= 3;

  if (!showBlocks || !showLabels) return null;

  return (
    <>
      {blocks.map(block => {
        const polygon = blockPolygons[block.id];
        if (!polygon) return null;
        const center = getPolygonCenter(polygon);
        const icon = L.divIcon({
          className: 'leaflet-block-label',
          html: `<span style="font-size:${fontSize}px;font-weight:700">${block.name}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        return (
          <Marker
            key={`label-${block.id}`}
            position={center}
            icon={icon}
            interactive={false}
          />
        );
      })}
    </>
  );
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
  highlightOperator,
  disablePopup = false,
  autoFitBounds = false,
}: ConcessionMapProps) => {
  const navigate = useNavigate();
  const [showLimits, setShowLimits] = useState(true);
  const [showReserves, setShowReserves] = useState(true);
  const [showCities, setShowCities] = useState(true);
  const [showBasins, setShowBasins] = useState(true);
  const [showBlocks, setShowBlocks] = useState(true);
  const [showConcessions, setShowConcessions] = useState(true);
  const [showProduction, setShowProduction] = useState(true);
  const [showSatellite, setShowSatellite] = useState(true);
  const [colorMode, setColorMode] = useState<"phase" | "bidding" | "strategic">("strategic");
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);
  const [realPolygons, setRealPolygons] = useState<BlockPolygonMap>({});

  // Load real polygons from XLSX on mount
  useEffect(() => {
    loadBlockPolygons().then(setRealPolygons);
  }, []);

  // Merge: real polygons take priority over fallback rectangles
  // Only show blocks with real XLSX polygon data
  const blockPolygons = useMemo(() => realPolygons, [realPolygons]);

  // Pre-compute strategic scores for all blocks
  const blockScores = useMemo(() => {
    const map = new Map<string, number>();
    blocks.forEach(b => {
      const score = calculateStrategicScore(b);
      map.set(b.id, score.totalScore);
    });
    return map;
  }, [blocks]);

  const getStrategicColor = useCallback((block: OilBlock) => {
    if (block.phase === "Exploration") return "#2d8ac7"; // petrol blue for exploration
    if (block.phase === "Suspended") return "#6b7280"; // grey for suspended
    const score = blockScores.get(block.id) || 50;
    if (score >= 70) return "#2e9e5e"; // green — healthy
    if (score >= 40) return "#d69e2e"; // amber — attention
    return "#c53030"; // red — critical
  }, [blockScores]);

  const getBlockColor = useCallback((block: OilBlock) => {
    if (colorMode === "strategic") return getStrategicColor(block);
    if (colorMode === "bidding") {
      const year = blockBiddingYear[block.id];
      if (year) return biddingYearColors[year];
    }
    return phaseColors[block.phase];
  }, [colorMode, getStrategicColor]);

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
        {autoFitBounds && <FitBounds blocks={blocks} polygons={blockPolygons} />}



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

        {/* Production indicators */}
        {showProduction && showBlocks && blocks.filter(b => b.dailyProduction > 0).map(block => {
          const polygon = blockPolygons[block.id];
          if (!polygon) return null;
          const center = getPolygonCenter(polygon);
          const radius = Math.max(6, Math.min(18, Math.sqrt(block.dailyProduction / 1000) * 4));
          return (
            <CircleMarker
              key={`prod-${block.id}`}
              center={center}
              radius={radius}
              pathOptions={{
                color: "#22c55e",
                weight: 1.5,
                fillColor: "#22c55e",
                fillOpacity: 0.8,
              }}
            >
              <LeafletTooltip permanent direction="center" className="leaflet-production-label">
                <span className="text-[8px] font-bold text-white drop-shadow-md">
                  {(block.dailyProduction / 1000).toFixed(0)}k
                </span>
              </LeafletTooltip>
            </CircleMarker>
          );
        })}

        {/* Block polygons */}
        {showBlocks && blocks.map(block => {
          const polygon = blockPolygons[block.id];
          if (!polygon) return null;
          const center = getPolygonCenter(polygon);
          const isSelected = selectedBlockId === block.id;
          const isHovered = hoveredBlockId === block.id;
          const isHighlighted = isSelected || isHovered;
          const isOpBlock = highlightOperator ? block.operator === highlightOperator : false;
          const isDimmed = highlightOperator ? !isOpBlock : false;
          const color = getBlockColor(block);
          const hasBiddingYear = !!blockBiddingYear[block.id];
          const isExistingConcession = !hasBiddingYear && (block.phase === "Production" || block.phase === "Development");
          const isOnshore = block.waterDepth === "Onshore";

          return (
            <Polygon
              key={block.id}
              positions={polygon}
              pathOptions={{
                color: isOpBlock ? "#facc15" : isDimmed ? "#6b7280" : isHighlighted ? "white" : isOnshore ? "#facc15" : color,
                weight: isOpBlock ? 3 : isHighlighted ? 3 : isOnshore ? 2 : 1,
                fillColor: isOpBlock ? "#facc15" : color,
                fillOpacity: isDimmed ? 0.08 : isOpBlock ? 0.65 : isHighlighted ? 0.75 : isOnshore ? 0.6 : isExistingConcession ? 0.35 : 0.5,
                dashArray: isExistingConcession && showConcessions ? "4 3" : undefined,
              }}
              eventHandlers={{
                click: () => onBlockClick(block),
                mouseover: () => onBlockHover(block.id),
                mouseout: () => onBlockHover(null),
              }}
            >
              {!disablePopup && (
              <Popup className="leaflet-block-popup" maxWidth={320} minWidth={240}>
                <div className="p-2">
                  {/* Executive popup header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <div className="font-bold text-sm">{block.name}</div>
                      <div className="text-[11px] text-gray-500">{block.operator}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold font-mono" style={{ color: getStrategicColor(block) }}>
                        {blockScores.get(block.id) || "—"}
                      </div>
                      <div className="text-[9px] text-gray-400">Score</div>
                    </div>
                  </div>

                  {/* 6 executive fields */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 py-1.5 border-t border-b border-gray-100 text-[11px]">
                    <div>
                      <span className="text-gray-400">Fase: </span>
                      <span className="font-medium">{block.phase}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Produção: </span>
                      <span className="font-mono font-semibold">{block.dailyProduction > 0 ? `${(block.dailyProduction / 1000).toFixed(1)}k` : "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Risco: </span>
                      <span className={`font-semibold ${block.riskScore >= 7 ? "text-red-600" : block.riskScore >= 4 ? "text-amber-600" : "text-green-600"}`}>
                        {block.riskScore}/10
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Compliance: </span>
                      <span className="font-medium">{block.complianceScore}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Reservas: </span>
                      <span className="font-mono">{block.estimatedReserves} Mb</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Contrato: </span>
                      <span className="font-medium">{block.contractInfo?.productionPeriodEnd?.slice(0, 4) || "—"}</span>
                    </div>
                  </div>

                  {/* Strategic recommendation */}
                  {(() => {
                    const score = calculateStrategicScore(block);
                    return (
                      <div className="mt-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getStrategicColor(block) }} />
                          <span className="font-bold text-gray-700">{score.classification}</span>
                          <span className={`ml-auto font-bold ${score.urgency === "Imediata" ? "text-red-600" : score.urgency === "Elevada" ? "text-amber-600" : "text-gray-500"}`}>
                            {score.urgency}
                          </span>
                        </div>
                        <p className="text-gray-500 leading-snug line-clamp-2">{score.recommendation}</p>
                      </div>
                    );
                  })()}

                  <button
                    className="mt-2 w-full text-[11px] font-semibold flex items-center justify-center gap-1 py-1.5 rounded-md transition-colors"
                    style={{ color: "#2d6a8a", borderColor: "#2d6a8a33", border: "1px solid" }}
                    onClick={() => navigate(`/block/${block.id}`)}
                  >
                    Ver Ficha Completa →
                  </button>
                </div>
              </Popup>
              )}
            </Polygon>
          );
        })}

        {/* Zoom-responsive block labels */}
        <BlockLabels blocks={blocks} blockPolygons={blockPolygons} showBlocks={showBlocks} />
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
          <div className="bg-background/95 backdrop-blur-xl border border-border shadow-xl p-3.5 rounded-lg min-w-[220px] max-h-[70vh] overflow-y-auto space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
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
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setColorMode("strategic")}
                  className={`text-[10px] px-2.5 py-1.5 rounded-md font-medium transition-colors ${colorMode === "strategic" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  Estratégico
                </button>
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
                   { key: "production", label: "Produções", icon: <Droplets className="w-3 h-3" />, checked: showProduction, set: setShowProduction },
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
              {colorMode === "strategic" ? (
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {([
                    { color: "#2e9e5e", label: "Saudável (≥70)" },
                    { color: "#d69e2e", label: "Atenção (40-70)" },
                    { color: "#c53030", label: "Crítico (<40)" },
                    { color: "#2d8ac7", label: "Exploratório" },
                    { color: "#6b7280", label: "Inactivo" },
                  ]).map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm border border-border/30" style={{ backgroundColor: color }} />
                      <span className="text-[10px] text-foreground/80 font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              ) : colorMode === "phase" ? (
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {([
                    { phase: "Production" as BlockPhase, label: "Produção" },
                    { phase: "Development" as BlockPhase, label: "Desenvolvimento" },
                    { phase: "Exploration" as BlockPhase, label: "Exploração" },
                    { phase: "Bidding" as BlockPhase, label: "Licitação" },
                    { phase: "Suspended" as BlockPhase, label: "Suspenso" },
                  ]).map(({ phase, label }) => (
                    <div key={phase} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm border border-border/30" style={{ backgroundColor: phaseColors[phase] }} />
                      <span className="text-[10px] text-foreground/80 font-medium">{label}</span>
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
              {/* Onshore block legend */}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: 'hsl(var(--muted-foreground) / 0.15)', border: '2px solid #facc15' }} />
                <span className="text-[10px] text-foreground/80 font-medium">Bloco Terrestre</span>
              </div>
              {/* Production legend */}
              {showProduction && (
                <div className="mt-2 pt-1.5 border-t border-border/20 space-y-1.5">
                  <div className="text-[9px] font-semibold text-foreground/70 uppercase tracking-wider">Produção (BOPD)</div>
                  <div className="flex items-center gap-2">
                    <svg width="10" height="10"><circle cx="5" cy="5" r="3" fill="#22c55e" opacity="0.8" /></svg>
                    <span className="text-[9px] text-foreground/60">&lt; 5k</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14"><circle cx="7" cy="7" r="5" fill="#22c55e" opacity="0.8" /></svg>
                    <span className="text-[9px] text-foreground/60">5k – 50k</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20"><circle cx="10" cy="10" r="8" fill="#22c55e" opacity="0.8" /></svg>
                    <span className="text-[9px] text-foreground/60">50k – 200k</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="28" height="28"><circle cx="14" cy="14" r="12" fill="#22c55e" opacity="0.8" /></svg>
                    <span className="text-[9px] text-foreground/60">&gt; 200k</span>
                  </div>
                </div>
              )}
              {/* Maritime limits legend */}
              {showLimits && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="4 4" /></svg>
                    <span className="text-[9px] text-foreground/60">12 M.N.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6 4" /></svg>
                    <span className="text-[9px] text-foreground/60">24 M.N.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="10 5" /></svg>
                    <span className="text-[9px] text-foreground/60 font-semibold">ZEE (200 M.N.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#a78bfa" strokeWidth="1.8" strokeDasharray="12 6" /></svg>
                    <span className="text-[9px] text-foreground/60">350 M.N.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phase Legend */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-background/85 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/40 shadow-md">
        <div className="text-[9px] font-bold text-foreground/80 mb-1.5 uppercase tracking-wider">Fases</div>
        <div className="flex flex-col gap-1">
          {Object.entries(phaseColors).map(([phase, color]) => (
            <div key={phase} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm border border-white/30 inline-block" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-foreground/70">
                {phase === "Production" ? "Produção" : phase === "Development" ? "Desenvolvimento" : phase === "Exploration" ? "Exploração" : phase === "Suspended" ? "Suspenso" : "Licitação"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 z-[1000] bg-background/70 backdrop-blur-sm px-2 py-1 rounded text-[9px] text-muted-foreground border border-border/30">
        DATUM WGS84 · ANPG · 3371-NOV-19-GIS-GAD
      </div>
    </div>
  );
};
