# HERPATH Redesign & Implementation Report: Nightbloom & 3D City Extrusion

**Date**: 2026-10-28  
**Design Direction**: **Nightbloom (Aubergine Ink, Electric Violet Route, Champagne Accents)**  
**Status**: Completed, Verified & Running on Production Server (`http://localhost:3000`)  

---

## 1. Executive Summary & Design System Transformation

HERPATH has undergone a complete architectural and visual redesign to implement **Nightbloom**, the winning palette and layout specification from rigorous multi-candidate evaluation (scoring **8.82/10** on weighted product criteria).

### Critical Problems Solved
1. **Zero Route vs. Emergency Hue Clash**: In previous iterations, the route (raspberry `#C8415F`) and emergency token (`#C21428`) sat adjacent in color space. Under stress or color vision deficiencies, route guidance and danger cues collided. Nightbloom migrates the route strictly to **Electric Violet (`#5A2FC2`)**, keeping emergency red exclusively on the SOS jewel.
2. **Full-Bleed Spatial Canvas**: The previous design nested the Leaflet map inside a boxed card, wasting roughly half the vertical viewport height. The new layout renders the map **full-bleed edge-to-edge** behind a floating 440px desktop card panel (`top-4 left-4 bottom-4`, `rounded-[20px]`, `border border-border`, `shadow-e2`).
3. **Reclaimed Vertical Height**:
   - Retired the abstract 220px 3D ribbon widget (`SpatialJourneyOrb`) from the route planner panel, giving all vertical space back to the route options and explainable factor cards.
   - Removed the stale top banner ("How route information works") and placed it inside a discreet info popover in the 56px header.
   - Isolated the active trip status strip exclusively to the Family module, preventing stale "completed" indicators from polluting other views.
4. **Muted Desaturated Basemap**: Replaced competing raster fills with an architectural muted light basemap using custom CSS lightness/desaturation filters (`grayscale(90%) contrast(0.88) brightness(1.06) sepia(0.06)`), ensuring the electric violet route line and amber hazard markers command 100% visual priority.
5. **Phase B 3D City Extrusion Mode**: Integrated `maplibre-gl` with a 55° camera pitch and vector `fill-extrusion` building geometry (OpenFreeMap Positron), toggleable via a floating "3D City" switch with instant 2D Atlas fallback.

---

## 2. Nightbloom Token System & WCAG 2.2 Contrast Verification

All tokens are defined in `tailwind.config.ts` and `src/app/globals.css`. Contrast was verified programmatically with `scratch/test-nightbloom-contrast.js` using the official W3C relative luminance formula:

| Token Name | Hex Value | Semantic Role & Strict Usage Rule | Computed Contrast | WCAG Status |
|---|---|---|---|---|
| `ink` | `#1E0F28` | Primary text; header background, dark chrome | 16.5:1 on canvas<br>18.2:1 on card | **AAA Pass** |
| `ink-2` | `#3A1C4A` | Elevated dark surfaces, modal headers | 11.2:1 on canvas | **AAA Pass** |
| `canvas` | `#F7F3EE` | App background, secondary containers | Neutral Base | Base |
| `canvas-2` | `#EEE8E1` | Segmented controls, input fill background | Neutral Secondary | Base |
| `card` | `#FFFFFF` | Cards, panels, modal dialogue surfaces | Clean White | Base |
| `raised` | `#FBF8F4` | Hovered card state, selected option surfaces | Neutral Elevated | Base |
| `primary` | `#5A2FC2` | **Selected route only**, primary action button, focus rings | 8.0:1 on white<br>7.3:1 on canvas | **AAA Pass** |
| `primary-hover`| `#46229C` | Pressed and hover state for primary buttons | 10.4:1 on white | **AAA Pass** |
| `primary-tint` | `#EDE5FA` | Active chip background, selected tab pill | 1.2:1 on white | Non-text tint |
| `route-alt` | `#6E6090` | Alternative comparison corridors (dashed) | 4.4:1 vs map base | **AA Graphic Pass** |
| `champagne` | `#C9A25E` | Decorative only: rules, badges, accents on dark surfaces | 7.6:1 on ink | **AAA Pass** |
| `champagne-text`| `#7A5A1E`| Champagne text when rendered on light surfaces | 6.4:1 on card | **AA Pass** |
| `text-primary` | `#1E0F28` | High-contrast editorial and UI text | 18.2:1 on card | **AAA Pass** |
| `text-2` | `#5E5068` | Supporting body copy, factor descriptions | 7.4:1 on card | **AAA Pass** |
| `text-muted` | `#6F6179` | Timestamps, helper notes, non-critical labels | 5.7:1 on card | **AA Pass** |
| `border` | `#E4DCD3` | Hairline card boundaries and section dividers | 1.3:1 vs white | Decorative divider |
| `border-control`| `#867B72`| **Input boundaries, search boxes, interactive controls** | 4.1:1 on white<br>3.7:1 on canvas | **AA UI Pass (>=3:1)** |
| `verified` | `#1F6B4D` | Verified municipal status, step-free amenity, open | 5.6:1 on tint (`#E6F3EC`) | **AA Pass** |
| `caution` | `#A8560A` | Community reports, maintenance outages, stale data | 4.2:1 vs map base<br>6.2:1 on tint (`#FDF2E3`) | **AA UI Pass** |
| `info` | `#1F5FA8` | Transit stops, universal information | 5.8:1 on tint (`#EEF4FC`) | **AA Pass** |
| `error` | `#9E1B24` | Form validation text only (never filled button) | 6.9:1 on tint (`#FCEAEB`) | **AA Pass** |
| `unknown` | `#6F6179` | Hatched segments, uninspected municipal gaps | 4.5:1 vs map base | **AA UI Pass** |
| `emergency` | `#C21428` | **SOS only** (isolated button, active emergency modal) | 6.1:1 on white<br>5.6:1 on canvas | **AA Pass** |

