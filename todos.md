# MatatuMind - TODOS
Team: Deez Nerdz
Members: PH (Frontend Lead), Ryan (ML/Optimization), Emmanuel (UX/Driver Flow), Joe (Product / Demo Story), Kevin (Backend / DevOps)


--- PRIORITY: MUST FOR MVP ---
These must be done to have a functioning hackathon demo.

## 🎯 UPDATED PRIORITY ORDER (2024-12-25)
**API Architecture Decision: REST (using Next.js API routes + mock data)**

### CRITICAL PATH (Complete in order):
1. **Backend API** (Critical for demo) - Kevin
2. **Route optimization engine** (Core feature) - Ryan  
3. **Charging scheduler** (Key differentiator) - Ryan, Kevin

---

1) Project Bootstrapping (PH, Joe, Kevin) - owner: PH ✅ COMPLETED
   - ✅ Create repo + branches: main, dev.
   - ✅ Add README.md, project_requirements.txt, todos.md.
   - ✅ Create initial issue board (GitHub Projects or Trello).
   - ✅ Create environment variables template (.env.example).

2) Frontend App Skeleton (Joe) ✅ COMPLETED
   - ✅ Choose framework: Next.js (preferred) OR Vue 3 + Vite.
   - ✅ Initialize project with Tailwind CSS and routing.
   - ✅ Create core pages: /dashboard, /driver, /investor, /simulate.
   - ✅ Implement layout: left controls + right map. Include placeholder components for VehicleList, ChargerList, SchedulerPanel.
   - ✅ Acceptance: npm run dev shows blank UI with placeholder map and side panel.

3) Map Integration (Joe, Emmanuel) ✅ COMPLETED
   - ✅ Integrate Mapbox GL or Leaflet + OSM.
   - ✅ Render mock map centered on Nairobi coordinates.
   - ✅ Add map layer for vehicle markers and charger markers from local JSON.
   - ✅ Acceptance: markers render; clicking marker shows a small info popup.

4) Backend API (Kevin) 🔥 PRIORITY #1
   - [ ] **CRITICAL**: Implement Next.js API routes with REST endpoints:
       - GET /api/vehicles -> returns vehicle list (from mockData.ts)
       - GET /api/chargers -> returns charger list (from mockData.ts)
       - POST /api/sim/run -> starts simulation (server-side or client-side)
       - POST /api/scheduler -> accepts current statuses and returns schedule
       - POST /api/route -> returns optimized route for a pair
   - [ ] **CRITICAL**: Connect frontend components to API endpoints
   - [ ] **CRITICAL**: Replace direct mockData imports with API calls
   - Acceptance: Frontend fetches data from API endpoints, not direct imports.

5) Data Simulator (Kevin, Ryan)
   - [ ] Create /sim/data_gen.js (or Python) that emits:
       - vehicle positions over time
       - charger availability changes
       - trip requests (origin, dest)
   - [ ] Provide sample presets: rush_hour_brownout.json, normal_day.json
   - Acceptance: simulator can emit JSON logs and feed backend API.

6) Route Optimization Engine (Ryan) 🔥 PRIORITY #2
   - [ ] **CRITICAL**: Implement A*/Dijkstra algorithm for route optimization
   - [ ] **CRITICAL**: Add congestion factor: multiply segment_time by (1 + congestion_factor)
   - [ ] **CRITICAL**: Return route geometry + ETA + distance
   - [ ] **CRITICAL**: Integrate with /api/route endpoint
   - [ ] **CRITICAL**: Support real-time rerouting based on traffic conditions
   - Acceptance: /api/route returns optimized route with ETA that adapts to congestion.

7) Charging Scheduler Algorithm (Ryan, Kevin) 🔥 PRIORITY #3
   - [ ] **CRITICAL**: Implement greedy priority queue scheduler:
       - Inputs: vehicle soc, next_dispatch, charger capacity, grid_status
       - Output: assignments with start/end times
   - [ ] **CRITICAL**: Implement grid constraint logic (brownout => reduce concurrent chargers)
   - [ ] **CRITICAL**: Add priority scoring: criticality_score = w1 * (1 - soc) + w2 * time_to_next_dispatch
   - [ ] **CRITICAL**: Integrate with /api/scheduler endpoint
   - [ ] **CRITICAL**: Support dynamic rescheduling based on grid status changes
   - Acceptance: /api/scheduler returns feasible schedule that adapts to grid conditions.

