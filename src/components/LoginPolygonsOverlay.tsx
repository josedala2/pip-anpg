import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { loadBlockPolygons, type BlockPolygonMap } from "@/data/blockPolygonsLoader";

const PHASE_COLORS: Record<string, string> = {
  production: "#22c55e",
  exploration: "#3b82f6",
  development: "#f59e0b",
  licensing: "#a855f7",
};

const LoginPolygonsOverlay = () => {
  const [polygons, setPolygons] = useState<BlockPolygonMap | null>(null);

  useEffect(() => {
    loadBlockPolygons().then(setPolygons);
  }, []);

  if (!polygons || Object.keys(polygons).length === 0) return null;

  return (
    <div
      className="absolute inset-0 z-[1] pointer-events-none opacity-25 animate-fade-in"
      aria-hidden="true"
    >
      <MapContainer
        center={[-9.5, 13]}
        zoom={6}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        boxZoom={false}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution=""
        />
        {Object.entries(polygons).map(([id, coords]) => (
          <Polygon
            key={id}
            positions={coords}
            pathOptions={{
              fillColor: "#f59e0b",
              fillOpacity: 0.15,
              color: "#f59e0b",
              weight: 1,
              opacity: 0.4,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default LoginPolygonsOverlay;
