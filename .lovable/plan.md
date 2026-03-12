

## Problem

When clicking a block on the Operators tab map, two overlapping UI elements appear:
1. A Leaflet **Popup** (built into `ConcessionMap.tsx`, lines 465-499) showing block summary info
2. The **BlockDetail** slide-in sidebar (triggered by `setSelectedBlock` in `OperatorsPanel.tsx`)

## Solution

Keep only the **BlockDetail sidebar** (richer, more detailed) and suppress the Leaflet Popup when the map is used inside the Operators panel.

### Implementation

1. **`ConcessionMap.tsx`**: Add an optional prop `disablePopup?: boolean`. When true, skip rendering the `<Popup>` element inside each block's `<Polygon>` (lines 465-499). The click handler (`onBlockClick`) still fires to open the sidebar.

2. **`OperatorsPanel.tsx`**: Pass `disablePopup={true}` to the `<ConcessionMap>` instance (~line 375).

This is a minimal, surgical change -- two files, ~5 lines modified total. The Overview tab map continues to show popups as before since `disablePopup` defaults to `false`.

