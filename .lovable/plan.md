

## Plan: Offset Production Circles from Block Labels

**Problem**: The green production circles (`CircleMarker`) and block name labels both use `getPolygonCenter()` — they sit on top of each other, making hover interaction difficult.

**Solution**: Offset the production circle positions slightly south of the polygon centroid so they don't overlap with the block name label.

### Changes in `src/components/dashboard/ConcessionMap.tsx`

1. **Offset the `CircleMarker` and its permanent "Xk" label** by shifting the latitude downward from the centroid. The offset will scale inversely with zoom level (larger offset at low zoom, smaller at high zoom) to maintain visual separation at all scales.

2. Specifically, in the `ProductionIndicators` component:
   - Calculate `offsetCenter` as `[center[0] - offset, center[1]]` where offset ≈ `0.15` (tuned to ~15-20km south, adjusted by zoom).
   - Apply this offset to both the `CircleMarker` (line 72) and the permanent label `Marker` (line 106).

This keeps the block name at the true centroid and places the production indicator just below it, providing clear separation for hover interaction.

