

## Plan: Add vertical scroll with max-height to auto-height tables

Two tables use `height="auto"` and can grow very tall when many blocks are expanded. Add a `max-height` with `overflow-y: auto` to their content containers.

### Changes

**`src/components/dashboard/FieldProductionBreakdown.tsx`** (line ~172)
- Wrap the table `div` with `max-h-[500px] overflow-y-auto` so the "Campos por Bloco" table scrolls when content exceeds 500px.

**`src/components/dashboard/ProductionPanel.tsx`** (line ~321)
- Same: add `max-h-[500px] overflow-y-auto` to the table container div for "Produção por Bloco".

Two lines changed total — minimal, focused fix.

