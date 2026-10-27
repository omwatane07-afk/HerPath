# HERPATH Redesign & Implementation Report: Bordeaux Atelier & Luminous Rose Gold

**Date**: 2026-10-28  
**Design Direction**: **Bordeaux Atelier & Luminous Rose Gold / Champagne**  
**Status**: Completed, Verified & Deployed to Local Production Server (`http://localhost:3000`)  

---

## 1. Executive Summary & Creative Direction

HERPATH has undergone a comprehensive visual identity reset, completely shedding the conventional municipal dashboard language, the former teal-and-white aesthetic, and the previously rejected Ink & Peacock theme. 

The application has been reconstructed around **Bordeaux Atelier**: a research-led, high-end editorial and immersive travel aesthetic combining the warmth of cashmere alabaster, deep velvety bordeaux typography, luminous rose gold corridor accents, and champagne navigation details. 

Rather than a flush, utilitarian split-screen, the interface introduces a **Framed Luxury Atlas** spatial composition:
1. **The Floating Atelier Desk**: A 24px curved (`rounded-atelier`) console floating above the warm cashmere canvas (`#FAF6F0`), featuring bespoke editorial card surfaces, refined micro-borders, and tactile controls.
2. **The Framed Luxury Atlas**: The Leaflet map is now framed within an architectural 24px curved boundary with subtle golden shadows (`shadow-atelier`), backed by a quieted sepia-toned raster basemap filter (`sepia(0.24) hue-rotate(315deg) contrast(0.96) saturate(0.68)`).
3. **Purposeful 3D WebGL Elevation Horizon**: An interactive Three.js component (`SpatialJourneyOrb`) renders a real-time 3D Catmull-Rom elevation spline of the selected journey with rotating celestial trajectory rings, orbiting waypoint satellites, starlight particle atmosphere, and mouse-tilt parallax damping.

All functional features—OSRM pedestrian routing calculations, contextual safety evaluation engine, facilities directory, community reporting, family check-in tracking, and civic infrastructure auditing—remain fully preserved and strictly truthful.

---

## 2. Complete Color System & Exact Hex Tokens

| Semantic Role | Token Name | Hex Value | Rationale & Usage |
|---|---|---|---|
| **Main Background** | `--canvas` | `#FAF6F0` | Warm Cashmere Alabaster; eliminates harsh screen glare while providing an editorial luxury paper feel. |
| **Secondary Background** | `--velvet-surface` | `#F4EFE6` | Soft Alabaster Cream; used for elevated section groupings, drawers, and nested containers. |
| **Card Surface** | `--surface-card` | `#FFFFFF` | Crisp White card surface with soft 1px Champagne borders (`rgba(212, 163, 89, 0.28)`). |
| **Elevated Surface** | `--surface-elevated` | `#FCFAF7` | Subtle warmth for floating map controls, popovers, and interactive modals. |
| **Primary Brand Color** | `--bordeaux` | `#240D1E` | Bordeaux Noir; haute couture primary ink for major editorial headlines, primary CTA buttons, and active tabs. |
| **Secondary Brand Color** | `--velvet` | `#4A1E35` | Deep Velvet Plum; used for secondary headlines, metadata accents, and inactive state icons. |
| **Accent / Route Color** | `--rose-gold` | `#C8415F` | Luminous Rose Gold; primary selected walking route line (6.5px with white casing), active radio toggles, and selection halos. |
| **Luxury Accent** | `--champagne` | `#D4A359` | Warm Champagne Gold; active navigation micro-dots, star accents, layer toggle highlights, and luxury badges. |
| **Main Text** | `--text-primary` | `#240D1E` | High-contrast Bordeaux Noir for uncompromised readability (15.8:1 contrast on white). |
| **Supporting Text** | `--text-secondary` | `#6E5866` | Velvet Heather; subdued editorial secondary text (5.8:1 contrast). |
| **Muted Metadata** | `--text-muted` | `#947F8C` | Velvet Slate; non-critical metadata, helper notes, and timestamp labels. |
| **Borders** | `--border-gold` | `#E8DFD3` | Restrained golden sand hair-lines (`rgba(212, 163, 89, 0.35)`). |
| **Selected Route** | `--route-selected` | `#C8415F` | Rose Gold polyline (6.5px) with 12px white separation casing halo. |
| **Alternative Routes** | `--route-alt` | `#7D6674` | Muted Velvet Slate at 45% opacity for secondary route comparisons. |
| **Verified / Success** | `--verified` | `#1C6B48` | Deep Emerald Velvet; used for verified facilities and corroborated reports. |
| **Caution** | `--caution` | `#BA6A15` | Amber Gold; used for unverified maintenance observations and alerts. |
| **Hazard** | `--hazard` | `#9E1B24` | Crimson Velvet; used for documented community safety hazards. |
| **Emergency SOS** | `--emergency` | `#C21428` | Pure Crimson Jewel; stable, un-animated, immediately accessible emergency button. |