8) Dashboard Integration (Joe, Kevin)
   - [ ] Poll /api/vehicles and /api/chargers.
   - [ ] Display table and map; show charging queue.
   - [ ] Add "Smart Scheduler" button that calls /api/scheduler and updates UI.
   - Acceptance: clicking scheduler updates UI and map reflects scheduled charging windows.

9) Driver View (Emmanuel)
   - [ ] Mobile-ready page showing single vehicle: route, next charger suggestion, alerts.
   - [ ] Implement accept/reject reroute action that logs to simulation.
   - Acceptance: driver accepts reroute -> map and vehicle position update.

10) Simulation Presets & Demo Scenarios (PH, Kevin)
    - [ ] Implement 3 preset scenarios and UI control to run them.
    - [ ] Logging: create a visible event timeline on the dashboard.
    - Acceptance: presets run end-to-end and produce reproducible results.

11) Investor Heatmap & ROI (Emmanuel, PH)
    - [ ] Implement heatmap layer derived from trip density.
    - [ ] Simple ROI popup: candidate location -> show estimated utilization and simple payback calc (mock numbers).
    - Acceptance: clicking hot-spot shows ROI modal.

12) Demo Recording & Script (PH)
    - [ ] Prepare 3-4 minute recorded demo (backup) and 5-minute live demo script (docs/demo_playbook.md).
    - Acceptance: demo script matches preset scenarios and is rehearsed.

--- NICE TO HAVE (only after MUST tasks) ---
13) Battery health projection (Ryan)
    - [ ] Implement simple model projecting capacity loss over months using temp & cycles.
    - Acceptance: Vehicle modal shows projection chart.

14) Real-time updates (socket.io) (Kevin)
    - [ ] Replace polling with websockets for smoother simulation.
    - Acceptance: map updates in realtime without manual refresh.

15) Small ML improvement (Ryan)
    - [ ] Train small regression for ETA adjustments using simulated historical data.
    - Acceptance: ETA predictions improve in simulation (compare before/after).

16) Tests & CI (Joe, Kevin)
    - [ ] Add Jest tests for scheduler and route engine.
    - [ ] Configure GitHub Actions: install, lint, test, build, deploy preview.
    - Acceptance: pipeline runs and deploys preview.

17) Polish UI (Emmanuel)
    - [ ] Add localization placeholders (EN/SW).
    - [ ] Improve contrast & large fonts for alerts.
    - Acceptance: UI accessible on mobile.

--- ASSIGNMENTS FOR HACKATHON SPRINTS ---
Sprint A (Friday evening) - get to a visible prototype
- PH: repo, demo script, scenario definitions.
- Joe: frontend skeleton + map + placeholder data.
- Kevin: API stubs + simulator presets.
- Ryan: simple route function & scheduler algorithm (local).
- Emmanuel: driver mobile mockups + basic components.

Sprint B (Friday late -> Saturday afternoon)
- Integrate scheduler with dashboard and driver view.
- Add one polished scenario (Rush hour Brownout).
- Prepare demo recording & deck slides.
- Quick polish: branding (MatatuMind logo), team slide.

Sprint C (Saturday evening)
- Run live demo + record backup.
- Add investor heatmap & ROI popup.
- Final bug fixes and deployment to Vercel/Netlify.

--- ACCEPTANCE CRITERIA FOR MVP ---
- Demonstrable dashboard with at least 6 simulated vehicles and 2 chargers.
- Working "Smart Scheduler" that alters charger queue and vehicle states.
- Driver view can accept a reroute suggestion.
- One preset scenario runs end-to-end and produces log entries.
- Project deployed to a public URL and a backup demo recording exists.

--- COMMUNICATION / ROLES DURING HACKATHON ---
- Standups: 3 quick check-ins (before starting, midnight, 3 hours before demo).
- Slack or Discord channel: create #matatumind
- PR flow: push to dev -> open PR to main. Merge only after someone reviews.

--- POST-HACK NOTES ---
- Save final commit hash and create release tag for demo.
- Bundle export of simulation logs and screenshots into /docs/demo_artifacts
- After hackathon, iterate on ML for routing & integrated telemetry ingestion.

