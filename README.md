# 🚐⚡ MatatuMind

**Smarter routes. Reliable rides. Greener cities.**  
MatatuMind is an AI-powered fleet optimization system for African public transport operators.  
It predicts traffic, optimizes routes, and schedules EV charging — helping operators save fuel, reduce emissions, and improve reliability.

---

## 🌍 Why MatatuMind?
African cities lose billions each year to traffic inefficiencies.  
- Matatu operators burn excess fuel idling in jams.  
- EV adoption is slowed by range anxiety and poor charging coordination.  
- Passengers lose valuable time stuck in unreliable commutes.  

MatatuMind directly tackles this:  
- **Route Optimization** → Reduce wasted fuel + time.  
- **Charging Scheduler** → Smart queue management for EV fleets.  
- **Fleet Dashboard** → Real-time visibility into vehicles, drivers, and revenue.

---

## Development Workflow

This project uses **enhanced dev server management** to prevent race conditions and optimize the development experience with Turbopack.

### Quick Start

```bash
# Recommended: Clean development start (prevents race conditions)
npm run dev:clean

# Alternative: Traditional dev server
npm run dev
```

### Enhanced Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev:clean` | **Recommended** - Clean start with race condition prevention |
| `npm run dev:stable` | Start with Turbopack disabled for maximum stability |
| `npm run dev:kill` | Emergency stop - kills all Next.js dev servers |
| `npm run dev:reset` | Clean caches only (keeps servers running) |
| `npm run dev:info` | Show project health and system information |
| `npm run dev:mjs` | Use Node.js version of the dev manager |

### Why Use Enhanced Commands?

**Race Condition Prevention** - No more corrupted `.next` directories  
**Port Conflict Resolution** - Automatic cleanup of conflicting processes  
**Turbopack Stability** - Smart handling of rapid rebuilds  
**Git Branch Integration** - Auto-cleanup when switching branches  
**Single Instance Enforcement** - Prevents multiple dev servers  

### Development Tips

- Use `npm run dev:clean` instead of `npm run dev` for daily development
- Git branch switches automatically clean caches (no manual intervention needed)
- If experiencing weird build issues, run `npm run dev:reset` to clean caches
- Check system health anytime with `npm run dev:info`
