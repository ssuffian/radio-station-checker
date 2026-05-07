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
  return d.toLocaleString('en-US', {
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
