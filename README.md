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

## 🎨 Premium Light-Mode Glassmorphism Design System

HERPATH features a custom, high-craft design system tailored for daylight legibility, reassurance, and modern mobile aesthetics:

### Design Tokens & Palette
- **Main Canvas:** `#F6F8FC` (calm, airy neutral foundation avoiding harsh pure white glare)
- **Secondary Surface:** `#EEF2F8` (subtle structural separation)
- **Primary Cards & Modals:** `#FFFFFF` with `backdrop-blur-xl` frosted translucency
- **Typography:** `#172238` (deep navy primary) and `#66738A` (slate secondary) for WCAG AA/AAA contrast
- **Borders & Dividers:** `#E3E9F2` (delicate 1px structural framing)
- **Primary Brand Accents:** `#20B8A5` (Vibrant Teal), `#128C82` (Deep Teal), `#E4F8F3` (Soft Mint Surface)
- **Context Surfaces:** `#EAF1FF` (Soft Blue), `#EFEDFF` (Soft Lavender), `#FFF4E6` (Warm Caution)
- **Urgent Action / SOS:** `#D94F63` (Coral Urgent), `#BA3A4D` (Deep Coral)

### Mobile & Desktop Spatial Ergonomics
- **Desktop (≥ 1024px):** Dual-pane split architecture with a 460px frosted-glass control panel on the left and full-viewport interactive OpenStreetMap canvas on the right.
- **Mobile (< 1024px):** Map-first layout with a collapsible frosted glass bottom sheet (`rounded-t-[32px]`, `h-[72vh]`) offering minimize/expand toggles, ensuring seamless one-handed reachability.
- **Floating Bottom Dock:** Translucent glassmorphic pill bar (`h-16`, `shadow-float`, `rounded-full`) anchored above the navigation boundary with active mint indicator pills across 6 core views.
- **Custom Map DivIcons:** Crisp circular pin markers with diffuse drop-shadows and semantic outer glow rings (Teal for transit, Purple for women's amenities, Emerald for streetlights, Coral for alerts).

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
