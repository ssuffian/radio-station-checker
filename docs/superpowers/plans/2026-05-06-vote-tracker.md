# Q99FM Vote Tracker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js app on Vercel that displays live vote charts for the Q99FM poll, fed by a GitHub Action that polls the API every minute and commits rows to a CSV.

**Architecture:** A GitHub Action runs every 5 minutes and loops internally to append one CSV row per minute. The Next.js page (client component) fetches the raw CSV from GitHub on load and re-fetches every 60s, rendering two Recharts views: absolute totals and per-minute deltas.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Recharts, Vitest, GitHub Actions

---

## File Map

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript config |
| `next.config.ts` | Next.js config |
| `tailwind.config.ts` | Tailwind content paths |
| `postcss.config.js` | PostCSS for Tailwind |
| `vitest.config.ts` | Vitest test runner config |
| `app/globals.css` | Tailwind directives |
| `app/layout.tsx` | Root HTML layout, metadata |
| `app/page.tsx` | Server component shell |
| `app/components/VoteTracker.tsx` | Client component: fetch, state, auto-refresh |
| `app/components/VoteChart.tsx` | Client component: Recharts chart, toggle |
| `app/lib/parseVotes.ts` | Pure functions: CSV parsing + delta calculation |
| `app/lib/parseVotes.test.ts` | Vitest unit tests for parseVotes |
| `data/votes.csv` | Persisted poll data (committed to main) |
| `.github/workflows/poll-votes.yml` | GitHub Action: poll every minute, commit CSV |

---

### Task 1: Bootstrap Next.js project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `vitest.config.ts`
- Create: `app/globals.css`
- Create: `app/layout.tsx`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "radio-station-checker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^15.3.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "recharts": "^2.15.3"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5",
    "vitest": "^3.1.3",
    "happy-dom": "^17.4.4"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.ts**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

export default nextConfig
```

- [ ] **Step 4: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {} },
  plugins: [],
}

export default config
```

- [ ] **Step 5: Create postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
})
```

- [ ] **Step 7: Create app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Create app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Q99FM Poll Tracker',
  description: 'Live vote tracking for the Q99FM poll',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">{children}</body>
    </html>
  )
}
```

- [ ] **Step 9: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 10: Commit**

```bash
git add package.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.js vitest.config.ts app/globals.css app/layout.tsx
git commit -m "chore: bootstrap Next.js project"
```

---

### Task 2: CSV parsing utilities (TDD)

**Files:**
- Create: `app/lib/parseVotes.ts`
- Create: `app/lib/parseVotes.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `app/lib/parseVotes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseVotesCsv, calculateDeltas } from './parseVotes'

describe('parseVotesCsv', () => {
  it('parses header and two data rows', () => {
    const csv = [
      'timestamp,treble_chorale,bruin_singers,bel_canto',
      '2026-05-06T14:00:00Z,18242,7928,15648',
      '2026-05-06T14:01:00Z,18250,7930,15651',
    ].join('\n')

    const result = parseVotesCsv(csv)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      timestamp: '2026-05-06T14:00:00Z',
      treble_chorale: 18242,
      bruin_singers: 7928,
      bel_canto: 15648,
    })
    expect(result[1]).toEqual({
      timestamp: '2026-05-06T14:01:00Z',
      treble_chorale: 18250,
      bruin_singers: 7930,
      bel_canto: 15651,
    })
  })

  it('returns empty array for header-only CSV', () => {
    expect(parseVotesCsv('timestamp,treble_chorale,bruin_singers,bel_canto')).toHaveLength(0)
  })

  it('ignores trailing newlines', () => {
    const csv = 'timestamp,treble_chorale,bruin_singers,bel_canto\n2026-05-06T14:00:00Z,1,2,3\n'
    expect(parseVotesCsv(csv)).toHaveLength(1)
  })
})

