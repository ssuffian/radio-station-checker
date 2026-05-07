# Q99FM Poll Vote Tracker — Design Spec

**Date:** 2026-05-06  
**Poll:** `3936_7047` — closes 2026-05-11  
**Endpoint:** `https://q99fm.com/api/v1/polls?ids=3936_7047`

---

## Overview

A Next.js app deployed on Vercel that tracks and visualizes vote counts over time for a three-way Q99FM radio poll. A GitHub Action polls the API every minute and appends rows to a CSV file committed to `main`. The Vercel page fetches the CSV directly from GitHub on load and auto-refreshes every 60 seconds, rendering two chart views via Recharts.

---

## Poll Options

| API ID | Label |
|--------|-------|
| 47295 | William Byrd High School Treble Chorale |
| 47296 | Bruin Singers |
| 47297 | Bel Canto 2026 |

---

## Data Collection

### GitHub Action

- **Schedule:** `*/5 * * * *` (every 5 minutes, GitHub's minimum cron interval)
- **Minute-level granularity:** The action loops 5 times internally, sleeping 60 seconds between iterations. Each iteration fetches the API and appends one row, giving true per-minute data.
- **File:** `.github/workflows/poll-votes.yml`
- **Permissions:** `contents: write` to commit and push CSV updates
- **Commit strategy:** One commit per action run (after all 5 rows are appended), using `[skip ci]` in the commit message to avoid triggering Vercel deployments.

### CSV File

- **Path:** `data/votes.csv`
- **Format:**

```
timestamp,treble_chorale,bruin_singers,bel_canto
2026-05-06T14:00:00Z,18242,7928,15648
2026-05-06T14:01:00Z,18250,7930,15651
```

- Timestamps are UTC ISO 8601.
- The file is bootstrapped with a header row on first run if it doesn't exist.

---

## Frontend

### Stack

- **Framework:** Next.js (App Router)
- **Charts:** Recharts (`LineChart`, `ResponsiveContainer`)
- **Styling:** Tailwind CSS

### Page: `app/page.tsx`

- Server component shell; chart area is a `"use client"` component.
- On mount, fetches the raw CSV from GitHub (`https://raw.githubusercontent.com/ssuffian/radio-station-checker/main/data/votes.csv`).
- Parses CSV rows into an array of `{ timestamp, treble_chorale, bruin_singers, bel_canto }`.
- Derives a second dataset: per-minute deltas (difference between consecutive rows for each option).
- Passes both datasets to `VoteChart`.
- Re-fetches every 60 seconds via `setInterval`.
- Shows last-updated timestamp.

### Component: `app/components/VoteChart.tsx`

- Accepts `totalsData` and `deltaData` props.
- Toggle button switches between "Totals" and "Per Min" views.
- Both views use `LineChart` with one line per option (3 lines, distinct colors).
- X-axis: formatted timestamp. Y-axis: vote count or delta count.
- Legend labels: "Treble Chorale", "Bruin Singers", "Bel Canto 2026".

---

## Error Handling

- If the CSV fetch fails, show an inline error message ("Could not load data — retrying in 60s").
- If the CSV has fewer than 2 rows, the "Per Min" view shows a message ("Not enough data yet for rate view").
- The GitHub Action logs failures but does not fail the workflow on a single failed poll — it continues to the next iteration.

---

## File Structure

```
data/
  votes.csv
.github/
  workflows/
    poll-votes.yml
app/
  page.tsx
  components/
    VoteChart.tsx
docs/
  superpowers/
    specs/
      2026-05-06-vote-tracker-design.md
next.config.ts
tailwind.config.ts
package.json
```

---

## Out of Scope

- Authentication / private repo handling
- Historical backfill before the action starts
- Mobile-specific layout optimizations
- Exporting or downloading the CSV from the UI