---

## 3. Typographic Identity

- **Haute Display Serif**: **Playfair Display** (`font-serif`, Google Font)
  - Applied to the main `HERPATH` editorial wordmark, section titles (`Plan Journey`, `Essential Facilities`, `Civic Infrastructure Insights`), modal headers, and italicized ETA numbers (`22 min`).
  - Weights: 600 Semi-Bold, 700 Bold, and 400 Italic.
- **Clean Interface Sans**: **Plus Jakarta Sans** (`font-sans`, Google Font)
  - Applied to all functional buttons, form controls, route metadata, distance indicators, navigation pills, and data cards.
  - Weights: 400 Regular, 500 Medium, 600 Semi-Bold, 700 Bold.
- **System Fallbacks**: Configured with `Georgia`, `system-ui`, `-apple-system`, and `sans-serif` for zero layout shifts and offline reliability.

---

## 4. Purposeful 3D & Immersive Features

### A. WebGL 3D Spatial Journey Orb (`SpatialJourneyOrb.tsx`)
- **Technology**: Genuine Three.js WebGL canvas (`'use client'`).
- **3D Elevation Curve**: Computes a dynamic 3D `CatmullRomCurve3` spline from the selected route's length and step count, rendering an illuminated 3D path with `TubeGeometry` and `MeshStandardMaterial` in luminous Rose Gold (`#C8415F`).
- **Orbital Trajectory Rings**: Two concentric wireframe `TorusGeometry` rings in Champagne (`#D4A359`) rotate along distinct 3D axes at slow orbital velocities.
- **Satellite Waypoints**: 3D origin (Bordeaux `#240D1E`) and destination (Rose Gold `#C8415F`) spheres positioned at the start and apex of the elevation profile.
- **Particle Atmosphere**: Starlight ambient point cloud (`PointsMaterial`, 45 particles) creating physical depth.
- **Interactive Damping**: Mouse movement tilts the 3D scene smoothly with damping interpolation (`delta * 2.5`).
- **Accessibility & Performance Fallback**: Automatically provides an SVG contour fallback if WebGL is unavailable or when `prefers-reduced-motion` is active.

### B. Framed Luxury Atlas with Cartographic Harmony
- The Leaflet basemap is styled with a custom warm-tone matrix: `filter: sepia(0.24) hue-rotate(315deg) contrast(0.96) brightness(1.02) saturate(0.68)`.
- Eliminates harsh raw satellite/OSM colors and creates a velvety parchment aesthetic that allows Rose Gold polylines and Champagne markers to shine.
- The map is physically separated from the viewport edge on desktop by a 24px margin with architectural rounding (`rounded-atelier`) and soft champagne drop shadows.

### C. Hand-Authored Isometric Civic Visuals
- Inline SVG isometric streetlight corridor illustration in `CivicInsightsView.tsx` with true 30-degree isometric projection, ground grid, and illuminated luminaire cone.
- Captioned explicitly as *"Illustration, not a map record"* to preserve strict geographic truthfulness.

---

## 5. Unified Animation & Motion System

- **Tokenized Timing**:
  - `transition-fast`: `150ms cubic-bezier(0.16, 1, 0.3, 1)` for immediate button states, icon hover, and micro-toggles.
  - `transition-base`: `250ms cubic-bezier(0.16, 1, 0.3, 1)` for card selection, layer popover opens, and tab switches.
  - `transition-smooth`: `400ms cubic-bezier(0.16, 1, 0.3, 1)` for drawer expansions and modal reveals.
- **Route Selection Feedback**: Selected route card glides up by 2px with a rose gold glow; the Leaflet polyline activates with smooth boundary fitting (`MapBoundsController`).
- **Accessible Motion Overrides**: Full `@media (prefers-reduced-motion: reduce)` in `globals.css` completely disables transforms, scales, and canvas animations.