---

## 3. Strict Functional Separation Rules

1. **Violet (`#5A2FC2`)**: Exclusively reserved for the active selected route, the single primary CTA per card, active navigation pills, and keyboard focus rings. Never used for hazards, facilities, or emergency.
2. **Crimson Red (`#C21428`)**: Exclusively reserved for the SOS control and active emergency dials. Never appears as a decorative element, alert border, or standard badge.
3. **Amber (`#A8560A`)**: Denotes reported or stale community observations. It represents caution, never emergency.
4. **Gray Hatch / Muted Slate (`#6F6179`)**: Explicitly indicates unmapped or missing municipal data. Lack of data is rendered truthfully as "Unknown", never converted into an arbitrary danger rating.
5. **Champagne (`#C9A25E`)**: Used as an ornamental detail on dark ink surfaces or as decorative hairlines. When text is required on light card surfaces, the darkened `#7A5A1E` token is applied.

---

## 4. Architectural Layout & Modules

### 56px Dark Ink Header
- Background in `ink` (`#1E0F28`) with a 1px `champagne/20` bottom hairline.
- Fraunces serif wordmark "HERPATH" paired with a compact "NIGHTBLOOM" badge.
- Centered module navigation dock (Plan Route, Explore, Places, Reports, Family, Civic) with active violet pill.
- Info popover icon replaces the former bulky banner, restoring all top vertical space.
- Direct SOS jewel in crimson `#C21428`.

### Floating Card Panel (Desktop)
- Fixed at `top-4 left-4 bottom-4` with a fixed width of `440px`.
- Architectural `rounded-[20px]`, 1px border in `border`, and atmospheric depth `shadow-e2`.
- Single primary button (`btn-primary`, 44px min height) per card.

### Perspective Tabs & Factor Breakdown
- 3 route perspectives: **Fastest Path** (Direct walking), **Better-Supported** (Commercial corridor & active streetfronts), and **Balanced**.
- Factor cards highlight verified streetlights, open pharmacies, restrooms, and verified transit connections with source provenance.
- Absolute refusal to label any route as "100% safe" or score risk on missing data.

### Map Architecture & 3D City Mode
- **2D Atlas (Default & Robust Fallback)**: Leaflet container with desaturated raster tiles, 6px `#5A2FC2` selected corridor with 10px `#FFFFFF` casing halo, 4px dashed `#6E6090` alternatives, shape- and glyph-encoded HTML DivIcons.
- **3D City Mode (Feature-Flagged)**: MapLibre GL implementation with 55° camera pitch, -15° bearing, and vector `fill-extrusion` building geometry (OpenFreeMap Positron). Shares the exact same GeoJSON route coordinates and marker points.

---

## 5. Verification & Test Suite Results

### Automated Suite (`npm test`)
- 20 / 20 tests passed:
  - Distance & duration formatting
  - 24-hour freshness & staleness threshold
  - 3 OSRM corridor generation
  - Explainable route factor cards (lighting, facilities, transit)
  - Strict absence of "100% safe" claims

### TypeScript Validity (`npm run typecheck`)
- Clean zero-error compilation with `--noEmit`.

### Production Build (`npm run build`)
- Next.js 14.2.35 production build compiled successfully with 0 warnings.
- Server running cleanly on `http://localhost:3000`.

### Visual Inspection Across Viewports
12 full-fidelity screenshots captured and inspected:
- Desktop (1440x900): `route`, `map`, `facilities`, `reports`, `family`, `civic`.
- Mobile (390x844): `route`, `map`, `facilities`, `reports`, `family`, `civic`.
- 3D City toggle verified via browser subagent with video recording `toggle_3d_city_mode_1793129998413.webp`.
