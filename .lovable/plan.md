

## Plan: Independent Pages for Operator Detail & Facilities Detail

### Problem
Currently, clicking an operator in the Operators panel and a facility in the Facilities panel renders detail views **inline via state**, so there's no URL change and no browser history entry. The "Voltar" buttons just reset state instead of navigating back.

### Solution
Create dedicated routes for operator detail and facility detail, using `react-router-dom` navigation. The back buttons will use `navigate(-1)` (already proven in `BlockPage.tsx`).

### Changes

**1. New page: `src/pages/OperatorPage.tsx`**
- Route: `/operator/:operatorName`
- Extracts `operatorName` from URL params, builds the `OperatorSummary` from `oilBlocks` data
- Renders the existing `OperatorDetailView` component (extracted/exported from `OperatorsPanel.tsx`)
- Back button uses `navigate(-1)`
- Includes the same header/footer pattern as `BlockPage.tsx`

**2. Refactor `src/components/dashboard/OperatorsPanel.tsx`**
- Export `OperatorDetailView` and `buildOperators` so they can be reused
- Change `OperatorListView` cards to use `<Link to={/operator/${encodeURIComponent(op.name)}}>`  or `navigate()` instead of `onSelect` state
- Remove `selectedOperator` state from `OperatorsPanel` — it becomes a pure list
- Change `OperatorDetailView`'s `onBack` to use `navigate(-1)`

**3. Refactor `src/components/dashboard/FacilitiesIntegrityPanel.tsx`**
- Same pattern: the "Voltar à lista" button currently resets `selectedFacility` state
- Change to use `navigate(-1)` with a route `/facility/:facilityName` or, simpler approach: use `window.history` pushState to create a history entry when selecting a facility, so back works naturally without a full route
- Given the facility detail is lightweight, the simplest approach: push a hash/search param when selecting, and use `navigate(-1)` for back

**4. Update `src/App.tsx`**
- Add route: `<Route path="/operator/:operatorName" element={<ProtectedRoute><OperatorPage /></ProtectedRoute>} />`

### Files changed
- `src/pages/OperatorPage.tsx` (new)
- `src/components/dashboard/OperatorsPanel.tsx` (refactor to export detail view, list uses links)
- `src/components/dashboard/FacilitiesIntegrityPanel.tsx` (back button uses navigate(-1) with history entry)
- `src/App.tsx` (add operator route)