describe('calculateDeltas', () => {
  it('calculates per-row deltas', () => {
    const rows = [
      { timestamp: '2026-05-06T14:00:00Z', treble_chorale: 18242, bruin_singers: 7928, bel_canto: 15648 },
      { timestamp: '2026-05-06T14:01:00Z', treble_chorale: 18250, bruin_singers: 7930, bel_canto: 15651 },
      { timestamp: '2026-05-06T14:02:00Z', treble_chorale: 18260, bruin_singers: 7935, bel_canto: 15655 },
    ]

    const deltas = calculateDeltas(rows)

    expect(deltas).toHaveLength(2)
    expect(deltas[0]).toEqual({
      timestamp: '2026-05-06T14:01:00Z',
      treble_chorale: 8,
      bruin_singers: 2,
      bel_canto: 3,
    })
    expect(deltas[1]).toEqual({
      timestamp: '2026-05-06T14:02:00Z',
      treble_chorale: 10,
      bruin_singers: 5,
      bel_canto: 4,
    })
  })

  it('returns empty array for fewer than 2 rows', () => {
    expect(calculateDeltas([])).toHaveLength(0)
    expect(calculateDeltas([{ timestamp: 't', treble_chorale: 1, bruin_singers: 1, bel_canto: 1 }])).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './parseVotes'`

- [ ] **Step 3: Implement parseVotes.ts**

Create `app/lib/parseVotes.ts`:

```typescript
export type VoteRow = {
  timestamp: string
  treble_chorale: number
  bruin_singers: number
  bel_canto: number
}

export function parseVotesCsv(csv: string): VoteRow[] {
  const lines = csv.trim().split('\n')
  return lines.slice(1).filter(Boolean).map((line) => {
    const [timestamp, treble_chorale, bruin_singers, bel_canto] = line.split(',')
    return {
      timestamp,
      treble_chorale: parseInt(treble_chorale, 10),
      bruin_singers: parseInt(bruin_singers, 10),
      bel_canto: parseInt(bel_canto, 10),
    }
  })
}

export function calculateDeltas(rows: VoteRow[]): VoteRow[] {
  if (rows.length < 2) return []
  return rows.slice(1).map((row, i) => ({
    timestamp: row.timestamp,
    treble_chorale: row.treble_chorale - rows[i].treble_chorale,
    bruin_singers: row.bruin_singers - rows[i].bruin_singers,
    bel_canto: row.bel_canto - rows[i].bel_canto,
  }))
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/parseVotes.ts app/lib/parseVotes.test.ts
git commit -m "feat: add CSV parsing and delta utilities"
```

---

### Task 3: VoteChart component

**Files:**
- Create: `app/components/VoteChart.tsx`

- [ ] **Step 1: Create VoteChart.tsx**

```tsx
'use client'
import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { VoteRow } from '../lib/parseVotes'

type View = 'totals' | 'permin'

interface VoteChartProps {
  totalsData: VoteRow[]
  deltaData: VoteRow[]
}

const COLORS = {
  treble_chorale: '#60a5fa',
  bruin_singers: '#f59e0b',
  bel_canto: '#34d399',
}

const LABELS: Record<string, string> = {
  treble_chorale: 'Treble Chorale',
  bruin_singers: 'Bruin Singers',
  bel_canto: 'Bel Canto 2026',
}

function formatTs(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function VoteChart({ totalsData, deltaData }: VoteChartProps) {
  const [view, setView] = useState<View>('totals')

  const activeData = view === 'totals' ? totalsData : deltaData

  if (activeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        {view === 'permin' && totalsData.length < 2
          ? 'Not enough data yet for rate view'
          : 'Loading data…'}
      </div>
    )
  }

  const chartData = activeData.map((row) => ({ ...row, time: formatTs(row.timestamp) }))

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(['totals', 'permin'] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              view === v
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {v === 'totals' ? 'Totals' : 'Per Min'}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f9fafb' }}
          />
          <Legend formatter={(value) => LABELS[value] ?? value} />
          <Line type="monotone" dataKey="treble_chorale" stroke={COLORS.treble_chorale} dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="bruin_singers" stroke={COLORS.bruin_singers} dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="bel_canto" stroke={COLORS.bel_canto} dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/VoteChart.tsx
git commit -m "feat: add VoteChart component with totals/per-min toggle"
```

---

### Task 4: VoteTracker client component and main page

**Files:**
- Create: `app/components/VoteTracker.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Create VoteTracker.tsx**

```tsx
'use client'
import { useEffect, useState } from 'react'
import VoteChart from './VoteChart'
import { parseVotesCsv, calculateDeltas, type VoteRow } from '../lib/parseVotes'

const CSV_URL =
  'https://raw.githubusercontent.com/ssuffian/radio-station-checker/main/data/votes.csv'

export default function VoteTracker() {
  const [totalsData, setTotalsData] = useState<VoteRow[]>([])
  const [deltaData, setDeltaData] = useState<VoteRow[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    try {
      const res = await fetch(`${CSV_URL}?t=${Date.now()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const csv = await res.text()
      const rows = parseVotesCsv(csv)
      setTotalsData(rows)
      setDeltaData(calculateDeltas(rows))
      setLastUpdated(new Date())
      setError(null)
    } catch {
      setError('Could not load data — retrying in 60s')
    }
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold">Q99FM Poll Tracker</h1>
        {lastUpdated && (
          <span className="text-sm text-gray-400">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && (
        <p className="text-red-400 mb-4 text-sm">{error}</p>
      )}

      <VoteChart totalsData={totalsData} deltaData={deltaData} />
    </div>
  )
}
```

- [ ] **Step 2: Create app/page.tsx**

```tsx
import VoteTracker from './components/VoteTracker'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <VoteTracker />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: page loads, shows "Loading data…" then the chart renders (no data yet, but no crashes).

Stop the dev server (`Ctrl+C`).

- [ ] **Step 4: Commit**

```bash
git add app/components/VoteTracker.tsx app/page.tsx
git commit -m "feat: add VoteTracker client component and main page"
```

---

### Task 5: Seed data/votes.csv

**Files:**
- Create: `data/votes.csv`

- [ ] **Step 1: Create initial CSV with header and one real data row**

Fetch the current vote counts:

```bash
curl -s "https://q99fm.com/api/v1/polls?ids=3936_7047"
```

Note the values for options `47295`, `47296`, `47297`. Then create `data/votes.csv`:

```
timestamp,treble_chorale,bruin_singers,bel_canto
```

(Header only is fine — the action will append real rows. Alternatively include one bootstrap row:)

```bash
RESPONSE=$(curl -s "https://q99fm.com/api/v1/polls?ids=3936_7047")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TREBLE=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['data']['3936_7047']['options']['47295'])")
BRUIN=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['data']['3936_7047']['options']['47296'])")
BEL=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['data']['3936_7047']['options']['47297'])")
printf "timestamp,treble_chorale,bruin_singers,bel_canto\n$TIMESTAMP,$TREBLE,$BRUIN,$BEL\n" > data/votes.csv
```

- [ ] **Step 2: Commit**

```bash
git add data/votes.csv
git commit -m "chore: seed votes CSV with header"
```

---

### Task 6: GitHub Action

**Files:**
- Create: `.github/workflows/poll-votes.yml`

- [ ] **Step 1: Create .github/workflows/poll-votes.yml**

```yaml
name: Poll Votes

on:
  schedule:
    - cron: '*/5 * * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  poll:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Poll and record votes (5 iterations × 60s)
        run: |
          for i in 1 2 3 4 5; do
            RESPONSE=$(curl -sf "https://q99fm.com/api/v1/polls?ids=3936_7047" || echo "")
            if [ -n "$RESPONSE" ]; then
              TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
              TREBLE=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['data']['3936_7047']['options']['47295'])" 2>/dev/null || echo "0")
              BRUIN=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['data']['3936_7047']['options']['47296'])" 2>/dev/null || echo "0")
              BEL=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['data']['3936_7047']['options']['47297'])" 2>/dev/null || echo "0")
              echo "$TIMESTAMP,$TREBLE,$BRUIN,$BEL" >> data/votes.csv
              echo "[$i/5] Recorded: $TIMESTAMP - Treble=$TREBLE Bruin=$BRUIN BelCanto=$BEL"
            else
              echo "[$i/5] API fetch failed, skipping"
            fi
            if [ "$i" -lt 5 ]; then sleep 60; fi
          done

      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git pull --rebase origin main
          git add data/votes.csv
          git diff --cached --quiet && echo "No new rows to commit" && exit 0
          git commit -m "chore: append vote data [skip ci]"
          git push origin main
```

- [ ] **Step 2: Push to GitHub and verify**

```bash
git add .github/workflows/poll-votes.yml
git commit -m "feat: add GitHub Action to poll votes every minute"
git push origin main
```

Go to `https://github.com/ssuffian/radio-station-checker/actions` and manually trigger the workflow (`workflow_dispatch`) to verify it appends rows and commits successfully.

Check `data/votes.csv` on GitHub after the run — it should have 5 new rows.

---

### Task 7: Deploy to Vercel

- [ ] **Step 1: Link and deploy**

If Vercel CLI is available:

```bash
vercel --prod
```

Follow prompts to link to your Vercel account. Select: framework = Next.js, root = `.`, no overrides needed.

Alternatively, go to [vercel.com/new](https://vercel.com/new), import `ssuffian/radio-station-checker`, and deploy with default settings.

- [ ] **Step 2: Verify deployed page**

Open the production URL. The chart should load within a few seconds (fetches from raw GitHub). Confirm:
- Both "Totals" and "Per Min" toggles work
- "Updated HH:MM:SS" timestamp appears
- No console errors

- [ ] **Step 3: Confirm GitHub Action continues running**

After 10 minutes, check `data/votes.csv` on GitHub. It should have grown by ~10 rows.
