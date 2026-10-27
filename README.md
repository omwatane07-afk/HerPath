# HERPATH: Safety-Aware Navigation + Family Journey Companion

> **"Know your route. Understand the surroundings. Keep your people connected."**

HERPATH is a modern, inclusive, safety-aware navigation and trip companion platform designed for women, students, elderly commuters, and everyday travellers. Unlike traditional navigation apps that merely optimize for Euclidean distance or raw travel time, HERPATH equips users with transparent infrastructure context—illuminated streetlights, community-reported disruptions, nearby essential facilities, and consent-based family journey sharing.

HERPATH is built around **honest decision-support**: it strictly avoids false promises of "100% safety", predictive crime profiling, or covert crowd surveillance. Unknown road segments are presented honestly as unknown.

---

## 🌟 Key Functional Features

### 1. Interactive Route Planner & Perspectives
- **Three Transparent Perspectives**:
  - **Fastest:** Prioritises shortest physical distance and minimal walking time.
  - **Balanced:** Balances travel time against documented road and infrastructure conditions.
  - **Better-Supported:** Prioritises stretches with active streetlights, open essential facilities, and public transit hubs.
- **Explainable Factor Cards:** Factor-by-factor breakdown of lighting, facilities, transit proximity, and active community notices.
- **Turn-by-Turn Waypoints:** Step-by-step pedestrian guidance with distance and estimated walking paces.
- **Routing Abstraction:** Integrates with OpenStreetMap OSRM routing with a local corridor generator fallback.

### 2. Streetlight & Road Condition Telemetry
- Transparent statuses: `working` (illuminated), `malfunctioning` (off), `partial_outage`, `resolved`, and `unknown`.
- Freshness policy: Fresh reports vs. stale (>24-48h) tracking.
- Interactive map markers with direct submission workflows to report dark spots or luminaire outages.

### 3. Crowd & Isolation Context
- Distinguishes mapped public thoroughfares from isolated alleys.
- Clear data-gap notifications: Missing observations are explicitly labelled as "Unknown Conditions" rather than falsely assumed empty or secure.
- Zero covert tracking: No stranger surveillance or facial recognition.

### 4. Community Disturbance Reporting
- Verified categories: Harassment concerns, disruptive groups, broken footpaths, blocked roads, transport disruptions, and facility unavailability.
- Real commuter actions: Upvote / corroborate reports, flag inaccurate items, and mark issues resolved.
- Full privacy preservation: Reporter identity is never exposed publicly.

### 5. Public Transport Discovery
- Mapped metro stations, railway terminals, and bus shelters.
- Highlights designated women's coaches, CCTV monitoring, and step-free wheelchair accessibility.
- Honest data notice: Clearly distinguishes static mapped stop positions from unverified real-time arrivals.

### 6. Women's Facilities & Essential Services
- Curated directory and map layers for:
  - Women's restrooms & Pink Toilets (with female attendant indicators)
  - Public accessible toilets
  - 24/7 Pharmacies with emergency medical supplies
  - Hospitals & Acute Trauma OPDs
  - Police Stations with 24/7 Women Assistance Desks
  - Civil Assistance Kiosks
- "Get Directions" one-click action that automatically populates the route destination.

### 7. Family Journey Companion
- Consent-based, user-controlled trip sharing.
- Select destination, ETA duration, and check-in frequency (e.g. Every 10 min).
- Select trusted contacts (Mother, Sister, Partner, Friends).
- "I'm OK" periodic check-in button with live countdown timer.
- "Arrived Safely" celebration confirmation.
- One-click shareable journey tracking link (`?journey=<token>`).
- Transparent prototype label clarifying local demo tracking vs. production remote SMS/push broadcasts.

### 8. Emergency Support (SOS)
- Accessible from any screen via the high-visibility SOS button.
- Instant connection to universal emergency services (112) and National Women's Helpline (1091).
- One-tap dialler for primary trusted emergency contact.
- "Instant GPS Broadcast" tool copying coordinates and map links to clipboard for messaging apps.
- Accidental trigger cancellation to prevent false alarms.

### 9. Smart Report Map & Civic Insights
- Audit dashboard for municipalities, ward committees, and commuter safety advocates.
- Streetlight health index percentage.
- Priority repair queue for unresolved dark stretches and broken pavements.
- Infrastructure coverage audit tracking mapped facilities across the city.

---

## 🎨 Nightbloom Design System & 3D WebGL Mode

HERPATH features the **Nightbloom** design system: aubergine ink, electric violet route, and champagne details. It delivers nocturnal luxury that stays crisp and legible under direct sunlight, paired with strict functional separation so routes, hazards, and emergency states never overlap.