---

## 6. Redesigned Modules & Interaction Verification

1. **Header & Navigation (`Header.tsx`, `MobileNav.tsx`)**:
   - Compass atelier crest, Playfair Display title with gold "ATELIER" badge.
   - Floating Bordeaux capsule for active module with champagne dot indicator.
   - Persistent 56px Crimson SOS jewel with phone handset icon and bold SOS typography.
2. **Plan Route (`RoutePlanner.tsx`, `RouteCard.tsx`, `RouteContextDrawer.tsx`)**:
   - Connected origin/destination inputs with vertical gold connector.
   - Integrated `SpatialJourneyOrb` 3D preview card.
   - Playfair italic numerals for journey durations (`22 min`).
   - Multi-factor breakdown drawer with full transparent evidence scores.
3. **Explore Map (`ExploreControls.tsx`, `LeafletMap.tsx`, `LeafletInnerMap.tsx`)**:
   - Floating search pill with Champagne focus ring.
   - Consolidated Layers popover with active layer counts.
   - Selected marker slide-in card with quick routing actions.
4. **Essential Facilities (`FacilitiesView.tsx`)**:
   - Curated directory aesthetic with verified civic badges.
   - Step-free access and female staff on duty badges.
   - Truthful hours display ("Hours not listed" when unknown).
5. **Community Reports (`ReportList.tsx`, `ReportModal.tsx`)**:
   - 3-step structured report wizard with direct emergency disclaimer.
   - "Saved on this device only (Demo Mode)" storage transparency note.
   - Corroboration counter without gamification badges.
6. **Family Trips (`FamilyTripsView.tsx`, `ActiveJourneyBanner.tsx`, `FamilyJourneyModal.tsx`)**:
   - Trusted contacts cards above the fold with 44px Call actions.
   - Unmissable, permanent "Stop sharing" button in banner and views.
   - Check-in countdown timer with "I'm OK" quick response.
7. **Civic Insights (`CivicInsightsView.tsx`)**:
   - Prominent infrastructure principle: *"Missing information indicates a data gap or potential physical maintenance need. It does not establish that a neighborhood is unsafe."*
   - Hand-authored isometric streetlight illustration.
   - Scoped corridor metrics ("4 working, 2 reported out in 400m radius").
8. **Emergency SOS (`EmergencyModal.tsx`)**:
   - High-contrast, distraction-free emergency dispatch sheet.
   - Dedicated buttons for 112 Universal Emergency and 1091 Women Helpline.
   - Instant GPS coordinate copy with share intent.

---

## 7. Verification Results & Build Status

| Verification Check | Target | Result | Status |
|---|---|---|---|
| **TypeScript Typecheck** | `tsc --noEmit` | `0 errors` | **PASSED** |
| **Logic & Safety Tests** | `npm test` (`suite.js`) | `20 / 20 passed` | **PASSED** |
| **Next.js Production Build** | `npm run build` | `4/4 static pages generated` | **PASSED** |
| **Local Production Server** | `http://localhost:3000` | Ready in 221ms | **RUNNING** |
| **Visual Render Inspection** | 12 captured browser screenshots | Verified across desktop & mobile | **VERIFIED** |

### Verified Screenshots (`scratch/atelier/`):
- Desktop (1440×900): `desktop-1440-route.png`, `desktop-1440-map.png`, `desktop-1440-facilities.png`, `desktop-1440-reports.png`, `desktop-1440-family.png`, `desktop-1440-civic.png`
- Mobile (390×844): `mobile-390-route.png`, `mobile-390-map.png`, `mobile-390-facilities.png`, `mobile-390-reports.png`, `mobile-390-family.png`, `mobile-390-civic.png`

---

## 8. Remaining Limitations & Future Opportunities

1. **Vector Basemap 3D Extrusion**: Leaflet uses OpenStreetMap 2D raster tiles. When the team transitions to vector tiles (e.g., MapLibre GL JS with OpenMapTiles), real 3D building heights with user pitch control can be unlocked natively on the primary map.
2. **Real-Time WebSockets for Family Tracking**: The active journey currently relies on client-side interval simulation and local storage. Integrating Supabase Realtime with secure token-gated channel policies will enable live cross-device companion tracking.
