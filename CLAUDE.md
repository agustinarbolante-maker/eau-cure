# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Eau Cure** is a water station delivery tracking application for managing delivery records, billing, and company data. It features a dual-mode architecture: can run as either a Node.js web server or an Electron desktop application.

## Architecture

The app uses a **separate frontend/backend model**:

- **Backend**: Express server (port 3000) with SQLite database
- **Frontend**: Vanilla JS + HTML/CSS in `/public` (served by Express)
- **Desktop Wrapper**: Electron spawns the Express server as a child process and loads the web UI

### Key Files

- `server.js` — Express app, API endpoints, database initialization, auto-backup scheduling
- `database.js` — SQLite operations, company seeding (50+ predefined water delivery companies), backup/restore logic
- `main.js` — Electron entry point, window management, menu, server lifecycle
- `preload.js` — Electron security bridge
- `public/app.js` — Frontend state/UI logic (fetch API calls, DOM updates)
- `public/index.html` — HTML structure

### Database Schema

Three SQLite tables:

- **companies**: `id, name (unique), unit_price`
- **deliveries**: `id, company, bottles_delivered, bottles_returned, dr_number, timestamp`
- **billing_statements**: `id, company_name, start_date, end_date, total_amount, is_paid, created_date, paid_date`

## Commands

```bash
npm install               # Install dependencies
npm start                 # Run Electron desktop app (spawns server + window)
npm run dev              # Run Electron in dev mode (opens DevTools)
npm run server           # Run Express server standalone (no Electron)
npm run build            # Build Windows installer + portable exe (NSIS)
```

## Development Notes

- **Dual startup**: When running Electron (`npm start`), `main.js` spawns a child Node process for `server.js`. Both must coordinate; 2-second delay allows server to boot before window loads.
- **Backup strategy**: Auto-backup runs on server startup and every 24 hours, stored in `data/backups/`. Retention: 30 days.
- **Company list**: Database seeds ~50 predefined companies with unit prices (mostly ₱17, some ₱18–20). New companies can be added via POST `/api/companies`.
- **Billing statements**: Separate from deliveries; tracks invoices with `is_paid` flag and timestamps. Calculated from delivery records by date range + unit price.
- **CSV export**: GET `/api/deliveries/export/csv` exports filtered/all deliveries.

## API Endpoints (via server.js)

**Companies:**
- `GET /api/companies` → array of company names
- `GET /api/companies/all` → array of company objects (name + unit_price)
- `POST /api/companies` → body: `{name, unitPrice}`

**Deliveries:**
- `GET /api/deliveries` → all deliveries; supports query filters: `?company=X&startDate=Y&endDate=Z`
- `POST /api/deliveries` → body: `{company, bottlesDelivered, bottlesReturned, drNumber, timestamp?}`
- `PUT /api/deliveries/:id` → update delivery
- `DELETE /api/deliveries/:id` → delete delivery
- `GET /api/deliveries/export/csv` → CSV download

**Billing:**
- `GET /api/billing/:company?startDate=X&endDate=Y` → calculated bill (deliveries × unit price)
- `POST /api/billing-statements` → save invoice; body: `{company, startDate, endDate, totalAmount}`
- `GET /api/billing-statements` → all invoices
- `PUT /api/billing-statements/:id` → mark paid; body: `{isPaid: true/false}`
- `DELETE /api/billing-statements/:id` → delete invoice

**Stats:**
- `GET /api/stats?startDate=X&endDate=Y` → aggregate delivery stats
- `GET /api/stats/companies?startDate=X&endDate=Y` → per-company stats

**Backups:**
- `POST /api/backups` → create backup now
- `GET /api/backups` → list backup files
- `POST /api/backups/restore/:filename` → restore from backup
- `GET /api/backups/download/:filename` → download backup file

## Frontend State

`public/app.js` manages:
- Company dropdown (fetched from server)
- Delivery form + table (CRUD via API)
- Billing statement UI (modal, invoice PDF/display)
- Export to CSV
- Backup/restore management

No build step; frontend is plain JS loaded directly by the browser.

## Electron Build

`electron-builder` config in `package.json` targets Windows (NSIS installer + portable). Reads `build.files` to bundle app; includes `main.js`, `server.js`, `database.js`, `public/**`, and `node_modules/**`.

## Git Workflow

**Commit discipline is critical.** As you make changes:

1. **Commit frequently** — After completing a feature, fixing a bug, or making meaningful progress, commit immediately
2. **Use clear commit messages** — Follow this format:
   ```
   Brief one-line summary of what changed

   Longer explanation if needed. What problem did this solve? Why this approach?
   ```
   Examples:
   - `Fix billing status refresh on update` (bug fix)
   - `Add CSV export for delivery records` (feature)
   - `Update backup retention to 30 days` (change)

3. **Push to GitHub regularly** — Never let local commits accumulate; push to `main` after each meaningful commit
   ```bash
   git add <files>
   git commit -m "message"
   git push origin main
   ```

**Why this matters:** 
- Preserves work history and prevents loss if machine crashes
- Allows reverting specific changes if needed
- Keeps GitHub as the source of truth
- Makes it easy for future Claude instances to understand what was done and why

**Before starting work:**
```bash
git status          # Check for uncommitted changes
git log --oneline -5  # Review recent commits
```

## Common Workflows

**Add a delivery programmatically:**
```
POST /api/deliveries
{
  "company": "HRD",
  "bottlesDelivered": 10,
  "bottlesReturned": 5,
  "drNumber": "DR-001"
}
```

**Generate a billing statement:**
```
GET /api/billing/HRD?startDate=2026-01-01&endDate=2026-01-31
→ auto-calculates bottles × unit_price
→ POST result to /api/billing-statements to save invoice
```

**Export data:**
```
GET /api/deliveries/export/csv?company=HRD&startDate=2026-01-01&endDate=2026-01-31
→ CSV file download
```
