

## Changes

### 1. Operators map: remove sidebar, keep popup
In `OperatorsPanel.tsx` (~line 375-376): remove `disablePopup` prop and remove the `BlockDetail` render at line 772. Clicking a block on the operator map will show only the Leaflet popup (default behavior), not the sidebar.

### 2. BlockPage back button: use browser history instead of hardcoded "/"
In `BlockPage.tsx` (lines 315 and 344): replace `navigate("/")` with `navigate(-1)` so the back button always returns to the previous page, regardless of origin (operators, overview, compare, etc.).

### 3. OperatorDetailView back — already correct
The `onBack` in `OperatorsPanel` already uses state (`setSelectedOperator(null)`) which returns to the operators list. No change needed here.

### Summary
- **2 files** modified: `OperatorsPanel.tsx`, `BlockPage.tsx`
- ~5 lines changed total

