import { useState, useEffect } from "react";
import { loadBlockPolygons, BlockPolygonMap } from "@/data/blockPolygonsLoader";

// Angola bounding box (geographic)
const LAT_MIN = -18;
const LAT_MAX = -4;
const LNG_MIN = 8;
const LNG_MAX = 14;

const VW = 1000;
const VH = 1000;

function project(lat: number, lng: number): [number, number] {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * VW;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VH;
  return [x, y];
}

const LoginPolygonsOverlay = () => {
  const [polygons, setPolygons] = useState<BlockPolygonMap | null>(null);

  useEffect(() => {
    loadBlockPolygons().then(setPolygons);
  }, []);

  if (!polygons || Object.keys(polygons).length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full z-[1] pointer-events-none animate-fade-in"
      aria-hidden="true"
    >
      {Object.entries(polygons).map(([id, coords]) => {
        const points = coords.map(([lat, lng]) => project(lat, lng).join(",")).join(" ");
        return (
          <polygon
            key={id}
            points={points}
            fill="hsl(var(--primary) / 0.08)"
            stroke="hsl(var(--primary) / 0.15)"
            strokeWidth="0.5"
          />
        );
      })}
    </svg>
  );
};

export default LoginPolygonsOverlay;
