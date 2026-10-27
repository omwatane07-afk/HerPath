# HERPATH Phase 0: System & Architectural Audit

**Date**: 2026-10-27  
**Branch**: `redesign/ink-peacock`  
**Auditor**: Lead Frontend Architect & Systems Engineer  

---

## 1. Stack & Tooling

| Component | Current Technology | Version / Configuration | Notes |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 14.2.35 | Server and Client components with dynamic imports for Leaflet |
| **Runtime & Language** | Node.js + TypeScript | Node v24.18.0 / TS 5.7.3 | Strict type checking (`tsc --noEmit`) passes cleanly |
| **Styling** | Tailwind CSS + PostCSS | Tailwind 3.4.17 | Contains legacy "Royal Soft Glass" system with heavy glassmorphism, champagne gold, and teal accents |
| **Icons** | Lucide React | 0.475.0 | Comprehensive icon set |
| **State & Persistence** | React Hooks + LocalStorage | `StorageRepository` in `src/lib/storage.ts` | Local persistence with custom event dispatching (`herpath_storage_update`) |
| **Backend Integration** | Supabase JS Client | `@supabase/supabase-js` 2.49.1 | Optional connection; fallback to local offline mode |

---

## 2. Map Provider & Tile Architecture

- **Map Library**: Leaflet `1.9.4` via `react-leaflet` `4.2.1`
- **Tile Architecture**: Raster OpenStreetMap tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`)
- **Building Height Data**: **None**. Standard raster tiles do not provide vector polygon geometry or building height/extrusions.
- **Map Camera & State**: Map state is controlled via React-Leaflet's `MapContainer`, `useMap`, and a `MapBoundsController` helper.
- **3D Decision Tree Outcome**:
  - **Decision Rule**: *Leaflet with raster tiles: do NOT fake 3D buildings with CSS. Keep a clean flat map. Do not migrate providers.*
  - **Result**: Keep a pristine, flat basemap. Mute and warm-tint raster tiles via CSS filters (`saturate(0.55) sepia(0.12) brightness(1.02)`), hide extraneous POI clutter where feasible, and style routes cleanly. 3D building extrusions are skipped per decision rule. A future MapLibre GL vector migration will be documented in the final report.

---

## 3. Routing Engine & Geometry Truthfulness

- **Routing Provider**: OSRM walking profile (`https://router.project-osrm.org`) with a local corridor generator fallback (`generateSyntheticRouteAlternatives` in `src/services/routing-service.ts`).
- **Elevation Data**: **None**. Neither OSRM nor local mock data provides elevation profiles. Per non-negotiable truthfulness rules, no fake elevation charts will be rendered.
- **Geometry Truthfulness**:
  - OSRM returns real pedestrian coordinates along OpenStreetMap ways.
  - The fallback generates synthetic offset corridors.
  - **Required Action**: Explicitly label synthetic corridors as *"Approximate path"* with a distinct dashed stroke style (`dashArray: '6, 8'`), reserving solid Peacock strokes for real navigable geometry.

---

## 4. Animation & Motion Tooling

- **Current Tooling**: Basic Tailwind CSS transitions (`duration-300`, `ease-out`) and ad-hoc CSS keyframes (`pulseSubtle`, `fadeIn`, `slideInRight`).
- **Motion System Plan**: Implement unified CSS motion tokens:
  - `--dur-micro: 150ms`
  - `--dur-card: 220ms`
  - `--dur-scene: 400ms`
  - `--dur-route: 800ms`
  - Strict `prefers-reduced-motion` compliance via CSS media query and `useReducedMotion()` hook.
  - Implement selective 15-effect matrix: route draw (SVG stroke-dashoffset), route switch transition, marker lift, leader line, layers popover, and 3-snap bottom sheet.

---

## 5. Security & Backend Policy Audit

- **Supabase Policies (`supabase/schema.sql`)**:
  - **CRITICAL FINDING**: Line 155-163 defines `create policy "Allow read journey by share token" on public.journey_sessions for select using (true);` and `create policy "Allow checkins read" on public.journey_checkins for select using (true);`.
  - **Issue**: This grants unrestricted public read access to all user journey sessions and GPS check-ins regardless of token or user identity.
  - **Action**: Flagged prominently in this audit and final report. Storage in demo mode uses browser localStorage; cross-device sync claims must remain honest.

---

## 6. Baseline Verification & Quality Checks

| Check | Baseline Command | Result | Notes |
|---|---|---|---|
| **Unit / Service Tests** | `npm test` | **20 passed, 0 failed** | Tests utility math, freshness policies, OSRM fallback, route context engine, and factor accounting |
| **Type Check** | `npm run typecheck` | **0 errors** | Clean TypeScript compilation |
| **Lint** | `npm run lint` | Exited (code 1) | `eslint` package is not configured in devDependencies. TypeScript strict checks are primary. |
| **Production Build** | `npm run build` | **Compiled successfully** | Static generation completed in ~2.2s |
| **Dev Server** | `npm run dev` | **Running on port 3000** | Ready and serving requests |

---

## 7. Baseline Visual References

Baseline screenshots captured at 1440×900 (Desktop) and 390×844 (Mobile) are stored in `scratch/`:
- `scratch/desktop-1440x900.png`
- `scratch/desktop-routes-evaluated.png`
- `scratch/mobile-390x844.png`
- `scratch/mobile-routes-evaluated.png`
