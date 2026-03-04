

## Plan: Populate Block 0 with Real Data from Spreadsheet

### Objective
Replace the placeholder/sample data for Block 0 in `src/data/angolaBlocks.ts` with the real data extracted from the uploaded `Bloco_O.xlsx` spreadsheet.

### Data Extracted from Spreadsheet

**Page 1 - Seismic Data (2D/3D/4D km):**
Real yearly seismic acquisition data from 1993 to 2024, including 2D (5,179 km total), 3D (9,785 km total), and 4D (8,082 km total).

**Page 2 - Wells Summary Table:**
Annual well counts by status from 1966 to 2025. Totals: 144 Pesquisa, 84 Avaliação = 228 wells total. Discoveries: 57 commercial, 32 non-commercial, 55 dry.

**Page 2 - Wells Detail:**
Individual well names with discovery fields including Takula, Malongo Norte/Sul/West, Limba, Wamba, Kali, N Kassa, Livuite, Kungulo Lola, Banzala, Bomboco, Vanza, N'tene, Senha, Sanzamo, Lifuma, Nemba, Sanha, Vuko, and more.

### Implementation Steps

1. **Update seismic data** for Block 0 with real yearly values (1993-2024) replacing the generic 5-year interval placeholders.

2. **Update wells data** for Block 0 with the real annual summary (pesquisa + avaliação counts per year from 1966-2025).

3. **Update fields array** with all discovered fields extracted from the wells detail, including discovery years and status.

4. **Update geological objectives** based on the reservoir types found in the well data (Pinda, Pre-Salt, etc.).

### Technical Details

- File to modify: `src/data/angolaBlocks.ts` (Block 0 entry, lines 76-152)
- Replace `seismicData` array with ~25 yearly entries from real data
- Replace `wellsData` array with yearly summary counts (consolidating years with activity)
- Expand `fields` array with all discovered fields (Takula, Malongo N/S/W, Limba, Wamba, Kali, N Kassa, Livuite, Kungulo Lola, Banzala, Bomboco, Vanza, N'tene, Senha, Sanzamo, Lifuma, Nemba, Sanha, Vuko, Desc Pinda, etc.)
- Keep existing `concession`, `mapPosition`, `productionHistory`, `capexHistory`, `projections`, and `prospects` data as-is (no changes from spreadsheet)

