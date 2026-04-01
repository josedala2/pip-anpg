// Loads official GeoJSON concession polygons and maps them to app block IDs

// Simplify polygon by keeping every Nth point
function simplifyPolygon(coords: [number, number][], maxPoints: number): [number, number][] {
  if (coords.length <= maxPoints) return coords;
  const step = Math.ceil(coords.length / maxPoints);
  const result: [number, number][] = [];
  for (let i = 0; i < coords.length; i += step) {
    result.push(coords[i]);
  }
  const last = coords[coords.length - 1];
  if (result[result.length - 1] !== last) {
    result.push(last);
  }
  return result;
}

/**
 * Convert a GeoJSON Lease_ID to the app's internal block ID.
 * Examples: "BL0" -> "block-0", "BL 55" -> "block-55",
 *           "BL17/06" -> "block-17", "BL2" -> "block-2-05",
 *           "KON21" -> "block-kon21", "CON1" -> "block-con1",
 *           "CABN" -> "cabinda-norte"
 */
function leaseIdToAppId(leaseId: string): string | null {
  const id = leaseId.trim();

  // Cabinda special cases
  if (id === "CABN") return "cabinda-norte";
  if (id === "CABS") return "cabinda-sul";
  if (id === "CABC") return "cabinda-centro";

  // KON series
  const konMatch = id.match(/^KON(\d+)$/);
  if (konMatch) return `block-kon${parseInt(konMatch[1])}`;

  // CON series
  const conMatch = id.match(/^CON(\d+)$/);
  if (conMatch) return `block-con${parseInt(conMatch[1])}`;

  // BL series (with optional space): "BL0", "BL 55", "BL17/06"
  const blMatch = id.match(/^BL\s*(\d+)/);
  if (blMatch) {
    const num = parseInt(blMatch[1]);
    // Some blocks have composite IDs in the app
    const compositeMap: Record<number, string> = {
      2: "block-2-05",
      4: "block-4-05",
      5: "block-5-06",
      6: "block-6-24",
    };
    return compositeMap[num] || `block-${num}`;
  }

  return null;
}

export type BlockPolygonMap = Record<string, [number, number][]>;

export interface BlockGeoMeta {
  operator?: string;
  area?: string;
  category?: string;
  nome?: string;
  leaseId?: string;
  areaKm2?: number;
}

export type BlockMetaMap = Record<string, BlockGeoMeta>;

let cachedPolygons: BlockPolygonMap | null = null;
let cachedMeta: BlockMetaMap | null = null;
let loadingPromise: Promise<{ polygons: BlockPolygonMap; meta: BlockMetaMap }> | null = null;

async function loadAll(): Promise<{ polygons: BlockPolygonMap; meta: BlockMetaMap }> {
  if (cachedPolygons && cachedMeta) return { polygons: cachedPolygons, meta: cachedMeta };
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const response = await fetch("/data/concessoes-angola.geojson");
      const geojson = await response.json();

      const polygons: BlockPolygonMap = {};
      const meta: BlockMetaMap = {};

      for (const feature of geojson.features) {
        const props = feature.properties;
        const leaseId = props?.Lease_ID;
        if (!leaseId) continue;

        const appId = leaseIdToAppId(leaseId);
        if (!appId) continue;

        const geom = feature.geometry;
        if (!geom) continue;

        // Extract first ring of first polygon
        let ring: number[][] | null = null;
        if (geom.type === "MultiPolygon" && geom.coordinates?.[0]?.[0]) {
          ring = geom.coordinates[0][0];
        } else if (geom.type === "Polygon" && geom.coordinates?.[0]) {
          ring = geom.coordinates[0];
        }

        if (!ring || ring.length < 3) continue;

        const coords: [number, number][] = ring.map((p: number[]) => [p[1], p[0]]);
        polygons[appId] = simplifyPolygon(coords, 80);

        // Extract metadata
        meta[appId] = {
          operator: props.Operador || props.OPERADOR || undefined,
          area: props.Area || props.AREA || undefined,
          category: props.Categoria || props.CATEGORIA || props.Category || undefined,
          nome: props.Nome || undefined,
          leaseId: leaseId,
          areaKm2: props.Area_km2 ? parseFloat(props.Area_km2) : undefined,
        };
      }

      cachedPolygons = polygons;
      cachedMeta = meta;
      return { polygons, meta };
    } catch (err) {
      console.error("Failed to load block polygons:", err);
      return { polygons: {}, meta: {} };
    }
  })();

  return loadingPromise;
}

export async function loadBlockPolygons(): Promise<BlockPolygonMap> {
  const { polygons } = await loadAll();
  return polygons;
}

export async function loadBlockMeta(): Promise<BlockMetaMap> {
  const { meta } = await loadAll();
  return meta;
}
