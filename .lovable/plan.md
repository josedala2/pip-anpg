

# Angola Oil Concessions — Executive Intelligence Dashboard

## Design System
- Dark premium theme with deep navy/charcoal palette
- Large executive-readable typography
- Subtle glow effects and smooth transitions
- Mobile-first responsive layout (tablet + high-end mobile optimized)
- No website navigation — pure dashboard experience

## Panel 1: National Overview
- Interactive SVG map of Angola with clickable oil blocks, color-coded by status (Exploration, Development, Production, Suspended)
- Top KPI cards with animated counters: Total Production (BOPD), Estimated Reserves, Active Blocks, CAPEX in Progress, Execution Rate %
- Multi-layer filter bar: by operator, basin, phase, production range

## Panel 2: Block Detail (slide-in panel on block click)
- Operator, partners, contract date, current phase, daily production, reserves, accumulated investment
- Planned vs actual timeline visualization
- Internal risk score indicator
- Production over time chart (Recharts area chart)
- CAPEX vs Plan chart (bar chart)
- Compliance indicator (radial gauge)

## Panel 3: Risk & Performance
- Heatmap grid of blocks by risk level
- Sortable ranking table: production, delay, investment execution, financial exposure
- Visual alert badges: Red (critical), Orange (below plan), Green (above target)

## Panel 4: Strategic Forecast
- Scenario selector (Conservative / Base / Expansion)
- 5–10 year production projection line chart
- Fiscal impact estimation cards

## Panel 5: Board Presentation Mode
- Fullscreen toggle button
- Swipe/arrow navigation between panels
- Slide-like transitions with large KPI highlight mode
- Clean presenter-friendly layout

## Data
- Realistic mock data for ~15 Angola oil blocks with operators (Sonangol, TotalEnergies, BP, ENI, Chevron, etc.)
- Production, reserves, investment, and timeline data

## Technical Approach
- All panels accessible via tab/swipe navigation (no traditional nav)
- Recharts for all charts
- Framer-free CSS animations for transitions
- Responsive grid layout optimized for tablets

