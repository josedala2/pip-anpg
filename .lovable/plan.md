

## Plan: Update Test Accounts & Redesign Login Page

### 1. Update Test Accounts

Replace the current 3 accounts with 6 new ones:

| Role | Email | Password | Icon |
|------|-------|----------|------|
| Administrador | admin@anpg.co.ao | admin123 | Shield |
| Técnico DPRO | dpro@anpg.co.ao | dpro123 | Factory (production) |
| Técnico DEX | dex@anpg.co.ao | dex123 | Search (exploration) |
| Técnico DNEG | dneg@anpg.co.ao | dneg123 | Handshake (negotiation) |
| Técnico DEC | dec@anpg.co.ao | dec123 | Scale (economics) |
| Conselho de Administração | conselho@anpg.co.ao | conselho123 | Crown |

The seeding logic remains the same (signUp on first load).

### 2. Pro Login Layout Redesign

Transform from a simple centered card into a split-screen enterprise layout:

- **Left panel (60%)**: Dark branded hero area with:
  - Angola satellite background image (already in assets) with dark overlay
  - ANPG white logo (already in assets: `anpg-logo-white.svg`)
  - Headline: "Sistema de Gestão de Concessões Petrolíferas"
  - Subtitle with key stats (e.g. "Monitorização de blocos, produção e exploração")
  - Decorative grid/dots pattern for polish

- **Right panel (40%)**: Clean white/light panel with:
  - Color ANPG logo at top
  - "Iniciar Sessão" form (email + password)
  - Test accounts displayed as a compact 2-column grid of role chips below the form
  - Clicking a chip auto-fills credentials and optionally auto-submits
  - Footer: "© 2025 ANPG — Agência Nacional de Petróleo, Gás e Biocombustíveis"

- **Mobile**: Stacks vertically — hero collapses to a small branded header, form takes full width.

### Files Changed

- `src/pages/LoginPage.tsx` — full rewrite with split layout, new accounts array, responsive design.

