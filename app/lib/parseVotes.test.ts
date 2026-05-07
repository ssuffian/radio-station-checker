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