### Design Tokens & Palette
- **Canvas:** `#F7F3EE` (warm, calm alabaster foundation avoiding harsh digital white glare)
- **Secondary Canvas:** `#EEE8E1` (structural segmentation)
- **Primary Ink Typography:** `#1E0F28` (deep aubergine primary text delivering 16.5:1 WCAG contrast on canvas and 18.2:1 on card)
- **Supporting Text:** `#5E5068` (7.4:1 contrast) and `#6F6179` (muted metadata)
- **Primary Brand / Selected Route:** `#5A2FC2` (Electric Violet, 6px polyline with 9px `#FFFFFF` casing, 6.3:1 contrast against map base)
- **Alternative Routes:** `#6E6090` (dashed slate with casing at ~60% opacity)
- **Control Boundaries:** `#867B72` (strictly compliant with WCAG 2.2 3:1 control boundary rule at 4.1:1 on white)
- **Emergency SOS:** `#C21428` (Crimson, strictly isolated to the emergency button and modal, 6.1:1 contrast on white)
- **Verified / Open:** `#1F6B4D` (tint: `#E6F3EC`)
- **Caution / Reports:** `#A8560A` (text: `#8A4A08`, tint: `#FDF2E3`)
- **Facility Markers:** Transit (`#1F5FA8`), Women's Facilities (`#8E2F7E`), Medical (`#0F766E`), Police (`#2B3A67`), Streetlights (`#8A6A10`), each encoded with color, distinct shape, and white glyph icon.
- **Typography:** `Fraunces` (warm variable serif for headlines and large route durations) and `Plus Jakarta Sans` (for clean interface UI), with `tabular-nums` for all ETAs and distances.

### Spatial Architecture & 3D City Mode
- **Full-Bleed Map Canvas:** Map fills the entire viewport behind a floating 440px desktop card panel (`top-4 left-4 bottom-4`, `rounded-[20px]`, `border border-border`, `shadow-e2`).
- **Carto Positron Muted Basemap:** Desaturated neutral basemap eliminates POI clutter, allowing violet corridors and infrastructure markers to command visual hierarchy.
- **3D City Extrusion Mode:** Integrated MapLibre GL toggle rendering 3D building extrusions at 55° pitch with real route geometry and interactive markers, with Leaflet 2D as rock-solid default and fallback.
- **Mobile Bottom Sheet:** 3-snap sheet (`peek` ~80px, `half` ~52vh, `full` ~86vh) with tactile handle, keeping the map visible and accessible.
- **Accessible Motion:** All animations respect `prefers-reduced-motion: reduce` for instant state changes. No transition delays emergency or navigation actions.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.7+ (Strict mode)
- **Styling:** Tailwind CSS 3.4 with custom glassmorphism utilities (`glass-surface`, `glass-dock`, `glass-sheet`)
- **Maps & GIS:** React Leaflet 4.2 + Leaflet 1.9 with OpenStreetMap tiles and custom HTML DivIcons
- **Icons:** Lucide React
- **Validation:** Zod
- **Data Layer:** Dual-mode repository:
  - **Local Mode (Default):** Zero-setup localStorage repository with custom event bus reactivity.
  - **Remote Mode (Configurable):** Supabase PostgreSQL database with Row Level Security (RLS) policies.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+ (tested on Node v24)
- npm or pnpm

### Installation

```bash
# Clone or navigate to the repository folder
cd HerPath

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Next.js development server
npm run dev

# Open in your browser:
# http://localhost:3000
```

### Production Build & Launch

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Running Automated Tests & Typechecks

```bash
# Run unit and integration test suite (20 automated assertions)
npm test

# Run strict TypeScript typecheck
npm run typecheck
```

---

## 🗄️ Database Schema & Supabase Setup (Optional)

HERPATH runs out-of-the-box in local demo mode without needing any external credentials.

To connect your own persistent Supabase database:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Enter your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Open your Supabase Project SQL Editor and execute `supabase/schema.sql`. This sets up:
   - `community_reports`
   - `streetlight_reports`
   - `facilities`
   - `transport_stops`
   - `journey_sessions`
   - `journey_checkins`
   - Row Level Security (RLS) access policies.

---

## 🛡️ Data Quality, Trust & Transparency Policy

HERPATH strictly enforces clear data provenance badges:
- **Live Telemetry:** Automated feeds from connected smart sensors.
- **Verified Civic:** Officially verified records from municipalities.
- **Community Report:** Observations submitted and corroborated by commuters.
- **Unverified:** Newly submitted observations awaiting corroboration.
- **Outdated (>24h):** Expired or stale reports that may no longer reflect current ground conditions.
- **Demo Preset:** Simulated data points clearly tagged for prototype demonstration.
- **Status Unknown:** Segments lacking recent data—honestly identified to prevent false assumptions.

---

## 📋 Acceptance Criteria Verification Summary

| Requirement | Status | Verification Detail |
|---|---|---|
| Application boots & serves HTTP 200 | ✅ Verified | Next.js server ready in 339ms; verified via HTTP probe |
| Production build succeeds | ✅ Verified | Static pages prerendered with zero errors (`npm run build`) |
| Strict TypeScript compilation | ✅ Verified | `npm run typecheck` passes with zero type errors |
| Automated test suite | ✅ Verified | 20 unit & integration test cases pass (`npm test`) |
| Interactive OpenStreetMap map | ✅ Verified | Dynamic Leaflet canvas with custom markers & layer toggles |
| Route comparison (Fastest/Balanced/Supported) | ✅ Verified | Factor-by-factor engine with explainable metrics |
| Streetlight & road condition reporting | ✅ Verified | Submission modal + working/malfunctioning/resolved status |
| Women's facilities & essential services | ✅ Verified | Pink restrooms, 24/7 pharmacies, police help desks with filters |
| Family journey companion | ✅ Verified | Live check-in countdown, ETA tracking, and "I'm OK" logging |
| Emergency SOS access | ✅ Verified | Direct 112/1091 dialler, trusted contact call, GPS coordinates copy |
| Responsive desktop & mobile views | ✅ Verified | Desktop split pane + mobile bottom nav bar |

---

## ⚖️ License & Ethical Commitment

HERPATH is developed to empower commuter freedom and safety through open, transparent, and respectful technology.
