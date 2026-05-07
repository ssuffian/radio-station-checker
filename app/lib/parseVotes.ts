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
