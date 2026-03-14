import * as XLSX from "xlsx";

// Map spreadsheet block names to app block IDs
const nameToId: Record<string, string> = {
  "BLOCO 0": "block-0",
  "BLOCO 00001": "block-1",
  "BLOCO 00002": "block-2-05",
  "BLOCO 00003": "block-3",
  "BLOCO 00004": "block-4-05",
  "BLOCO 00005": "block-5-06",
  "BLOCO 00006": "block-6-24",
  "BLOCO 00007": "block-7",
  "BLOCO 00008": "block-8",
  "BLOCO 00009": "block-9",
  "BLOCO 00010": "block-10",
  "BLOCO 00011": "block-11",
  "BLOCO 00012": "block-12",
  "BLOCO 00013": "block-13",
  "BLOCO 00014": "block-14",
  "BLOCO 00015": "block-15",
  "BLOCO 00016": "block-16",
  "BLOCO 00017": "block-17",
  "BLOCO 00018": "block-18",
  "BLOCO 00019": "block-19",
  "BLOCO 00020": "block-20",
  "BLOCO 00021": "block-21",
  "BLOCO 00022": "block-22",
  "BLOCO 00023": "block-23",
  "BLOCO 00024": "block-24",
  "BLOCO 00025": "block-25",
  "BLOCO 00026": "block-26",
  "BLOCO 00027": "block-27",
  "BLOCO 00028": "block-28",
  "BLOCO 00029": "block-29",
  "BLOCO 00030": "block-30",
  "BLOCO 00031": "block-31",
  "BLOCO 00032": "block-32",
  "BLOCO 00033": "block-33",
  "BLOCO 00034": "block-34",
  "BLOCO 00035": "block-35",
  "BLOCO 00036": "block-36",
  "BLOCO 00037": "block-37",
  "BLOCO 00038": "block-38",
  "BLOCO 00039": "block-39",
  "BLOCO 00040": "block-40",
  "BLOCO 00041": "block-41",
  "BLOCO 00042": "block-42",
  "BLOCO 00043": "block-43",
  "BLOCO 00044": "block-44",
  "BLOCO 00045": "block-45",
  "BLOCO 00046": "block-46",
  "BLOCO 00047": "block-47",
  "BLOCO 00048": "block-48",
  "BLOCO 00049": "block-49",
  "BLOCO 00050": "block-50",
  "BLOCO 00072": "block-72",
  "BLOCO 00073": "block-73",
  "BLOCO 00074": "block-74",
  "BLOCO CAB_C": "cabinda-centro",
  "BLOCO CAB_N": "cabinda-norte",
  "CON 1": "block-con1",
  "CON 2": "block-con2",
  "CON 3": "block-con3",
  "CON 4": "block-con4",
  "CON 5": "block-con5",
  "CON 6": "block-con6",
  "CON 7": "block-con7",
  "CON 8": "block-con8",
  "CON 9": "block-con9",
  "CON10": "block-con10",
  "OK_KON1": "block-kon1",
  "OK_KON2": "block-kon2",
  "OK_KON3": "block-kon3",
  "OK_KON4": "block-kon4",
  "OK_KON5": "block-kon5",
  "OK_KON6": "block-kon6",
  "OK_KON7": "block-kon7",
  "OK_KON8": "block-kon8",
  "OK_KON9": "block-kon9",
  "OK_KON10": "block-kon10",
  "OK_KON11": "block-kon11",
  "OK_KON12": "block-kon12",
  "OK_KON13": "block-kon13",
  "OK_KON14": "block-kon14",
  "OK_KON15": "block-kon15",
  "OK_KON16": "block-kon16",
  "OK_KON17": "block-kon17",
  "OK_KON18": "block-kon18",
  "OK_KON19": "block-kon19",
  "OK_KON20": "block-kon20",
  "OK_KON21": "block-kon21",
  "OK_KON22": "block-kon22",
  "OK_KON23": "block-kon23",
};

function normalizeBlockName(raw: string): string {
  // Remove markdown escaping of underscores and trim
  return raw.replace(/\\\\_/g, "_").replace(/\\/g, "").trim();
}

// Simplify polygon by keeping every Nth point
function simplifyPolygon(coords: [number, number][], maxPoints: number): [number, number][] {
  if (coords.length <= maxPoints) return coords;
  const step = Math.ceil(coords.length / maxPoints);
  const result: [number, number][] = [];
  for (let i = 0; i < coords.length; i += step) {
    result.push(coords[i]);
  }
  // Always include the last point to close the polygon
  const last = coords[coords.length - 1];
  if (result[result.length - 1] !== last) {
    result.push(last);
  }
  return result;
}

export type BlockPolygonMap = Record<string, [number, number][]>;

let cachedPolygons: BlockPolygonMap | null = null;
let loadingPromise: Promise<BlockPolygonMap> | null = null;

export async function loadBlockPolygons(): Promise<BlockPolygonMap> {
  if (cachedPolygons) return cachedPolygons;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const response = await fetch("/data/block-coordinates.xlsx");
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Group coordinates by block name
      const blockCoords: Record<string, [number, number][]> = {};

      for (const row of rows) {
        if (!row[0] || !row[1] || !row[2]) continue;
        const rawName = String(row[0]);
        if (rawName === "BLOCO" || (rawName.toLowerCase().includes("bloco") && rawName.toLowerCase().includes("longitude"))) continue;

        const name = normalizeBlockName(rawName);
        const lng = Number(row[1]);
        const lat = Number(row[2]);

        if (isNaN(lng) || isNaN(lat)) continue;

        // Leaflet uses [lat, lng]
        if (!blockCoords[name]) blockCoords[name] = [];
        blockCoords[name].push([lat, lng]);
      }

      // Map to app block IDs and simplify
      const result: BlockPolygonMap = {};
      for (const [name, coords] of Object.entries(blockCoords)) {
        const appId = nameToId[name];
        if (appId && coords.length >= 3) {
          // Simplify large polygons to max 60 points for performance
          result[appId] = simplifyPolygon(coords, 60);
        }
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
