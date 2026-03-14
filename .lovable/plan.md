

## Plan: Show Only Real XLSX Polygons + Block Name Labels

### What changes

**1. Remove fallback rectangles — only show XLSX polygons**

In `ConcessionMap.tsx`, change the polygon merge logic (line 341-343) from:
```ts
const blockPolygons = useMemo(() => ({ ...fallbackPolygons, ...realPolygons }), [realPolygons]);
```
to:
```ts
const blockPolygons = useMemo(() => realPolygons, [realPolygons]);
```

This ensures only blocks with real coordinate data from the Excel file appear on the map. The entire `blockGeoData` object, `areaToPolygon` function, and `fallbackPolygons` computation (lines 76-218) can be removed as dead code.

**2. Ensure block name labels are visible on each polygon**

The code already renders a permanent `LeafletTooltip` with `block.name` on each polygon (lines 522-524). These should be visible once only real polygons are shown. No additional changes needed for labels — they're already implemented.

### Files to edit

- `src/components/dashboard/ConcessionMap.tsx` — Remove ~140 lines of fallback geometry data and update polygon source to use only `realPolygons`

