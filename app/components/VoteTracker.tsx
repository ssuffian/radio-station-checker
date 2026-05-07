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
