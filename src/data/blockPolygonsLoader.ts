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

let cachedPolygons: BlockPolygonMap | null = null;
let loadingPromise: Promise<BlockPolygonMap> | null = null;

export async function loadBlockPolygons(): Promise<BlockPolygonMap> {
  if (cachedPolygons) return cachedPolygons;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const response = await fetch("/data/concessoes-angola.geojson");
      const geojson = await response.json();

      const result: BlockPolygonMap = {};

      for (const feature of geojson.features) {
        const leaseId = feature.properties?.Lease_ID;
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

        // Convert [lng, lat, z?] to [lat, lng] for Leaflet
        const coords: [number, number][] = ring.map((p: number[]) => [p[1], p[0]]);

        // Simplify for performance
        result[appId] = simplifyPolygon(coords, 80);
      }

      cachedPolygons = result;
      return result;
    } catch (err) {
      console.error("Failed to load block polygons:", err);
      return {};
    }
  })();

  return loadingPromise;
}
