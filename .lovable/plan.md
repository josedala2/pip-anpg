

## Problem

`ChartWrapper` renders `children` inside `<div style={{ height: 400 }}>`. The treemap's `ResponsiveContainer` already uses all 400px, so the legend and footer text overflow outside the visible card area — appearing "behind" or below the card boundary.

## Solution

**File: `src/components/dashboard/FieldProductionBreakdown.tsx`**

Move the legend and footer text **outside** the `ChartWrapper`, but wrap everything (ChartWrapper + legend + footer) in a shared `Card`-like container. However, the simpler approach: increase the `height` prop passed to `ChartWrapper` to accommodate the legend, and restructure children so the `ResponsiveContainer` has an explicit smaller height while legend sits below it within the allocated space.

Concretely:
1. Pass `height={520}` to `ChartWrapper` to give room for both the 400px treemap and the legend below
2. Remove `height={400}` from `ResponsiveContainer` and set it to a fixed `340px` so the legend and note fit within the remaining ~180px
3. Keep the legend and footer text as children — they'll now fit inside the allocated card space

This is the minimal change that keeps the legend visually inside the card.

